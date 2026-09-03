import clsx from 'clsx';
import { Pipette } from 'lucide-react';
import Slider from '../ui/Slider';
import { Adjustments, BasicAdjustment, ColorAdjustment, DetailsAdjustment } from '../../utils/adjustments';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BasicAdjustmentsProps {
  adjustments: Adjustments;
  setAdjustments(adjustments: Partial<Adjustments>): any;
  isForMask?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
  appSettings?: any;
  isWbPickerActive?: boolean;
  toggleWbPicker?: () => void;
}

interface ToneMapperSwitchProps {
  selectedMapper: string;
  onMapperChange: (mapper: string) => void;
  evShiftValue: number;
  onEvShiftChange: (value: number) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}

const ToneMapperSwitch = ({
  selectedMapper,
  onMapperChange,
  evShiftValue,
  onEvShiftChange,
  onDragStateChange,
}: ToneMapperSwitchProps) => {
  const { t } = useTranslation();
  const [isLabelHovered, setIsLabelHovered] = useState(false);

  const toneMapperOptions = useMemo(
    () => [
      {
        id: 'basic',
        label: t('adjustments.basic.mappers.basic'),
        title: t('adjustments.basic.mappers.basicDesc'),
      },
      {
        id: 'agx',
        label: t('adjustments.basic.mappers.agx'),
        title: t('adjustments.basic.mappers.agxDesc'),
      },
    ],
    [t],
  );

  const handleReset = () => {
    onMapperChange('basic');
    onEvShiftChange(0);
  };

  return (
    <div className="tone-mapper-compact group">
      <div className="tone-mapper-label">
        <div
          className="grid cursor-pointer"
          onClick={handleReset}
          onDoubleClick={handleReset}
          onMouseEnter={() => setIsLabelHovered(true)}
          onMouseLeave={() => setIsLabelHovered(false)}
        >
          <span
            aria-hidden={isLabelHovered}
            className={`col-start-1 row-start-1 text-sm font-medium text-text-secondary select-none transition-opacity duration-200 ease-in-out ${
              isLabelHovered ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {t('adjustments.basic.toneMapper')}
          </span>
          <span
            aria-hidden={!isLabelHovered}
            className={`col-start-1 row-start-1 text-sm font-medium text-text-primary select-none transition-opacity duration-200 ease-in-out pointer-events-none ${
              isLabelHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {t('adjustments.basic.reset')}
          </span>
        </div>
      </div>
      <div className="tone-mapper-options">
        <div className="flex w-full">
          {toneMapperOptions.map((mapper) => (
            <button
              key={mapper.id}
              data-tooltip={mapper.title}
              onClick={() => onMapperChange(mapper.id)}
              className={clsx(
                'relative flex-1 flex items-center justify-center gap-2 px-3 p-1.5 text-sm font-medium rounded-md transition-colors',
                {
                  'text-text-primary hover:bg-surface': selectedMapper !== mapper.id,
                  'bg-accent text-button-text': selectedMapper === mapper.id,
                },
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative z-10 flex items-center">{mapper.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="tone-mapper-ev">
        <Slider
          label={t('adjustments.basic.evShift')}
          max={5}
          min={-5}
          onChange={(e: any) => onEvShiftChange(parseFloat(e.target.value))}
          step={0.01}
          value={evShiftValue}
          onDragStateChange={onDragStateChange}
        />
      </div>
    </div>
  );
};

export default function BasicAdjustments({
  adjustments,
  setAdjustments,
  isForMask = false,
  onDragStateChange,
  appSettings,
  isWbPickerActive,
  toggleWbPicker,
}: BasicAdjustmentsProps) {
  const { t } = useTranslation();

  const handleAdjustmentChange = (key: string, value: any) => {
    const numericValue = parseFloat(value);
    setAdjustments((prev: Partial<Adjustments>) => ({ ...prev, [key]: numericValue }));
  };

  const handleToneMapperChange = (mapper: string) => {
    setAdjustments((prev: Partial<Adjustments>) => ({
      ...prev,
      toneMapper: mapper as 'basic' | 'agx',
    }));
  };

  const hideTonemapper = isForMask || appSettings?.tonemapperOverrideEnabled;
  const showPresence = appSettings?.adjustmentVisibility?.presence !== false;

  return (
    <div className="basic-adjustments">
      {hideTonemapper ? (
        <Slider
          label={t('adjustments.basic.evShift')}
          max={5}
          min={-5}
          onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Exposure, e.target.value)}
          step={0.01}
          value={adjustments.exposure}
          onDragStateChange={onDragStateChange}
        />
      ) : (
        <ToneMapperSwitch
          selectedMapper={adjustments.toneMapper || 'agx'}
          onMapperChange={handleToneMapperChange}
          evShiftValue={adjustments.exposure}
          onEvShiftChange={(value) => handleAdjustmentChange(BasicAdjustment.Exposure, value)}
          onDragStateChange={onDragStateChange}
        />
      )}

      {!isForMask && (
        <>
          <div className="basic-control-group-title">
            <span>{t('adjustments.color.whiteBalance')}</span>
            {toggleWbPicker && (
              <button
                type="button"
                onClick={toggleWbPicker}
                className={clsx('basic-control-group-action', {
                  'bg-accent text-button-text': isWbPickerActive,
                  'text-text-secondary hover:text-text-primary': !isWbPickerActive,
                })}
                data-tooltip={t('adjustments.color.wbPickerTooltip')}
              >
                <Pipette />
              </button>
            )}
          </div>
          <Slider
            label={t('adjustments.color.temperature')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(ColorAdjustment.Temperature, e.target.value)}
            step={1}
            value={adjustments.temperature || 0}
            trackClassName="temperature-gradient-track"
            onDragStateChange={onDragStateChange}
          />
          <Slider
            label={t('adjustments.color.tint')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(ColorAdjustment.Tint, e.target.value)}
            step={1}
            value={adjustments.tint || 0}
            trackClassName="tint-gradient-track"
            onDragStateChange={onDragStateChange}
          />
        </>
      )}

      {!isForMask && (
        <div className="basic-control-group-title">
          <span>{t('modals.copyPaste.groups.tone')}</span>
        </div>
      )}
      <Slider
        label={t('adjustments.basic.exposure')}
        max={5}
        min={-5}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Brightness, e.target.value)}
        step={0.01}
        value={adjustments.brightness}
        onDragStateChange={onDragStateChange}
      />
      <Slider
        label={t('adjustments.basic.contrast')}
        max={100}
        min={-100}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Contrast, e.target.value)}
        step={1}
        value={adjustments.contrast}
        onDragStateChange={onDragStateChange}
      />
      <Slider
        label={t('adjustments.basic.highlights')}
        max={100}
        min={-100}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Highlights, e.target.value)}
        step={1}
        value={adjustments.highlights}
        onDragStateChange={onDragStateChange}
      />
      <Slider
        label={t('adjustments.basic.shadows')}
        max={100}
        min={-100}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Shadows, e.target.value)}
        step={1}
        value={adjustments.shadows}
        onDragStateChange={onDragStateChange}
      />
      <Slider
        label={t('adjustments.basic.whites')}
        max={100}
        min={-100}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Whites, e.target.value)}
        step={1}
        value={adjustments.whites}
        onDragStateChange={onDragStateChange}
      />
      <Slider
        label={t('adjustments.basic.blacks')}
        max={100}
        min={-100}
        onChange={(e: any) => handleAdjustmentChange(BasicAdjustment.Blacks, e.target.value)}
        step={1}
        value={adjustments.blacks}
        onDragStateChange={onDragStateChange}
      />

      {!isForMask && showPresence && (
        <>
          <div className="basic-control-group-title">
            <span>{t('adjustments.details.presence')}</span>
          </div>
          <Slider
            label={t('adjustments.details.structure')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(DetailsAdjustment.Structure, e.target.value)}
            step={1}
            value={adjustments.structure}
            onDragStateChange={onDragStateChange}
          />
          <Slider
            label={t('adjustments.details.clarity')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(DetailsAdjustment.Clarity, e.target.value)}
            step={1}
            value={adjustments.clarity}
            onDragStateChange={onDragStateChange}
          />
          <Slider
            label={t('adjustments.details.dehaze')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(DetailsAdjustment.Dehaze, e.target.value)}
            step={1}
            value={adjustments.dehaze}
            onDragStateChange={onDragStateChange}
          />
          <Slider
            label={t('adjustments.details.centre')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(DetailsAdjustment.Centré, e.target.value)}
            step={1}
            value={adjustments.centré}
            onDragStateChange={onDragStateChange}
          />
        </>
      )}

      {!isForMask && (
        <>
          <div className="basic-control-group-title">
            <span>{t('adjustments.color.vibrance')}</span>
          </div>
          <Slider
            label={t('adjustments.color.vibrance')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(ColorAdjustment.Vibrance, e.target.value)}
            step={1}
            value={adjustments.vibrance || 0}
            onDragStateChange={onDragStateChange}
          />
          <Slider
            label={t('adjustments.color.saturation')}
            max={100}
            min={-100}
            onChange={(e: any) => handleAdjustmentChange(ColorAdjustment.Saturation, e.target.value)}
            step={1}
            value={adjustments.saturation || 0}
            onDragStateChange={onDragStateChange}
          />
        </>
      )}
    </div>
  );
}
