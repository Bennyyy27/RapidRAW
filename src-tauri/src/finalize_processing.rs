use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::AppState;
use crate::export_processing::{ExportAdjustmentsMode, ExportSettings, export_images_impl};
use crate::file_management::{
    AlbumItem, find_all_associated_files, get_albums, parse_virtual_path, sync_album_path_changes,
};
use crate::formats::is_raw_file;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FinalizeResult {
    raw_path: String,
    jpeg_path: String,
    journal_path: String,
}

#[derive(Serialize, Deserialize)]
struct FinalizeJournal {
    version: u8,
    phase: String,
    raw_path: String,
    jpeg_path: String,
}

fn write_journal(path: &Path, journal: &FinalizeJournal) -> Result<(), String> {
    let temporary = path.with_extension("json.tmp");
    let data = serde_json::to_vec_pretty(journal).map_err(|e| e.to_string())?;
    fs::write(&temporary, data).map_err(|e| e.to_string())?;
    fs::rename(&temporary, path).map_err(|e| e.to_string())
}

fn validate_jpeg(path: &Path) -> Result<(), String> {
    let reader = image::ImageReader::open(path)
        .map_err(|e| format!("Final JPEG cannot be opened: {e}"))?
        .with_guessed_format()
        .map_err(|e| format!("Final JPEG format cannot be detected: {e}"))?;
    if reader.format() != Some(image::ImageFormat::Jpeg) {
        return Err("Final output is not a JPEG.".to_string());
    }
    let (width, height) = reader
        .into_dimensions()
        .map_err(|e| format!("Final JPEG dimensions cannot be read: {e}"))?;
    if width == 0 || height == 0 {
        return Err("Final JPEG has invalid dimensions.".to_string());
    }
    Ok(())
}

fn sidecar_for(path: &Path) -> Result<PathBuf, String> {
    let filename = path
        .file_name()
        .ok_or_else(|| "Image has no filename.".to_string())?
        .to_string_lossy();
    Ok(path.with_file_name(format!("{filename}.rrdata")))
}

fn album_membership_count(nodes: &[AlbumItem], path: &str) -> usize {
    nodes
        .iter()
        .map(|node| match node {
            AlbumItem::Album { images, .. } => {
                images.iter().filter(|image| image.as_str() == path).count()
            }
            AlbumItem::Group { children, .. } => album_membership_count(children, path),
        })
        .sum()
}

#[tauri::command]
pub async fn finalize_raw_prepare(
    raw_path: String,
    current_edit_adjustments: Option<Value>,
    base_origin_folders: Vec<String>,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<FinalizeResult, String> {
    if raw_path.contains("?vc=") {
        return Err("Finalize RAW does not yet support virtual copies.".to_string());
    }
    let (source, source_sidecar) = parse_virtual_path(&raw_path);
    if !source.is_file() || !is_raw_file(&source) {
        return Err("Finalize RAW requires one existing RAW file.".to_string());
    }

    let parent = source
        .parent()
        .ok_or_else(|| "RAW has no parent folder.".to_string())?;
    let stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "RAW has no valid filename.".to_string())?;
    let final_path = parent.join(format!("{stem}.jpg"));
    if final_path.exists() {
        return Err(format!(
            "A finalized JPEG already exists: {}",
            final_path.display()
        ));
    }

    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    let temporary_path = parent.join(format!(".{stem}.finalizing-{nonce}.jpg"));
    let journal_path = parent.join(format!(".{stem}.rapidraw-finalize.json"));
    let mut journal = FinalizeJournal {
        version: 1,
        phase: "rendering".to_string(),
        raw_path: source.to_string_lossy().into_owned(),
        jpeg_path: final_path.to_string_lossy().into_owned(),
    };
    write_journal(&journal_path, &journal)?;

    let export_settings = ExportSettings {
        jpeg_quality: 100,
        resize: None,
        keep_metadata: true,
        preserve_timestamps: true,
        strip_gps: false,
        filename_template: Some("{original_filename}".to_string()),
        watermark: None,
        export_masks: false,
        preserve_folders: false,
    };
    let (tx, rx) = tokio::sync::oneshot::channel();
    if let Err(error) = export_images_impl(
        vec![raw_path.clone()],
        temporary_path.to_string_lossy().into_owned(),
        true,
        base_origin_folders,
        export_settings,
        "jpg".to_string(),
        ExportAdjustmentsMode::UseSidecars {
            active_path: Some(source.to_string_lossy().into_owned()),
            active_adjustments: current_edit_adjustments,
        },
        state,
        app_handle.clone(),
        Some(tx),
    )
    .await
    {
        let _ = fs::remove_file(&journal_path);
        return Err(error);
    }
    match rx.await {
        Ok(Ok(())) => {}
        Ok(Err(count)) => {
            return Err(format!(
                "JPEG rendering failed ({count} export error). RAW was retained."
            ));
        }
        Err(error) => {
            return Err(format!(
                "JPEG rendering did not complete: {error}. RAW was retained."
            ));
        }
    }

    validate_jpeg(&temporary_path)?;
    fs::rename(&temporary_path, &final_path)
        .map_err(|e| format!("Could not place final JPEG: {e}"))?;

    let final_sidecar = sidecar_for(&final_path)?;
    if source_sidecar.exists() {
        let mut metadata = crate::exif_processing::load_sidecar(&source_sidecar);
        metadata.adjustments = Value::Null;
        let mut provenance = metadata.exif.take().unwrap_or_default();
        provenance.insert(
            "RapidRAW:FinalizedFrom".to_string(),
            source.to_string_lossy().into_owned(),
        );
        metadata.exif = Some(provenance);
        let sidecar_temp = final_sidecar.with_extension("rrdata.tmp");
        let data = serde_json::to_vec_pretty(&metadata).map_err(|e| e.to_string())?;
        fs::write(&sidecar_temp, data).map_err(|e| e.to_string())?;
        fs::rename(&sidecar_temp, &final_sidecar).map_err(|e| e.to_string())?;
    }

    let old_path = source.to_string_lossy().into_owned();
    let new_path = final_path.to_string_lossy().into_owned();
    let memberships_before = album_membership_count(&get_albums(app_handle.clone())?, &old_path);
    let renames = HashMap::from([(old_path.clone(), new_path.clone())]);
    if let Err(error) = sync_album_path_changes(&app_handle, Some(&renames), None, None) {
        let _ = fs::remove_file(&final_sidecar);
        let _ = fs::remove_file(&final_path);
        return Err(format!(
            "Album transfer failed; finalized files were rolled back: {error}"
        ));
    }

    let persisted_albums = get_albums(app_handle.clone())?;
    let old_memberships = album_membership_count(&persisted_albums, &old_path);
    let new_memberships = album_membership_count(&persisted_albums, &new_path);
    if old_memberships != 0 || new_memberships != memberships_before {
        let rollback = HashMap::from([(new_path.clone(), old_path.clone())]);
        let _ = sync_album_path_changes(&app_handle, Some(&rollback), None, None);
        let _ = fs::remove_file(&final_sidecar);
        let _ = fs::remove_file(&final_path);
        return Err(
            "Album transfer verification failed; finalized files were rolled back.".to_string(),
        );
    }

    validate_jpeg(&final_path)?;
    journal.phase = "prepared".to_string();
    write_journal(&journal_path, &journal)?;
    Ok(FinalizeResult {
        raw_path: old_path,
        jpeg_path: new_path,
        journal_path: journal_path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
pub fn finalize_raw_dispose(
    raw_path: String,
    jpeg_path: String,
    journal_path: String,
    action: String,
    archive_folder: Option<String>,
) -> Result<(), String> {
    validate_jpeg(Path::new(&jpeg_path))?;
    let raw = Path::new(&raw_path);
    if action == "keep" {
        let _ = fs::remove_file(journal_path);
        return Ok(());
    }

    let associated = find_all_associated_files(raw)?;
    if action == "archive" {
        let destination =
            archive_folder.ok_or_else(|| "Archive folder is required.".to_string())?;
        let destination = Path::new(&destination);
        if !destination.is_dir() {
            return Err("Archive destination is not a folder.".to_string());
        }
        for source in &associated {
            let target = destination.join(
                source
                    .file_name()
                    .ok_or_else(|| "Associated file has no name.".to_string())?,
            );
            if target.exists() {
                return Err(format!(
                    "Archive target already exists: {}",
                    target.display()
                ));
            }
        }
        let mut moved = Vec::new();
        for source in associated {
            let target = destination.join(source.file_name().unwrap());
            if let Err(error) = fs::rename(&source, &target) {
                let mut rollback_errors = Vec::new();
                for (original, archived) in moved.into_iter().rev() {
                    if let Err(rollback_error) = fs::rename(&archived, &original) {
                        rollback_errors.push(rollback_error.to_string());
                    }
                }
                return if rollback_errors.is_empty() {
                    Err(format!("Archiving failed and was rolled back: {error}"))
                } else {
                    Err(format!(
                        "Archiving failed and rollback was incomplete: {error}; {}",
                        rollback_errors.join("; ")
                    ))
                };
            }
            moved.push((source, target));
        }
    } else if action == "trash" {
        trash::delete_all(&associated)
            .map_err(|e| format!("Could not move RAW and sidecars to trash: {e}"))?;
    } else {
        return Err("Unknown finalization action.".to_string());
    }
    let _ = fs::remove_file(journal_path);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_nested_album_memberships() {
        let albums = vec![AlbumItem::Group {
            id: "group".to_string(),
            name: "Group".to_string(),
            icon: None,
            children: vec![AlbumItem::Album {
                id: "album".to_string(),
                name: "Album".to_string(),
                icon: None,
                images: vec!["/photos/a.raf".to_string(), "/photos/a.raf".to_string()],
            }],
        }];

        assert_eq!(album_membership_count(&albums, "/photos/a.raf"), 2);
        assert_eq!(album_membership_count(&albums, "/photos/b.raf"), 0);
    }
}
