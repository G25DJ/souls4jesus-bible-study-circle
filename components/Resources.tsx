
import React, { useState, useEffect, useRef } from 'react';
import { Book, Video, Headphones, FileText, Download, ExternalLink, Edit2, Check, X, Trash2, PlusCircle, FolderPlus, Save, Upload, Paperclip, File } from 'lucide-react';

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
  dataUrl?: string; // Base64 encoded file content
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle edit mode and sync state
  const toggleEditMode = () => {
    if (!isEditing) {
      setEditCategories([...categories]);
      setEditFiles([...files]);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    // Re-calculate counts before saving
    const updatedCategories = editCategories.map(cat => ({
      ...cat,
      items: editFiles.filter(f => f.category === cat.title).length
    }));

    setCategories(updatedCategories);
    setFiles(editFiles);
    localStorage.setItem('s4j_resource_categories', JSON.stringify(updatedCategories));
    localStorage.setItem('s4j_resource_files', JSON.stringify(editFiles));
    setIsEditing(false);
  };

  const addCategory = () => {
    const newCat: ResourceCategory = {
      id: Date.now().toString(),
      title: 'New Folder',
      items: 0,
      iconType: 'file'
    };
    if (!isEditing) {
      setEditCategories([...categories, newCat]);
      setEditFiles([...files]);
      setIsEditing(true);
    } else {
      setEditCategories([...editCategories, newCat]);
    }
  };

  const removeCategory = (id: string) => {
    setEditCategories(editCategories.filter(c => c.id !== id));
  };

  const addFile = () => {
    const newFile: ResourceFile = {
      id: Date.now().toString(),
      name: 'New Resource Title',
      type: 'PDF',
      size: '0.5 MB',
      category: editCategories[0]?.title || categories[0]?.title || 'General'
    };
    if (!isEditing) {
      setEditCategories([...categories]);
      setEditFiles([newFile, ...files]);
      setIsEditing(true);
    } else {
      setEditFiles([newFile, ...editFiles]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const extension = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      const sizeStr = selectedFile.size > 1024 * 1024 
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(selectedFile.size / 1024).toFixed(1)} KB`;

      const newFile: ResourceFile = {
        id: Date.now().toString(),
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
        type: extension,
        size: sizeStr,
        category: editCategories[0]?.title || categories[0]?.title || 'General',
        dataUrl: dataUrl
      };

      if (!isEditing) {
        setEditCategories([...categories]);
        setEditFiles([newFile, ...files]);
        setIsEditing(true);
      } else {
        setEditFiles([newFile, ...editFiles]);
      }
    };
    reader.readAsDataURL(selectedFile);
    // Reset input value to allow selecting the same file again if needed
    event.target.value = '';
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

  const handleDownload = (file: ResourceFile) => {
    if (!file.dataUrl) return;
    
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = `${file.name}.${file.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderIcon = (type: string, className: string) => {
    const t = type.toLowerCase();
    if (['mp4', 'mov', 'video'].includes(t)) return <Video className={`text-rose-500 ${className}`} />;
    if (['mp3', 'wav', 'audio'].includes(t)) return <Headphones className={`text-amber-500 ${className}`} />;
    if (['pdf', 'docx', 'doc', 'txt', 'file'].includes(t)) return <FileText className={`text-blue-500 ${className}`} />;
    if (['epub', 'mobi', 'book'].includes(t)) return <Book className={`text-emerald-500 ${className}`} />;
    return <File className={`text-stone-400 ${className}`} />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="text-center max-w-2xl mx-auto relative group">
        {isAdmin && (
          <div className="absolute -top-4 -right-12 flex flex-col gap-2">
            <button 
              onClick={toggleEditMode}
              className={`p-3 rounded-full shadow-lg transition-all border ${
                isEditing ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-stone-400 hover:text-amber-600 border-stone-200'
              }`}
              title={isEditing ? 'Cancel Editing' : 'Manage Library'}
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
            {isEditing && (
              <button 
                onClick={saveChanges}
                className="p-3 rounded-full bg-stone-900 text-white shadow-lg border border-stone-800 hover:bg-stone-800 transition-all"
                title="Save Changes"
              >
                <Save size={20} />
              </button>
            )}
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 serif">Resource Library</h2>
        <p className="text-stone-500">
          A curated collection of study materials, videos, and guides to support your growth in faith.
        </p>
      </header>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect}
      />

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {(isEditing ? editCategories : categories).map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center hover:border-amber-400 transition-all cursor-pointer group relative overflow-hidden">
            {isEditing && (
              <button 
                onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                className="absolute top-2 right-2 p-1 text-stone-300 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              {renderIcon(cat.iconType, 'w-7 h-7')}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={cat.title}
                  onChange={e => updateCategory(cat.id, { title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-bold text-center focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="Category"
                />
                <select 
                  value={cat.iconType}
                  onChange={e => updateCategory(cat.id, { iconType: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-1 py-0.5 text-[10px] text-center outline-none"
                >
                  <option value="file">File Icon</option>
                  <option value="video">Video Icon</option>
                  <option value="audio">Audio Icon</option>
                  <option value="book">Book Icon</option>
                </select>
              </div>
            ) : (
              <>
                <h4 className="font-bold text-stone-900 truncate">{cat.title}</h4>
                <p className="text-xs text-stone-400 mt-1">{cat.items} resources</p>
              </>
            )}
          </div>
        ))}

        {isAdmin && (
          <button 
            onClick={addCategory}
            className="bg-stone-50 rounded-3xl p-6 border border-dashed border-stone-300 text-center hover:border-amber-400 hover:bg-white transition-all group flex flex-col items-center justify-center min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-amber-600 group-hover:border-amber-200 transition-all mb-2">
              <FolderPlus size={20} />
            </div>
            <span className="text-xs font-bold text-stone-400 group-hover:text-amber-600">Add Category</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-stone-800 serif text-xl">Study Materials</h3>
          
          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleUploadClick} 
                className="flex-1 sm:flex-none px-6 py-2 bg-stone-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-900 transition-all shadow-sm active:scale-95"
              >
                <Upload size={16} /> Upload File
              </button>
              <button 
                onClick={addFile} 
                className="flex-1 sm:flex-none px-6 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-sm active:scale-95"
              >
                <PlusCircle size={16} /> Manual Add
              </button>
              {isEditing && (
                <button 
                  onClick={saveChanges} 
                  className="flex-1 sm:flex-none px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-sm active:scale-95"
                >
                  <Check size={16} /> Save Changes
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="divide-y divide-stone-100">
          {(isEditing ? editFiles : files).length === 0 ? (
            <div className="p-20 text-center text-stone-400 italic flex flex-col items-center">
              <Book size={48} className="text-stone-100 mb-4" />
              <p>Your library is currently waiting for wisdom.</p>
              {isAdmin && (
                <div className="flex gap-4 mt-4">
                  <button onClick={handleUploadClick} className="text-amber-600 font-bold text-sm hover:underline">Upload your first file</button>
                  <span className="text-stone-300">or</span>
                  <button onClick={addFile} className="text-amber-600 font-bold text-sm hover:underline">add an entry manually</button>
                </div>
              )}
            </div>
          ) : (
            (isEditing ? editFiles : files).map((file) => (
              <div key={file.id} className="p-6 flex items-center justify-between hover:bg-stone-50/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                    {renderIcon(file.type, 'w-6 h-6')}
                  </div>
                  
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 mr-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={file.name}
                          onChange={e => updateFile(file.id, { name: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                          placeholder="File Name"
                        />
                        {file.dataUrl && <Paperclip size={12} className="absolute right-3 top-3 text-stone-400" title="Has attachment" />}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={file.type}
                          onChange={e => updateFile(file.id, { type: e.target.value })}
                          className="w-1/2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                          placeholder="Type (e.g. PDF)"
                        />
                        <input 
                          type="text" 
                          value={file.size}
                          onChange={e => updateFile(file.id, { size: e.target.value })}
                          className="w-1/2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                          placeholder="Size (e.g. 2 MB)"
                        />
                      </div>
                      <select 
                        value={file.category}
                        onChange={e => updateFile(file.id, { category: e.target.value })}
                        className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-amber-600 font-bold outline-none cursor-pointer"
                      >
                        {(isEditing ? editCategories : categories).length > 0 ? (
                          (isEditing ? editCategories : categories).map(c => <option key={c.id} value={c.title}>{c.title}</option>)
                        ) : (
                          <option value="General">General</option>
                        )}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors">{file.name}</h5>
                        {file.dataUrl && <Paperclip size={12} className="text-stone-300" />}
                      </div>
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

                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Resource"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => file.dataUrl && handleDownload(file)}
                        disabled={!file.dataUrl}
                        className={`p-3 rounded-xl border border-transparent transition-all shadow-sm ${
                          file.dataUrl 
                            ? 'text-stone-400 hover:text-amber-600 hover:bg-white hover:border-stone-200' 
                            : 'text-stone-200 cursor-not-allowed'
                        }`}
                        title={file.dataUrl ? 'Download Attachment' : 'No attachment available'}
                      >
                        <Download size={20} />
                      </button>
                      <button className="p-3 text-stone-400 hover:text-amber-600 hover:bg-white rounded-xl border border-transparent hover:border-stone-200 transition-all shadow-sm">
                        <ExternalLink size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-stone-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1000" alt="Church" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 serif">Missing something?</h3>
          <p className="text-stone-400 mb-8 leading-relaxed">
            Let us know if there's a specific study topic or resource you'd like to see added to our shared library.
          </p>
          <button className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95">
            Request a Resource
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;
