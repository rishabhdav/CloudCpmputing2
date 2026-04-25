import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import {
  clearStoredAuth,
  fetchCurrentUser,
  fetchFiles,
  getStoredAuth,
  login,
  saveAuth,
  signup
} from './services/api';
import './index.css';

function App() {
  const [files, setFiles] = useState([]);
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const currentUser = auth?.user;

  const loadFiles = async () => {
    if (!auth?.token) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const fileData = await fetchFiles(auth.token);
      setFiles(Array.isArray(fileData) ? fileData : []);
    } catch (apiError) {
      setFiles([]);
      setError(apiError.response?.data?.message || apiError.message || 'Could not fetch files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyStoredSession = async () => {
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(auth.token);
        const nextAuth = {
          token: auth.token,
          user: response.user
        };

        setAuth(nextAuth);
        saveAuth(nextAuth);
      } catch (apiError) {
        clearStoredAuth();
        setAuth(null);
        setError(apiError.response?.data?.message || 'Session expired. Please login again.');
        setLoading(false);
      }
    };

    verifyStoredSession();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [auth]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');

      const requestBody =
        authMode === 'signup'
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const response = authMode === 'signup' ? await signup(requestBody) : await login(requestBody);
      const nextAuth = saveAuth(response);

      setAuth(nextAuth);
      setAuthForm({
        name: '',
        email: '',
        password: ''
      });
    } catch (apiError) {
      setAuthError(apiError.response?.data?.message || apiError.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
    setFiles([]);
  };

  return (
    <main className="app-shell">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">Cloud File Pipeline</span>
          <h1>Upload. Process. Store. Present.</h1>
          <p className="subtitle">
            Upload image or PDF files, process them automatically, and keep every account limited to its own files.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">{currentUser ? files.length : 'Auth'}</span>
            <span className="stat-label">
              {currentUser ? `Files for ${currentUser.name}` : 'Login required'}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-value">5 MB</span>
            <span className="stat-label">Upload limit</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">Private</span>
            <span className="stat-label">Each user sees only their own uploads</span>
          </div>
        </div>
      </section>

      <section className="container content-grid">
        <div className="content-main">
          {!currentUser ? (
            <section className="card user-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Authentication</p>
                  <h2>{authMode === 'signup' ? 'Create an account' : 'Login to your account'}</h2>
                </div>
                <span className="section-chip">{authMode === 'signup' ? 'Signup' : 'Login'}</span>
              </div>

              <div className="auth-switch">
                <button
                  type="button"
                  className={`secondary-button ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`secondary-button ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                >
                  Signup
                </button>
              </div>

              <form className="user-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <label>
                    <span>Name</span>
                    <input
                      name="name"
                      type="text"
                      value={authForm.name}
                      onChange={handleAuthChange}
                      placeholder="Rishabh"
                    />
                  </label>
                )}

                <label>
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                    placeholder="rishabh@example.com"
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    placeholder="At least 6 characters"
                  />
                </label>

                <button className="primary-button" type="submit" disabled={authLoading}>
                  {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Login'}
                </button>
              </form>

              <p className="upload-note">After login, each user sees only their own uploaded files and images.</p>
              {authError && <p className="error">{authError}</p>}
            </section>
          ) : (
            <>
              <section className="card user-card">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">Signed In</p>
                    <h2>{currentUser.name}</h2>
                  </div>
                  <span className="section-chip">{currentUser.email}</span>
                </div>

                <div className="session-actions">
                  <p className="upload-note">This account can only access its own uploads.</p>
                  <button type="button" className="secondary-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </section>

              <FileUpload token={auth.token} user={currentUser} onUploadSuccess={loadFiles} />
            </>
          )}

          {error && <p className="error global-error">{error}</p>}
        </div>

        <div className="content-side">
          {!currentUser ? (
            <div className="card empty-state">
              <strong>Login to view your personal library</strong>
              <p>Files and images stay private to the account that uploaded them.</p>
            </div>
          ) : loading ? (
            <div className="card loading-card">Loading your uploaded files...</div>
          ) : (
            <FileList token={auth.token} user={currentUser} files={files} onDeleteSuccess={loadFiles} />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
