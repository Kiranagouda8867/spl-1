import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export function FileDropzone({ onFileSelect, accept = '.pdf,.doc,.docx,.zip', maxSizeMB = 10, selectedFile, onClear }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const allowed = accept.split(',').map((a) => a.trim());
    if (!allowed.includes(ext)) {
      return `Invalid file type. Allowed: ${accept}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB} MB`;
    }
    return null;
  };

  const handleFile = useCallback((file) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onFileSelect(file);
  }, [onFileSelect, accept, maxSizeMB]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 glass rounded-xl border border-teal-500/25">
          <FileText size={20} className="text-teal-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button type="button" onClick={onClear} className="p-1 hover:text-red-400 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-teal-500/25 hover:border-teal-500/50 hover:bg-teal-500/5'
          }`}
        >
          <label className="cursor-pointer block">
            <input
              type="file"
              accept={accept}
              onChange={onInputChange}
              className="hidden"
              id="file-dropzone-input"
            />
            <Upload size={32} className="text-teal-400/60 mx-auto mb-3" />
            <p className="text-white font-medium text-sm">Drop your file here or click to browse</p>
            <p className="text-slate-500 text-xs mt-1">
              Accepted: {accept} • Max size: {maxSizeMB} MB
            </p>
          </label>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
