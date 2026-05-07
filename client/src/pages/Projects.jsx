import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import { 
  HiOutlineFolder, 
  HiOutlinePlus, 
  HiOutlineSearch, 
  HiOutlineUsers, 
  HiOutlineCalendar, 
  HiOutlineDotsVertical,
  HiOutlineTrendingUp
} from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import userService from '../services/userService';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    members: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (isAdmin()) {
        const [projectsRes, usersRes] = await Promise.all([
          projectService.getAll(),
          userService.getAll()
        ]);
        const projectsData = projectsRes.data.data?.projects || projectsRes.data.projects || projectsRes.data.data || projectsRes.data;
        const usersData = usersRes.data.data?.users || usersRes.data.users || usersRes.data.data || usersRes.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        const response = await projectService.getAll();
        const projectsData = response.data.data?.projects || response.data.projects || response.data.data || response.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }
    } catch (error) {
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      toast.success('Project created successfully');
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '', members: [] });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const toggleMember = (userId) => {
    const members = [...formData.members];
    const index = members.indexOf(userId);
    if (index > -1) {
      members.splice(index, 1);
    } else {
      members.push(userId);
    }
    setFormData({ ...formData, members });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Strategic Planning</p>
          <h1 className="text-5xl font-black serif-font italic">
            Global <span className="text-[#C5A358]">Initiatives</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-white rounded-full px-6 py-3 w-64 group focus-within:ring-4 focus-within:ring-[#0F4335]/5 transition-all shadow-sm">
            <HiOutlineSearch className="text-slate-300 w-5 h-5 group-focus-within:text-[#0F4335]" />
            <input 
              type="text" 
              placeholder="Filter projects..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin() && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <HiOutlinePlus className="w-5 h-5" />
              NEW PROJECT
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-80 skeleton rounded-[3rem]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredProjects.map((project) => (
            <Link 
              key={project._id} 
              to={`/projects/${project._id}`}
              className="kpi-card group !p-10 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#F9F7F2] rounded-[2rem] flex items-center justify-center text-[#0F4335] shadow-inner group-hover:bg-[#C5A358] group-hover:text-white transition-all duration-500">
                  <HiOutlineFolder className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F9F7F2] rounded-full">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <span className="text-[10px] font-black text-[#0F4335] uppercase tracking-widest">{project.progress ?? 0}%</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#0F4335] serif-font italic mb-4 group-hover:text-[#C5A358] transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-10 leading-relaxed italic serif-font">
                {project.description}
              </p>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#C5A358] border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Team</span>
                </div>
                <div className="flex items-center gap-2 text-[#C5A358]">
                  <HiOutlineCalendar className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {project.dueDate ? format(new Date(project.dueDate), 'MMM d') : 'TBD'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Simplified Modal logic would go here, matching the new UI style */}
    </div>
  );
};

export default Projects;
