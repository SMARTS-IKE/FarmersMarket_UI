import React, { useState } from 'react';
import CustomButton from './CustomButton';
import { useGlobalEnums } from '../mappings/GlobalEnums';

export type ExportSelectorProps = {
  initial?: string;
  onExport?: (format: string) => Promise<void> | void;
  className?: string;
};

export default function ExportSelector({ initial = 'xlsx', onExport, className }: ExportSelectorProps) {
  const { ExportFormatLabels } = useGlobalEnums();
  const [format, setFormat] = useState<string>(initial);

  const handleExport = async () => {
    if (onExport) {
      await onExport(format);
      return;
    }
    // no-op fallback for pages that only need the UI
    // eslint-disable-next-line no-console
    console.warn('ExportSelector: onExport not provided');
  };

  return (
    <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid #333232' }}>
        {ExportFormatLabels && Object.keys(ExportFormatLabels).map((k) => (
          <option key={k} value={(ExportFormatLabels as any)[k].toLowerCase()}>{(ExportFormatLabels as any)[k]}</option>
        ))}
      </select>
      <CustomButton title="Εξαγωγή" onClick={handleExport} />
    </div>
  );
}
