// src/components/AddListModal.jsx
import React from 'react';
import './styles/AddListModal.css';

const AddListModal = ({
  isDarkMode,
  newListName,
  setNewListName,
  modalError,
  modalLoading,
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
        <h3>Add List</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name"
            disabled={modalLoading}
            autoFocus
          />
          {modalError && <p className="error-text">{modalError}</p>}
          <button type="submit" disabled={modalLoading} className="submit-button">
            {modalLoading ? 'Loading...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;
