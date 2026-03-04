import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { taskAPI } from '../services/adminAPI';
import { ROUTES } from '../constants/endpoints';
import '../styles/TasksManager.css';

const STATUS_COLORS = {
  pending:       { bg: '#fef9c3', color: '#854d0e' },
  ordered:       { bg: '#dbeafe', color: '#1d4ed8' },
  'in progress': { bg: '#e0e7ff', color: '#4338ca' },
  delivered:     { bg: '#d1fae5', color: '#065f46' },
  finished:      { bg: '#f0fdf4', color: '#15803d' },
};

const TasksManagerPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskAPI.getAll();
        setTasks(res.data.data.tasks);
      } catch {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="page-container">
      <div className="tasks-header">
        <div>
          <h2 className="page-title">Manage Tasks</h2>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-create-task" onClick={() => navigate(ROUTES.ADMIN_CREATE_TASK)}>
          <MdAdd /> Create Task
        </button>
      </div>

      {loading && <p className="tasks-loading">Loading tasks...</p>}
      {error   && <p className="tasks-error">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state"><p>No tasks yet. Click "Create Task" to get started.</p></div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Members</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const badge = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
                return (
                  <tr key={task._id}>
                    <td>
                      <button
                        className="btn-subject"
                        onClick={() => navigate(`${ROUTES.ADMIN_EDIT_TASK}/${task._id}`)}
                      >
                        {task.taskName}
                      </button>
                    </td>
                    <td>{task.customer ? task.customer.name : '—'}</td>
                    <td>
                      <span className="task-status-badge" style={{ background: badge.bg, color: badge.color }}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {task.members?.length > 0 ? (
                        <div className="task-members">
                          {task.members.map((m) => (
                            <span key={m._id} className="task-member-chip" title={m.name}>
                              {m.name.charAt(0).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="td-date">{formatDate(task.createdAt)}</td>
                    <td className="td-date">{formatDate(task.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TasksManagerPage;
