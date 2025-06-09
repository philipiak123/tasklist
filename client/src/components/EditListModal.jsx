// src/components/EditListModal.jsx
import React from 'react';
import './styles/EditListModal.css';

const EditListModal = ({
  isDarkMode,
  editListName,
  setEditListName,
  editModalError,
  editModalLoading,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="modal-overlay">
      <div
        className={`form-box ${isDarkMode ? 'dark' : 'light'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>&times;</button>
        <h3>Edit List</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={editListName}
            onChange={(e) => setEditListName(e.target.value)}
            placeholder="List name"
            disabled={editModalLoading}
            autoFocus
          />
          {editModalError && <p className="error-text">{editModalError}</p>}
          <button type="submit" disabled={editModalLoading} className="submit-button">
            {editModalLoading ? 'Loading...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListModal;
