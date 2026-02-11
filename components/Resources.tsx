
import React, { useState, useEffect } from 'react';
import { Book, Video, Headphones, FileText, Download, ExternalLink, Edit2, Check, X, Trash2, PlusCircle } from 'lucide-react';

interface ResourceCategory {
  id: string;
  title: string;
  items: number;
  iconType: 'file' | 'video' | 'audio' | 'book';
}

interface ResourceFile {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
}

interface ResourcesProps {
  isAdmin?: boolean;
}

const DEFAULT_CATEGORIES: ResourceCategory[] = [
  { id: '1', title: 'Study Guides', iconType: 'file', items: 0 },
  { id: '2', title: 'Video Series', iconType: 'video', items: 0 },
  { id: '3', title: 'Audio Teachings', iconType: 'audio', items: 0 },
  { id: '4', title: 'Commentaries', iconType: 'book', items: 0 },
];

const DEFAULT_FILES: ResourceFile[] = [];

const Resources: React.FC<ResourcesProps> = ({ isAdmin = false }) => {
  const [categories, setCategories] = useState<ResourceCategory[]>(() => {
    const saved = localStorage.getItem('s4j_resource_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [files, setFiles] = useState<ResourceFile[]>(() => {
    const saved = localStorage.getItem('s4j_resource_files');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editCategories, setEditCategories] = useState<ResourceCategory[]>([]);
  const [editFiles, setEditFiles] = useState<ResourceFile[]>([]);

  const toggleEditMode = () => {
    if (!isEditing) {
      setEditCategories([...categories]);
      setEditFiles([...files]);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    setCategories(editCategories);
    setFiles(editFiles);
    localStorage.setItem('s4j_resource_categories', JSON.stringify(editCategories));
    localStorage.setItem('s4j_resource_files', JSON.stringify(editFiles));
    setIsEditing(false);
  };

  const addFile = () => {
    const newFile: ResourceFile = {
      id: Date.now().toString(),
      name: 'New Resource Name',
      type: 'PDF',
      size: '0 KB',
      category: categories[0]?.title || 'Study Guides'
    };
    setEditFiles([...editFiles, newFile]);
  };

  const removeFile = (id: string) => {
    setEditFiles(editFiles.filter(f => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<ResourceFile>) => {
    setEditFiles(editFiles.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const updateCategory = (id: string, updates: Partial<ResourceCategory>) => {
    setEditCategories(editCategories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'file': return <FileText className={`text-blue-500 ${className}`} />;
      case 'video': return <Video className={`text-rose-500 ${className}`} />;
      case 'audio': return <Headphones className={`text-amber-500 ${className}`} />;
      case 'book': return <Book className={`text-emerald-500 ${className}`} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="text-center max-w-2xl mx-auto relative group">
        {isAdmin && (
          <button 
            onClick={toggleEditMode}
            className={`absolute -top-4 -right-12 p-3 rounded-full shadow-lg transition-all ${
              isEditing ? 'bg-amber-600 text-white' : 'bg-white text-stone-400 hover:text-amber-600'
            }`}
            title={isEditing ? 'Cancel Editing' : 'Manage Library'}
          >
            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
          </button>
        )}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 serif">Resource Library</h2>
        <p className="text-stone-500">
          A curated collection of study materials, videos, and guides to support your growth in faith.
        </p>
      </header>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {(isEditing ? editCategories : categories).map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center hover:border-amber-400 transition-all cursor-pointer group relative">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              {renderIcon(cat.iconType, 'w-7 h-7')}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={cat.title}
                  onChange={e => updateCategory(cat.id, { title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-bold text-center"
                />
                <div className="flex items-center justify-center gap-2">
                  <input 
                    type="number" 
                    value={cat.items}
                    onChange={e => updateCategory(cat.id, { items: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-stone-50 border border-stone-200 rounded px-1 py-0.5 text-[10px] text-center"
                  />
                  <span className="text-[10px] text-stone-400">items</span>
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-bold text-stone-900">{cat.title}</h4>
                <p className="text-xs text-stone-400 mt-1">{cat.items} resources</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
          <h3 className="font-bold text-stone-800">Recent Uploads</h3>
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={addFile} className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                <PlusCircle size={14} /> Add New
              </button>
              <button onClick={saveChanges} className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                <Check size={14} /> Save Changes
              </button>
            </div>
          ) : (
            <button className="text-amber-600 text-sm font-bold hover:underline">View All</button>
          )}
        </div>
        
        <div className="divide-y divide-stone-100">
          {(isEditing ? editFiles : files).length === 0 ? (
            <div className="p-12 text-center text-stone-400 italic">No resources found in the library.</div>
          ) : (
            (isEditing ? editFiles : files).map((file) => (
              <div key={file.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 mr-4">
                      <input 
                        type="text" 
                        value={file.name}
                        onChange={e => updateFile(file.id, { name: e.target.value })}
                        className="bg-white border border-stone-200 rounded px-3 py-2 text-xs font-bold"
                        placeholder="File Name"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={file.type}
                          onChange={e => updateFile(file.id, { type: e.target.value })}
                          className="w-1/2 bg-white border border-stone-200 rounded px-3 py-2 text-xs"
                          placeholder="Type (e.g. PDF)"
                        />
                        <input 
                          type="text" 
                          value={file.size}
                          onChange={e => updateFile(file.id, { size: e.target.value })}
                          className="w-1/2 bg-white border border-stone-200 rounded px-3 py-2 text-xs"
                          placeholder="Size"
                        />
                      </div>
                      <select 
                        value={file.category}
                        onChange={e => updateFile(file.id, { category: e.target.value })}
                        className="bg-white border border-stone-200 rounded px-3 py-2 text-xs text-amber-600 font-bold"
                      >
                        {categories.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-bold text-stone-900 text-sm">{file.name}</h5>
                      <div className="flex gap-2 text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-1">
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="text-amber-500">{file.category}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <>
                      <button className="p-2 text-stone-400 hover:text-amber-600 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-amber-600 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-stone-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1000" alt="Church" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 serif">Missing something?</h3>
          <p className="text-stone-400 mb-8">
            Let us know if there's a specific study topic or resource you'd like to see added to our library.
          </p>
          <button className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-all shadow-lg">
            Request a Resource
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;
