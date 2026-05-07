import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  HiOutlineFolder, HiOutlineClipboardList, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineExclamationCircle, HiOutlineTrendingUp,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const STATUS_COLORS = ['#C5A358', '#0F4335', '#E5E7EB'];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          projectService.getStats(),
          projectService.getAll({ limit: 5 }),
          taskService.getAll({ limit: 5 })
        ]);
        
        const statsData = statsRes.data.data?.stats || statsRes.data.stats || statsRes.data.data || statsRes.data;
        const projectsData = projectsRes.data.data?.projects || projectsRes.data.projects || projectsRes.data.data || projectsRes.data;
        const tasksData = tasksRes.data.data?.tasks || tasksRes.data.tasks || tasksRes.data.data || tasksRes.data;

        setStats(statsData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        toast.error('Strategic nodes synchronizing...');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusChartData = stats ? [
    { name: 'To Do', value: stats.todo || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Completed', value: stats.completed || 0 }
  ] : [];

  const priorityChartData = stats?.priorityDistribution ? 
    Object.entries(stats.priorityDistribution).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Command Center</p>
          <h1 className="text-5xl font-black serif-font text-[#0F4335]">
            Welcome, <span className="text-[#C5A358] italic">{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
          </h1>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-[#0F4335] uppercase tracking-widest">Active Status</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 serif-font italic tracking-wide">{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/tasks" className="btn-secondary px-8">MY WORKSPACE</Link>
          {isAdmin() && <Link to="/projects" className="btn-primary">INITIATIVE</Link>}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Global Initiatives" value={projects?.length ?? 0} icon={HiOutlineFolder} loading={loading} />
        <StatCard title="Active Milestones" value={stats?.totalTasks ?? 0} icon={HiOutlineClipboardList} loading={loading} />
        <StatCard title="Success Stories" value={stats?.completed ?? 0} icon={HiOutlineCheckCircle} loading={loading} />
        <StatCard title="Critical Nodes" value={stats?.overdue ?? 0} icon={HiOutlineExclamationCircle} loading={loading} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="card !p-10 group">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold text-[#0F4335] serif-font italic">Status Metrics</h2>
            <HiOutlineTrendingUp className="text-[#C5A358] w-6 h-6" />
          </div>
          {loading ? (
            <div className="h-64 skeleton rounded-[2rem]"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={statusChartData} 
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    innerRadius={60} 
                    paddingAngle={8}
                    stroke="none"
                  >
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card lg:col-span-2 !p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold text-[#0F4335] serif-font italic">Priority Distribution</h2>
            <div className="px-4 py-1 bg-[#F9F7F2] rounded-full text-[10px] font-black text-[#0F4335] tracking-widest uppercase">Efficiency</div>
          </div>
          {loading ? (
            <div className="h-64 skeleton rounded-[2rem]"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {priorityChartData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#0F4335'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="card !p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0F4335] serif-font italic">Recent Initiatives</h2>
            <Link to="/projects" className="text-[10px] font-black text-[#C5A358] uppercase tracking-widest hover:text-[#0F4335] transition-colors">Observe All</Link>
          </div>
          <div className="space-y-6">
            {projects.map(project => (
              <div key={project._id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-[#F9F7F2] hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0F4335] shadow-inner group-hover:bg-[#C5A358] group-hover:text-white transition-all">
                    <HiOutlineFolder className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#0F4335] serif-font italic">{project.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {project.status || 'Active'}</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#C5A358] serif-font italic">{project.progress ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card !p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0F4335] serif-font italic">Live Milestones</h2>
            <Link to="/tasks" className="text-[10px] font-black text-[#C5A358] uppercase tracking-widest hover:text-[#0F4335] transition-colors">Strategic View</Link>
          </div>
          <div className="space-y-6">
            {tasks.map(task => (
              <div key={task._id} className="flex items-center justify-between p-6 rounded-[2rem] bg-[#F9F7F2] hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-[#C5A358]'
                  }`}>
                    {task.status === 'completed' ? <HiOutlineCheckCircle /> : <HiOutlineClock />}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#0F4335] serif-font italic">{task.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'TBD'}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${task.priority === 'High' ? 'bg-red-500 animate-pulse' : 'bg-[#C5A358]'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
