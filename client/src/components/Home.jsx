import React, { useEffect, useState } from 'react';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Pobierz token z ciasteczka
  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  };

  // Pobierz dane użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getTokenFromCookie();
      if (!token) {
        setError('No token');
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://localhost:5001/auth/data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          document.cookie = 'token=; Max-Age=0; path=/;';
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        if (res.ok) {
          setUserData(data);
        } else {
          setError(data.message || 'Błąd pobierania danych');
        }
      } catch {
        setError('Błąd połączenia z serwerem');
      }
    };

    fetchUserData();
  }, []);

  // Dodaj nową listę
  const handleAddList = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!newListName.trim()) {
      setModalError('Name is required');
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      setModalError('No token');
      return;
    }

    try {
      setModalLoading(true);
      const res = await fetch('http://localhost:5001/list/lists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName.trim() }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewListName('');
      } else {
        const data = await res.json();
        setModalError(data.message || 'Error');
      }
    } catch {
      setModalError('Server error');
    } finally {
      setModalLoading(false);
    }
  };

  const isDarkMode = userData?.darkMode === 1 || userData?.darkMode === true;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`} style={{ padding: '2rem', minHeight: '100vh' }}>
      <h2>Witaj, {userData?.email || 'Użytkowniku'}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button className="submit-button" onClick={() => setShowModal(true)}>
        Dodaj listę
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={{
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
<div
  className="form-box"
  style={{
    backgroundColor: isDarkMode ? '#222' : '#fff',
    color: isDarkMode ? '#eee' : '#000',
    padding: '1.5rem',
    borderRadius: '8px',
    minWidth: '300px',
    boxShadow: isDarkMode ? '0 0 15px #444' : '0 0 10px #aaa',

    display: 'flex',       // <-- dodaj flex
    flexDirection: 'column',
    alignItems: 'center',  // <-- wyśrodkuj poziomo
    gap: '1rem',           // odstęp między elementami
  }}
>
  <h3 style={{ margin: 0 }}>Dodaj nową listę</h3>
  <form
    onSubmit={handleAddList}
    style={{
      width: '100%',       
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // wyśrodkuj input i buttony
    }}
  >
    <input
      type="text"
      placeholder="Nazwa listy"
      value={newListName}
      onChange={(e) => setNewListName(e.target.value)}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: isDarkMode ? '1px solid #555' : '1px solid #ccc',
        backgroundColor: isDarkMode ? '#333' : '#fff',
        color: isDarkMode ? '#eee' : '#000',
        boxSizing: 'border-box',  
      }}
      autoFocus
    />
    {modalError && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{modalError}</p>}

    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
      <button
        type="submit"
        className="submit-button"
        disabled={modalLoading}
        style={{ flex: 1 }}
      >
        {modalLoading ? 'Adding...' : 'Add'}
      </button>
      <button
        type="button"
        onClick={() => setShowModal(false)}
        className="submit-button"
        style={{ backgroundColor: '#aaa', flex: 1 }}
        disabled={modalLoading}
      >
        Anuluj
      </button>
    </div>
  </form>
</div>

        </div>
      )}
    </div>
  );
};

export default Home;
