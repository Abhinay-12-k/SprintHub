import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import { HiOutlineDotsHorizontal, HiOutlineClock, HiOutlineChatAlt, HiOutlineLightningBolt } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Kanban = () => {
  const socket = useSocket();
  const [tasks, setTasks] = useState({
    todo: [],
    'in-progress': [],
    completed: []
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  useEffect(() => {
    if (socket) {
      socket.on('task-updated', (data) => loadData());
      socket.on('task-created', () => loadData());
      socket.on('task-deleted', () => loadData());
      return () => {
        socket.off('task-updated');
        socket.off('task-created');
        socket.off('task-deleted');
      };
    }
  }, [socket, selectedProject]);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getAll(selectedProject !== 'all' ? { projectId: selectedProject } : {}),
        projectService.getAll()
      ]);
      const allTasks = tasksRes.data.data?.tasks || tasksRes.data.tasks || tasksRes.data.data || tasksRes.data;
      const projectsData = projectsRes.data.data?.projects || projectsRes.data.projects || projectsRes.data.data || projectsRes.data;
      const tasksList = Array.isArray(allTasks) ? allTasks : [];
      setTasks({
        todo: tasksList.filter(t => t.status === 'todo'),
        'in-progress': tasksList.filter(t => t.status === 'in-progress'),
        completed: tasksList.filter(t => t.status === 'completed')
      });
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      toast.error('Failed to load Kanban board');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = [...tasks[source.droppableId]];
    const destColumn = destination.droppableId === source.droppableId ? sourceColumn : [...tasks[destination.droppableId]];
    const [removed] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, removed);

    setTasks({ ...tasks, [source.droppableId]: sourceColumn, [destination.droppableId]: destColumn });

    try {
      await taskService.update(draggableId, { status: destination.droppableId });
    } catch (error) {
      toast.error('Failed to update task status');
      loadData();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Workflow Visualization</p>
           <h1 className="text-5xl font-black text-[#0F4335] serif-font italic">Strategic <span className="text-[#C5A358]">Board</span></h1>
        </div>
        
        <div className="bg-white p-2 rounded-full shadow-sm flex items-center">
           <HiOutlineLightningBolt className="w-5 h-5 text-[#C5A358] ml-4" />
           <select 
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[#0F4335] focus:ring-0 w-48 cursor-pointer"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">Global Initiatives</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-10 overflow-x-auto pb-10 no-scrollbar">
          {Object.entries(tasks).map(([columnId, columnTasks]) => (
            <div key={columnId} className="flex flex-col w-96 min-w-[380px]">
              <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    columnId === 'todo' ? 'bg-[#C5A358]' : 
                    columnId === 'in-progress' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`}></div>
                  <h3 className="text-xs font-black text-[#0F4335] uppercase tracking-[0.3em]">
                    {columnId.replace('-', ' ')}
                  </h3>
                  <span className="bg-[#0F4335]/5 text-[#0F4335] text-[10px] font-black px-3 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <HiOutlineDotsHorizontal className="w-5 h-5 text-slate-300" />
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 flex flex-col gap-6 p-6 rounded-[3rem] transition-all duration-300 ${
                      snapshot.isDraggingOver ? 'bg-[#0F4335]/5 scale-[0.98]' : 'bg-[#F9F7F2]'
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all ${
                              snapshot.isDragging ? 'rotate-3 scale-110 shadow-2xl z-50 ring-4 ring-[#C5A358]/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-6">
                              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {task.priority}
                              </span>
                              <HiOutlineClock className="w-4 h-4 text-slate-300" />
                            </div>
                            
                            <h4 className="text-xl font-bold text-[#0F4335] serif-font italic mb-4 leading-tight">
                              {task.title}
                            </h4>
                            
                            <p className="text-sm text-slate-400 italic serif-font line-clamp-2 mb-8">
                              {task.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                              <div className="w-10 h-10 rounded-2xl bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] font-black text-sm shadow-inner group-hover:bg-[#C5A358] transition-all">
                                {task.assignedTo?.name?.charAt(0) || '?'}
                              </div>
                              <div className="flex items-center gap-4 text-slate-300">
                                <div className="flex items-center gap-2">
                                  <HiOutlineChatAlt className="w-4 h-4" />
                                  <span className="text-[10px] font-black">4</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
