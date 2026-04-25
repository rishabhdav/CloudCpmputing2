import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../services/api';

const MAX_SIZE = 5 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    setSelectedFile(acceptedFiles[0] || null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'application/pdf': []
    }
  });

  const validateFile = (file) => {
    if (!file) return 'Please select a file.';
    if (!allowedTypes.includes(file.type)) return 'Invalid type. Upload image or PDF only.';
    if (file.size > MAX_SIZE) return 'File exceeds 5 MB limit.';
    return '';
  };

  const handleUpload = async () => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError('');

      await uploadFile(selectedFile, (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        }
      });

      setSelectedFile(null);
      onUploadSuccess();
    } catch (uploadError) {
      const message = uploadError.response?.data?.message || 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Uploader</p>
          <h2>Send a file for processing</h2>
        </div>
        <span className="section-chip">Images and PDFs</span>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop your file here to start processing</p>
        ) : (
          <div className="dropzone-copy">
            <strong>Drag and drop an image or PDF</strong>
            <span>or click to browse your device</span>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div>
            <span className="selected-label">Selected file</span>
            <strong>{selectedFile.name}</strong>
          </div>
          <span className="file-pill">{(selectedFile.size / 1024).toFixed(1)} KB</span>
        </div>
      )}

      <button className="primary-button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {isUploading && (
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>{uploadProgress}%</span>
        </div>
      )}

      <p className="upload-note">Accepted formats: JPG, PNG, WEBP, PDF. Maximum size: 5 MB.</p>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default FileUpload;
