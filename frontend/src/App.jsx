import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { fetchFiles } from './services/api';
import './index.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const fileData = await fetchFiles();
      setFiles(Array.isArray(fileData) ? fileData : []);
    } catch (apiError) {
      setFiles([]);
      setError(apiError.response?.data?.message || apiError.message || 'Could not fetch files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <main className="app-shell">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">Cloud File Pipeline</span>
          <h1>Upload. Process. Store. Present.</h1>
          <p className="subtitle">
            Upload image or PDF files, process them automatically, and keep the metadata organized in your cloud
            workflow.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">{files.length}</span>
            <span className="stat-label">Files in library</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">5 MB</span>
            <span className="stat-label">Upload limit</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">Auto</span>
            <span className="stat-label">Image and PDF processing</span>
          </div>
        </div>
      </section>

      <section className="container content-grid">
        <div className="content-main">
          <FileUpload onUploadSuccess={loadFiles} />
          {error && <p className="error global-error">{error}</p>}
        </div>

        <div className="content-side">
          {loading ? (
            <div className="card loading-card">Loading your uploaded files...</div>
          ) : (
            <FileList files={files} onDeleteSuccess={loadFiles} />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
