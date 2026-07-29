

import { useRef, useState, useCallback } from 'react';
import { ImagePlus, X, Film } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setComposerMediaFiles, selectComposer } from '../../../store/slices/postSlice';
import type { MediaFileProps } from '../../../domain/entities/MediaFile';
import { generateId } from '../../../infrastructure/utils/generateId';

function detectMediaType(mimeType: string): 'IMAGE' | 'VIDEO' {
  return mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

export function MediaUploader() {
  const dispatch = useAppDispatch();
  const { mediaFiles } = useAppSelector(selectComposer);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newMedia: MediaFileProps[] = [];
    Array.from(files).forEach((file) => {
      const mediaType = detectMediaType(file.type);
      const mediaFile: MediaFileProps = {
        id: generateId(),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        mediaType,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
      };
      newMedia.push(mediaFile);
    });
    dispatch(setComposerMediaFiles([...mediaFiles, ...newMedia]));
  }, [dispatch, mediaFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleRemove = (id: string) => {
    dispatch(setComposerMediaFiles(mediaFiles.filter((f) => f.id !== id)));
  };

  return (
    <div className="form-group">
      <label className="form-label">Media <span>— optional</span></label>
      <div
        id="media-upload-zone"
        className={`media-upload-zone${isDragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <ImagePlus size={28} className="media-upload-zone__icon" strokeWidth={1.5} />
        <div className="media-upload-zone__label">
          {isDragging ? 'Drop files here' : 'Click or drag to upload'}
        </div>
        <div className="media-upload-zone__hint">Images or video files — platform limits apply</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {mediaFiles.length > 0 && (
        <div className="media-grid">
          {mediaFiles.map((file) => (
            <div key={file.id} className="media-thumb">
              {file.mediaType === 'IMAGE' ? (
                <img src={file.url} alt={file.fileName} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#111827' }}>
                  <Film size={24} color="#9CA3AF" />
                </div>
              )}
              <span className="media-thumb__type">
                {file.mediaType === 'VIDEO' ? 'VID' : file.fileName.split('.').pop()?.toUpperCase()}
              </span>
              <button
                className="media-thumb__remove"
                onClick={(e) => { e.stopPropagation(); handleRemove(file.id); }}
                title="Remove"
                id={`remove-media-${file.id}`}
              >
                <X size={10} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
