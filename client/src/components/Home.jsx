import React, { useEffect, useState } from 'react';
import './styles/Home.css';
import AddListModal from './AddListModal';
import EditListModal from './EditListModal';
import ListModal from './ListModal';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const [lists, setLists] = useState([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal add list
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Modal edit list
  const [showEditModal, setShowEditModal] = useState(false);
  const [editListName, setEditListName] = useState('');
  const [editListId, setEditListId] = useState(null);
  const [editModalError, setEditModalError] = useState('');
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [openedList, setOpenedList] = useState(null);

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  };

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
          fetchLists(token);
        } else {
          setError(data.message || 'Error fetching data');
        }
      } catch {
        setError('Server connection error');
      }
    };

    const fetchLists = async (token) => {
      try {
        const res = await fetch('http://localhost:5001/list/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setLists(data);
        } else {
          console.error('List error:', data);
        }
      } catch (err) {
        console.error('Fetch list error:', err);
      }
    };

    fetchUserData();
  }, []);

const handleAddTask = async () => {
  const token = getTokenFromCookie();
  if (!token) {
    alert("No token");
    return;
  }

  const description = openedList?.newTask?.trim();
  if (!description) return;

  try {
    const res = await fetch("http://localhost:5001/tasks/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        listId: openedList.id,
        description: description,
      }),
    });

    if (res.ok) {
      const updatedList = { ...openedList, newTask: "" };
      setOpenedList(updatedList);
      openListModal(updatedList); 
    } else {
      const data = await res.json();
      alert(data.message || "Error adding task");
    }
  } catch (err) {
    console.error("Add task error:", err);
    alert("Server error");
  }
};

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
      const res = await fetch('http://localhost:5001/list/add', {
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
        // Refresh lists
        const updatedLists = await fetch('http://localhost:5001/list/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await updatedLists.json();
        if (updatedLists.ok) setLists(data);
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

  const handleDeleteList = async (id) => {
    const token = getTokenFromCookie();
    if (!token) {
      alert('No token');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      const res = await fetch(`http://localhost:5001/list/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Refresh lists after deletion
        const updatedLists = await fetch('http://localhost:5001/list/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await updatedLists.json();
        if (updatedLists.ok) setLists(data);
      } else {
        const data = await res.json();
        alert(data.message || 'Error deleting list');
      }
    } catch {
      alert('Server connection error');
    }
  };

    const openListModal = async (list) => {
      const token = getTokenFromCookie();
      if (!token) return alert('No token');

      try {
        const res = await fetch(`http://localhost:5001/tasks/${list.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setOpenedList({ ...list, tasks: data, newTask: '' });
        } else {
          console.error('Task load error:', data);
          setOpenedList({ ...list, tasks: [], newTask: '' });
        }
      } catch (err) {
        console.error('Fetch tasks error:', err);
        setOpenedList({ ...list, tasks: [], newTask: '' });
      }
    };

    const handleToggleTask = async (taskId) => {
      const token = getTokenFromCookie();
      if (!token || !openedList) return;

      try {
        const res = await fetch(`http://localhost:5001/tasks/toggle/${taskId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          openListModal(openedList);
        } else {
          const data = await res.json();
          alert(data.message || 'Error toggling task');
        }
      } catch (err) {
        console.error('Toggle task error:', err);
        alert('Server error');
      }
    };


  const closeListModal = () => {
    setOpenedList(null);
  };

  const openEditModal = (list) => {
    setEditListId(list.id);
    setEditListName(list.name);
    setEditModalError('');
    setShowEditModal(true);
  };

  const handleEditList = async (e) => {
    e.preventDefault();
    setEditModalError('');

    if (!editListName.trim()) {
      setEditModalError('Name is required');
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      setEditModalError('No token');
      return;
    }

    try {
      setEditModalLoading(true);
      const res = await fetch(`http://localhost:5001/list/${editListId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName: editListName.trim() }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditListId(null);
        setEditListName('');
        // Refresh lists
        const updatedLists = await fetch('http://localhost:5001/list/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await updatedLists.json();
        if (updatedLists.ok) setLists(data);
      } else {
        const data = await res.json();
        setEditModalError(data.message || 'Error');
      }
    } catch {
      setEditModalError('Server error');
    } finally {
      setEditModalLoading(false);
    }
  };

  const isDarkMode = userData?.darkMode === 1 || userData?.darkMode === true;

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`} style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
  <button className="submit-button" onClick={() => window.location.href = '/account'}>Account</button>
  <button
    className="submit-button"
    style={{ backgroundColor: 'darkred' }}
    onClick={async () => {
      const token = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
      if (!token) return;
      try {
        await fetch('http://localhost:5001/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        document.cookie = 'token=; Max-Age=0; path=/;';
        window.location.href = '/login';
      } catch {
        alert('Logout failed');
      }
    }}
  >
    Logout
  </button>
</div>

      <h2>Welcome, {userData?.email || 'User'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button className="submit-button" onClick={() => setShowModal(true)}>Add List</button>

      {/* Search box */}
      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Search lists..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: isDarkMode ? '1px solid #555' : '1px solid #ccc',
            backgroundColor: isDarkMode ? '#333' : '#fff',
            color: isDarkMode ? '#eee' : '#000',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* User's lists */}
      <div className="list-grid">
        {filteredLists.map((list) => (
          <div
            key={list.id}
            className="list-card"
            style={{
              backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
              color: isDarkMode ? '#eee' : '#000',
              boxShadow: isDarkMode ? '0 0 12px #444' : '0 0 10px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
              padding: '1rem',
              borderRadius: '6px',
            }}
          >
            <h4
              style={{ marginBottom: '0.5rem', cursor: 'pointer' }}
              onClick={() => openListModal(list)}
            >
              {list.name}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => openEditModal(list)}>Edit</button>
              <button onClick={() => handleDeleteList(list.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal open list */}
      {openedList && (
        <ListModal
          openedList={openedList}
          setOpenedList={setOpenedList}
          handleAddTask={handleAddTask}
          handleToggleTask={handleToggleTask}
          closeListModal={closeListModal}
        />
      )}


      {showModal && (
        <AddListModal
          isDarkMode={isDarkMode}
          newListName={newListName}
          setNewListName={setNewListName}
          modalError={modalError}
          modalLoading={modalLoading}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddList}
        />
      )}


      {showEditModal && (
        <EditListModal
          isDarkMode={isDarkMode}
          editListName={editListName}
          setEditListName={setEditListName}
          editModalError={editModalError}
          editModalLoading={editModalLoading}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditList}
        />
      )}

    </div>
  );
};

export default Home;
