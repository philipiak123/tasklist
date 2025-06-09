import React, { useEffect, useState } from 'react';
import './styles/LoginForm.css';
import './styles/Account.css';

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getTokenFromCookie();

      if (!token) {
        setError('No token. Please log in again.');
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://localhost:5001/auth/data', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          document.cookie = 'token=; Max-Age=0; path=/;';
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        if (res.ok) setUserData(data);
        else setError(data.message || 'Error fetching user data.');
      } catch {
        setError('Server connection error.');
      }
    };

    fetchData();
  }, []);

  const toggleDarkMode = async () => {
    const token = getTokenFromCookie();
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/auth/darkmode', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setUserData((prev) => ({ ...prev, darkMode: prev.darkMode === 1 ? 0 : 1 }));
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to toggle dark mode.');
      }
    } catch {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage(
        'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }


    const token = getTokenFromCookie();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5001/auth/change-password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage('Password changed successfully.');
        setShowModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordMessage(data.message || 'Failed to change password.');
      }
    } catch {
      setPasswordMessage('Server connection error.');
    }
  };

  const isDarkMode = userData?.darkMode === 1;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`} style={{ padding: '2rem' }}>
      <h2>Account Settings</h2>
      {error && <p className="error-message">{error}</p>}

      <button onClick={() => setShowModal(true)} className="submit-button" style={{ marginTop: '1rem' }}>
        Change Password
      </button>

      <button onClick={toggleDarkMode} className="submit-button" style={{ marginTop: '1rem' }}>
        Toggle Dark Mode
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`form-box ${isDarkMode ? 'dark-mode' : ''}`}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h2 className="form-title">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="modal-input"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="modal-input"
              />
              {passwordMessage && <p className="error-message">{passwordMessage}</p>}

              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
