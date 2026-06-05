import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Calendar, CheckSquare, Square, Clock } from 'lucide-react';

const TaskItem = ({ task, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [editError, setEditError] = useState('');

  // Priority Styles Helper
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'low':
        default:
          return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  // Due Date Formatter
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    const timeDiff = itemDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let displayString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    let badgeColor = 'text-slate-400 bg-slate-900 border border-slate-800';
    let isOverdue = false;

    if (daysDiff === 0) {
      displayString = 'Today';
      badgeColor = 'text-amber-400 bg-amber-500/10 border border-amber-500/25';
    } else if (daysDiff === 1) {
      displayString = 'Tomorrow';
      badgeColor = 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/25';
    } else if (daysDiff < 0 && !task.isCompleted) {
      isOverdue = true;
      displayString = `Overdue (${Math.abs(daysDiff)}d ago)`;
      badgeColor = 'text-red-400 bg-red-500/10 border border-red-500/25';
    }

    return { displayString, badgeColor, isOverdue };
  };

  const dateDetails = formatDueDate(task.dueDate);

  // Handle Save
  const handleSave = () => {
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      setEditError('Title must be at least 3 characters');
      return;
    }

    setEditError('');
    setIsEditing(false);
    onUpdateTask(task._id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    });
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditError('');
    setIsEditing(false);
  };

  return (
    <div className={`p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-all duration-300 relative group overflow-hidden ${
      task.isCompleted ? 'opacity-70' : ''
    }`}>
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {isEditing ? (
        // EDIT MODE
        <div className="space-y-3 relative z-10">
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Task Title"
            />
            {editError && <p className="text-red-400 text-xs mt-1">{editError}</p>}
          </div>

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Description"
            rows="2"
          />

          <div className="flex gap-2 items-center">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="p-1 px-2 rounded text-xs text-slate-400 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="p-1 px-2 rounded text-xs bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      ) : (
        // READ-ONLY MODE
        <div className="flex items-start gap-3 relative z-10">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task._id, !task.isCompleted)}
            className="text-slate-500 hover:text-indigo-400 mt-0.5 transition-colors cursor-pointer"
          >
            {task.isCompleted ? (
              <CheckSquare className="w-5 h-5 text-indigo-500" />
            ) : (
              <Square className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
            )}
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold text-slate-200 truncate ${
              task.isCompleted ? 'line-through text-slate-500 font-normal' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-xs text-slate-400 mt-1 line-clamp-2 ${
                task.isCompleted ? 'text-slate-600' : ''
              }`}>
                {task.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </span>

              {dateDetails && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${dateDetails.badgeColor}`}>
                  {dateDetails.isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {dateDetails.displayString}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteTask(task._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
