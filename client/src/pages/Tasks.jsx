import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import { 
  HiOutlineClipboardList, 
  HiOutlinePlus, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        isAdmin() ? userService.getAll() : Promise.resolve({ data: { data: { users: [] } } })
      ]);
      
      const tasksData = tasksRes.data.data?.tasks || tasksRes.data.tasks || tasksRes.data.data || tasksRes.data;
      const projectsData = projectsRes.data.data?.projects || projectsRes.data.projects || projectsRes.data.data || projectsRes.data;
      const usersData = usersRes.data.data?.users || usersRes.data.users || usersRes.data.data || usersRes.data;

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setMembers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      toast.success('Milestone updated');
      loadInitialData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Task Management</p>
          <h1 className="text-5xl font-black serif-font italic">
            Active <span className="text-[#C5A358]">Milestones</span>
          </h1>
        </div>
        
        {isAdmin() && (
          <button className="btn-primary flex items-center gap-2">
            <HiOutlinePlus className="w-5 h-5" />
            CREATE TASK
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1 max-w-md relative group">
          <HiOutlineSearch className="absolute left-6 w-5 h-5 text-slate-300 group-focus-within:text-[#0F4335] transition-colors" />
          <input 
            type="text" 
            placeholder="Search milestones..." 
            className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm">
          {['all', 'todo', 'in-progress', 'completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 py-3 rounded-full text-[10px] font-black tracking-widest transition-all uppercase ${
                statusFilter === filter 
                ? 'bg-[#0F4335] text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="card h-32 skeleton rounded-[2.5rem]"></div>)
        ) : filteredTasks.length === 0 ? (
          <div className="card !p-20 text-center">
            <HiOutlineClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#0F4335] serif-font italic">No milestones found</h3>
            <p className="text-slate-400 mt-2 serif-font italic">Try refining your search or filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row md:items-center gap-8 border border-transparent hover:border-[#0F4335]/5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                   <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                   }`}>
                     {task.priority} Priority
                   </span>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                     <HiOutlineTag className="w-3 h-3" />
                     {task.projectId?.title || 'General'}
                   </span>
                </div>
                <h3 className="text-2xl font-bold text-[#0F4335] serif-font italic group-hover:text-[#C5A358] transition-colors">
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                   <div className="flex items-center gap-2 text-slate-400">
                     <HiOutlineUserCircle className="w-5 h-5 text-[#C5A358]" />
                     <span className="text-xs font-bold serif-font italic">{task.assignedTo?.name || 'Unassigned'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400">
                     <HiOutlineClock className="w-5 h-5 text-[#C5A358]" />
                     <span className="text-xs font-bold serif-font italic">Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'TBD'}</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {task.status !== 'completed' ? (
                  <button 
                    onClick={() => handleUpdateStatus(task._id, task.status === 'todo' ? 'in-progress' : 'completed')}
                    className="w-16 h-16 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] hover:bg-[#0F4335] hover:text-white transition-all shadow-sm group/btn"
                  >
                    <HiOutlineChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <HiOutlineCheckCircle className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
