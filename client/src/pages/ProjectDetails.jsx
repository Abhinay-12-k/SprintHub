import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { 
  HiOutlineFolder, 
  HiOutlineCalendar, 
  HiOutlineUsers, 
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrendingUp,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ projectId: id })
      ]);
      const projectData = projectRes.data.data?.project || projectRes.data.project || projectRes.data.data || projectRes.data;
      const tasksData = tasksRes.data.data?.tasks || tasksRes.data.tasks || tasksRes.data.data || tasksRes.data;
      setProject(projectData);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 skeleton rounded-[3rem]"></div>;

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-3 text-slate-400 hover:text-[#0F4335] transition-all group font-black text-[10px] uppercase tracking-[0.3em]"
      >
        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
        Return to Initiatives
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Info Card */}
          <div className="card !p-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-12">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-[#F9F7F2] rounded-[2.5rem] flex items-center justify-center text-[#0F4335] shadow-inner group-hover:bg-[#C5A358] transition-all">
                  <HiOutlineFolder className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#C5A358] uppercase tracking-[0.4em] mb-2">Project Brief</p>
                  <h1 className="text-5xl font-black text-[#0F4335] serif-font italic leading-tight">
                    {project.title}
                  </h1>
                </div>
              </div>
            </div>

            <p className="text-xl text-slate-500 leading-relaxed italic serif-font mb-12 border-l-4 border-[#C5A358] pl-8">
              {project.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#F9F7F2] rounded-2xl flex items-center justify-center text-[#C5A358]">
                  <HiOutlineCalendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</p>
                  <p className="text-sm font-bold text-[#0F4335] serif-font italic">
                    {project.dueDate ? format(new Date(project.dueDate), 'MMMM do, yyyy') : 'No due date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#F9F7F2] rounded-2xl flex items-center justify-center text-[#C5A358]">
                  <HiOutlineUsers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Team</p>
                  <p className="text-sm font-bold text-[#0F4335] serif-font italic">
                    {project.members?.length || 0} Members Engaged
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-[#0F4335] serif-font italic">Active Milestones</h2>
              {isAdmin() && (
                <button className="btn-primary px-8 text-xs">
                  <HiOutlinePlus className="w-4 h-4" />
                  NEW MILESTONE
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tasks.length === 0 ? (
                <div className="card !p-20 text-center border-dashed border-2 bg-transparent shadow-none">
                  <p className="text-slate-400 serif-font italic italic">No active milestones recorded for this initiative.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task._id} className="card !p-6 hover:shadow-xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' : 
                        task.status === 'in-progress' ? 'bg-[#C5A358]' : 'bg-slate-200'
                      }`}></div>
                      <div>
                        <p className="text-lg font-bold text-[#0F4335] serif-font italic group-hover:text-[#C5A358] transition-colors">{task.title}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{task.priority} Strategic Priority</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F9F7F2] text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-10">
          <div className="card !p-8 relative overflow-hidden bg-[#0F4335] text-white shadow-2xl">
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold serif-font italic text-[#C5A358]">Initiative Impact</h3>
                  <HiOutlineTrendingUp className="w-8 h-8 text-[#C5A358]" />
               </div>
               <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black serif-font italic text-white">{project.progress || 0}</span>
                  <span className="text-xl font-bold text-[#C5A358] serif-font italic">%</span>
               </div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Overall Completion</p>
               <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div 
                    style={{ width: `${project.progress || 0}%` }} 
                    className="bg-[#C5A358] h-full transition-all duration-1000 shadow-[0_0_20px_rgba(197,163,88,0.5)]"
                  ></div>
               </div>
            </div>
          </div>

          <div className="card !p-8">
            <h3 className="text-xl font-bold text-[#0F4335] serif-font italic mb-8">Deployed Strategists</h3>
            <div className="space-y-6">
              {project.members?.map((member, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] font-black serif-font text-lg shadow-inner group-hover:bg-[#C5A358] group-hover:text-white transition-all">
                    {member.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0F4335] serif-font italic truncate">{member.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{member.role}</p>
                  </div>
                  <HiOutlineShieldCheck className="w-5 h-5 text-[#C5A358]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
