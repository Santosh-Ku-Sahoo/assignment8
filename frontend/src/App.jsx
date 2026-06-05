import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, ListTodo, Search, AlertCircle, Sparkles, Filter, ArrowUpDown } from 'lucide-react';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, filter, and sort state variables
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Simple toast alert notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Fetch tasks from express API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (completedFilter !== 'all') {
        params.completed = completedFilter === 'completed' ? 'true' : 'false';
      }
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }
      if (search.trim() !== '') {
        params.search = search;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }

      const response = await axios.get('/api/tasks', { params });
      if (response.data.success) {
        setTasks(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend server. Make sure MongoDB and backend are running.');
    } finally {
      setLoading(false);
    }
  };

  // Run search with a small delay (debounce)
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [search, completedFilter, priorityFilter, sortBy]);

  // Create a new task
  const addTask = async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      if (response.data.success) {
        fetchTasks();
        showToast('Task added successfully!');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error creating task';
      showToast(errMsg, 'error');
    }
  };

  // Toggle completion checkbox (PATCH request)
  const toggleComplete = async (id, isCompleted) => {
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t._id === id ? { ...t, isCompleted } : t))
    );

    try {
      const response = await axios.patch(`/api/tasks/${id}`, { isCompleted });
      if (response.data.success) {
        showToast(isCompleted ? 'Task completed! 🎉' : 'Task marked active');
      }
    } catch (err) {
      console.error(err);
      fetchTasks(); // Rollback to actual database state
      showToast('Failed to update status', 'error');
    }
  };

  // Update existing task details
  const updateTask = async (id, updatedData) => {
    try {
      const response = await axios.patch(`/api/tasks/${id}`, updatedData);
      if (response.data.success) {
        fetchTasks();
        showToast('Task updated');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update task', 'error');
    }
  };

  // Delete task with confirmation dialog
  const deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const backupTasks = [...tasks];
    setTasks(prev => prev.filter(t => t._id !== id)); // Optimistic UI delete

    try {
      const response = await axios.delete(`/api/tasks/${id}`);
      if (response.data.success) {
        showToast('Task deleted successfully');
      }
    } catch (err) {
      console.error(err);
      setTasks(backupTasks); // Rollback
      showToast('Failed to delete task', 'error');
    }
  };

  // Calculate statistics for dashboard widgets
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.isCompleted).length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'medium' && !t.isCompleted).length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'low' && !t.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Alert Popup */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${
          toast.type === 'error' 
            ? 'bg-red-950/80 border-red-500/30 text-red-300' 
            : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
              <ListTodo className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-display">TaskFlow</h1>
              <p className="text-[10px] text-slate-500 font-mono">Assignment 8: Full-Stack Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
            <span>By Santosh Kumar Sahoo</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column - Stats and task form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Dashboard stats panel */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 shadow-lg space-y-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Dashboard Overview</h2>
            
            {/* Completion progress */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center bg-slate-950 rounded-full border border-slate-800">
                <span className="text-lg font-bold text-indigo-400">{progressPercent}%</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium">Tasks Completion</p>
                <h3 className="text-xl font-bold text-slate-200 mt-0.5">{completedTasks} / {totalTasks}</h3>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 border border-slate-850 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pending priority counts */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-900">
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 text-center">
                <span className="text-red-400 text-base font-bold">{highPriorityCount}</span>
                <p className="text-[10px] text-slate-500 uppercase mt-0.5">High</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 text-center">
                <span className="text-amber-400 text-base font-bold">{mediumPriorityCount}</span>
                <p className="text-[10px] text-slate-500 uppercase mt-0.5">Medium</p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 text-center">
                <span className="text-blue-400 text-base font-bold">{lowPriorityCount}</span>
                <p className="text-[10px] text-slate-500 uppercase mt-0.5">Low</p>
              </div>
            </div>
          </div>

          <TaskForm onAddTask={addTask} />

        </div>

        {/* Right column - Filtering controls and task list items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Filtering and sorting controls */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 shadow-lg space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all text-slate-200"
              />
            </div>

            {/* Selection row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {/* Filter by status */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 font-medium mr-1">Status:</span>
                  <div className="flex p-0.5 bg-slate-950 rounded-md border border-slate-850">
                    {['all', 'active', 'completed'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setCompletedFilter(f)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize cursor-pointer transition-colors ${
                          completedFilter === f 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by priority */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium mr-1">Priority:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Sorting options select */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="dueDate">Due Date</option>
                </select>
              </div>

            </div>

          </div>

          {/* Tasks display container */}
          {error ? (
            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-5 text-center shadow-lg">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-red-200">Database Connection Failed</h3>
              <p className="text-xs text-red-400/80 mt-1 max-w-md mx-auto">{error}</p>
              <button 
                onClick={fetchTasks}
                className="mt-4 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded-lg text-xs font-semibold text-red-300 transition-all cursor-pointer"
              >
                Try Reconnecting
              </button>
            </div>
          ) : loading ? (
            // Skeleton loader UI
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="p-4 bg-slate-900/25 border border-slate-900 rounded-xl animate-pulse flex items-start gap-3">
                  <div className="w-5 h-5 bg-slate-800 rounded mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-4 bg-slate-800 rounded" />
                    <div className="w-2/3 h-3 bg-slate-850 rounded" />
                    <div className="w-1/4 h-3 bg-slate-850 rounded-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            // Empty State UI
            <div className="bg-slate-900/15 border border-slate-900 rounded-xl p-10 text-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">No tasks found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search || completedFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try clearing your filters or search queries.'
                  : 'Add your first task in the dashboard to get started!'}
              </p>
            </div>
          ) : (
            // Tasks List
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onDeleteTask={deleteTask}
                  onUpdateTask={updateTask}
                />
              ))}
            </div>
          )}

        </div>

      </main>

      {/* Footer Bar */}
      <footer className="border-t border-slate-900 py-6 mt-8 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>MERN Stack Assignment 8 • To-Do List Application Integration</p>
          <p>Created by Santosh Kumar Sahoo &copy; 2026</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
