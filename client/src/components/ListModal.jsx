// src/components/ListModal.jsx
import React from 'react';
import './styles/ListModal.css';

const ListModal = ({
  openedList,
  setOpenedList,
  handleAddTask,
  handleToggleTask,
  closeListModal,
}) => {
  return (
    <div className="modal-overlay" onClick={closeListModal}>
      <div className="list-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeListModal}>&times;</button>
        <div className="list-modal-header">{openedList.name}</div>
        <div className="list-modal-content">
          <div className="task-input-row">
            <input
              type="text"
              placeholder="Enter task..."
              value={openedList?.newTask || ''}
              onChange={(e) =>
                setOpenedList((prev) => ({ ...prev, newTask: e.target.value }))
              }
            />
            <button className="add-button" onClick={handleAddTask}>Add</button>
          </div>

          {openedList.tasks && openedList.tasks.length > 0 ? (
            <ul className="task-list">
              {openedList.tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <input
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => handleToggleTask(task.id)}
                  />
                  <span className={task.checked ? 'checked' : ''}>
                    {task.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-tasks">No tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListModal;
