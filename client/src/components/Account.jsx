import React, { useEffect, useState } from 'react';
import './styles/LoginForm.css'; // używamy tych samych stylów
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
        setError('Brak tokena. Zaloguj się ponownie.');
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://localhost:5001/auth/data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          document.cookie = 'token=; Max-Age=0; path=/;';
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        if (res.ok) setUserData(data);
        else setError(data.message || 'Błąd pobierania danych.');
      } catch {
        setError('Błąd połączenia z serwerem.');
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
        setUserData((prevData) => ({
          ...prevData,
          darkMode: prevData.darkMode === 1 ? 0 : 1,
        }));
      } else {
        const data = await res.json();
        setError(data.message || 'Błąd przy zmianie trybu.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Hasła nie są takie same.');
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
        setPasswordMessage('Hasło zostało zmienione.');
        setShowModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordMessage(data.message || 'Błąd zmiany hasła.');
      }
    } catch {
      setPasswordMessage('Błąd połączenia z serwerem.');
    }
  };

  const isDarkMode = userData?.darkMode === 1;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`} style={{ padding: '2rem' }}>
      <h2>Strona domowa</h2>

      {error && <p className="error-message">{error}</p>}
      {userData ? (
        <div>
          <h3>Dane użytkownika:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>

          <button onClick={toggleDarkMode} disabled={loading} className="submit-button">
            {loading ? 'Ładowanie...' : isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
          </button>

          <button onClick={() => setShowModal(true)} className="submit-button" style={{ marginTop: '1rem' }}>
            Zmień hasło
          </button>
        </div>
      ) : (
        !error && <p>Ładowanie danych użytkownika...</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`form-box ${isDarkMode ? 'dark-mode' : ''}`}>
            <h2 className="form-title">Zmień hasło</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Obecne hasło:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nowe hasło:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Potwierdź nowe hasło:</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              {passwordMessage && <p className="error-message">{passwordMessage}</p>}

              <button type="submit" className="submit-button">Change password</button>
              <button type="button" onClick={() => setShowModal(false)} className="submit-button" style={{ marginTop: '10px', backgroundColor: '#aaa' }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
