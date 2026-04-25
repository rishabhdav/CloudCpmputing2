import { useState } from 'react';
import { deleteFile } from '../services/api';

function FileList({ files, onDeleteSuccess }) {
  const safeFiles = Array.isArray(files) ? files : [];
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [deletingId, setDeletingId] = useState('');

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return new URL(fileUrl, apiBaseUrl).href;
  };

  const handleDownload = async (file) => {
    const fileUrl = getFileUrl(file.cloudinaryUrl);

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error('Download request failed.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = file.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getFileKind = (mimeType) => {
    if (mimeType === 'application/pdf') {
      return 'PDF';
    }

    return 'Image';
  };

  const handleDelete = async (file) => {
    const shouldDelete = window.confirm(`Delete "${file.originalName}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(file._id);
      await deleteFile(file._id);
      await onDeleteSuccess?.();
    } catch (error) {
      window.alert(error.response?.data?.message || error.message || 'Delete failed.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Library</p>
          <h2>Uploaded files</h2>
        </div>
        <span className="section-chip">{safeFiles.length} items</span>
      </div>

      {safeFiles.length === 0 ? (
        <div className="empty-state">
          <strong>No files uploaded yet</strong>
          <p>Your processed files will appear here after the first upload.</p>
        </div>
      ) : (
        <div className="file-list">
          {safeFiles.map((file) => {
            const fileUrl = getFileUrl(file.cloudinaryUrl);

            return (
              <article key={file._id} className="file-item">
                <div className="file-item-top">
                  <div>
                    <span className="file-type-badge">{getFileKind(file.mimeType)}</span>
                    <h3>{file.originalName}</h3>
                  </div>
                  <span className="file-pill">{(file.size / 1024).toFixed(1)} KB</span>
                </div>

                <div className="file-meta">
                  <p>
                    <span>Type</span>
                    <strong>{file.mimeType}</strong>
                  </p>
                  <p>
                    <span>Uploaded</span>
                    <strong>{new Date(file.createdAt).toLocaleString()}</strong>
                  </p>
                  <p>
                    <span>Processing</span>
                    <strong>{file.processingType}</strong>
                  </p>
                </div>

                {file.extractedText && (
                  <details>
                    <summary>View extracted text</summary>
                    <pre>{file.extractedText}</pre>
                  </details>
                )}

                <div className="file-actions">
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                  <button type="button" onClick={() => handleDownload(file)}>
                    Download
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(file)}
                    disabled={deletingId === file._id}
                  >
                    {deletingId === file._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default FileList;
