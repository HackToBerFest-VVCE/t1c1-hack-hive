import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ImageUpload({ onImageChange, selectedImage, validationError, required = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const fileInputRef = useRef(null);

  // Clear internal error when selectedImage changes externally
  useEffect(() => {
    if (!selectedImage) {
      setInternalError(null);
    }
  }, [selectedImage]);

  const validateAndProcessFile = (file) => {
    setInternalError(null);

    if (!file) {
      return;
    }

    // Validate MIME type and extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);

    if (!isMimeValid && !isExtensionValid) {
      const err = `Invalid file format "${file.name}". Please upload a JPEG, PNG, or WebP image.`;
      setInternalError(err);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size limit (10 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const err = `File size (${fileSizeMB} MB) exceeds the 10 MB maximum limit. Please select a smaller photo.`;
      setInternalError(err);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Clean up previous preview URL if one exists
    if (selectedImage && selectedImage.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    // Create a new preview URL
    const previewUrl = URL.createObjectURL(file);
    const imagePayload = {
      file,
      name: file.name,
      size: file.size,
      sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type || extension,
      previewUrl,
    };

    onImageChange(imagePayload);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemoveImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setInternalError(null);
    onImageChange(null);
  };

  const handleReplaceClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Determine active error
  const activeError = internalError || validationError;

  return (
    <div className="image-upload-wrapper">
      <div className="field-label-group">
        <label className="field-label" htmlFor="circuit-image-input">
          Circuit Photograph {required ? (
            <span className="required-mark" aria-hidden="true">*</span>
          ) : (
            <span className="optional-tag">(Optional)</span>
          )}
        </label>
        <span className="field-hint">JPEG, PNG, or WebP up to 10 MB</span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="circuit-image-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="visually-hidden"
        aria-describedby="upload-instructions"
      />

      {!selectedImage ? (
        /* Empty Upload Dropzone */
        <div
          className={`upload-dropzone ${dragActive ? 'dropzone-active' : ''} ${activeError ? 'dropzone-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleReplaceClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleReplaceClick();
            }
          }}
          aria-label="Upload circuit photograph. Click or drag and drop an image."
        >
          <div className="dropzone-icon-circle">
            <UploadCloud size={32} className="dropzone-icon" />
          </div>
          <div className="dropzone-text-group">
            <p className="dropzone-prompt">
              <span className="dropzone-prompt-highlight">Click to upload</span> or drag and drop
            </p>
            <p id="upload-instructions" className="dropzone-subtext">
              Clear overhead or close-up photo of your breadboard, wiring, or components
            </p>
          </div>
          <div className="dropzone-tags">
            <span className="file-tag">JPEG</span>
            <span className="file-tag">PNG</span>
            <span className="file-tag">WebP</span>
            <span className="file-tag">Max 10 MB</span>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="preview-container">
          <div className="preview-image-box">
            <img
              src={selectedImage.previewUrl}
              alt="Circuit photograph preview"
              className="preview-image"
            />
            <div className="preview-overlay">
              <div className="preview-badge">
                <Check size={14} />
                <span>Ready for Local Staging</span>
              </div>
            </div>
          </div>

          <div className="preview-meta">
            <div className="preview-info">
              <ImageIcon size={18} className="preview-meta-icon" />
              <div className="preview-text">
                <p className="preview-filename" title={selectedImage.name}>{selectedImage.name}</p>
                <p className="preview-filesize">{selectedImage.sizeFormatted} • Client validated</p>
              </div>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="btn-action btn-replace"
                onClick={handleReplaceClick}
                aria-label="Replace circuit image"
              >
                <RefreshCw size={14} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                className="btn-action btn-remove"
                onClick={handleRemoveImage}
                aria-label="Remove circuit image"
              >
                <X size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation or Error Message */}
      {activeError && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={15} className="error-icon" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
