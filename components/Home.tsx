
import React, { useState, useEffect } from 'react';
import { getDailyVerse } from '../services/geminiService';
import { DailyVerse, Tab, Resource } from '../types';
import { 
  Sparkles, 
  Quote, 
  ArrowRight, 
  Heart, 
  RefreshCw, 
  MessageCircle, 
  MessageSquare, 
  Edit2, 
  Check, 
  X, 
  Plus, 
  Trash2,
  FileText
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: Tab) => void;
  isAdmin?: boolean;
}

interface MeetingInfo {
  time: string;
  topic: string;
  whatsappLink: string;
  discordLink: string;
}

const DEFAULT_MEETING: MeetingInfo = {
  time: '7:00 PM',
  topic: 'Book of James, Chapter 1',
  whatsappLink: 'https://chat.whatsapp.com/CedwGPg5qByF4Bg55nirSX',
  discordLink: 'https://discord.gg/aQVB4uUF'
};

const DEFAULT_RESOURCES: Resource[] = [
  { id: '1', title: 'New Testament Overview', type: 'PDF', link: '#' },
  { id: '2', title: 'Guided Prayer - Peace', type: 'MP3', link: '#' },
  { id: '3', title: 'Prayer Request Form', type: 'DOC', link: '#' }
];

const Home: React.FC<HomeProps> = ({ onNavigate, isAdmin = false }) => {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reflection editing state
  const [isEditingVerse, setIsEditingVerse] = useState(false);
  const [editVerseValues, setEditVerseValues] = useState<DailyVerse | null>(null);

  // Meeting editing state
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>(() => {
    const saved = localStorage.getItem('s4j_meeting_info');
    return saved ? JSON.parse(saved) : DEFAULT_MEETING;
  });
  const [editMeetingValues, setEditMeetingValues] = useState<MeetingInfo>(meetingInfo);

  // Resources state
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('s4j_resources');
    return saved ? JSON.parse(saved) : DEFAULT_RESOURCES;
  });
  const [editResourceList, setEditResourceList] = useState<Resource[]>(resources);

  const fetchVerse = async (forceRefresh = false) => {
    const savedVerse = localStorage.getItem('s4j_custom_verse');
    if (savedVerse && !forceRefresh) {
      setVerse(JSON.parse(savedVerse));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getDailyVerse();
      setVerse(data);
    } catch (error) {
      console.error("Failed to fetch verse", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  // Handlers for Saving
  const handleSaveVerse = () => {
    if (editVerseValues) {
      setVerse(editVerseValues);
      localStorage.setItem('s4j_custom_verse', JSON.stringify(editVerseValues));
      setIsEditingVerse(false);
    }
  };

  const handleSaveMeeting = () => {
    setMeetingInfo(editMeetingValues);
    localStorage.setItem('s4j_meeting_info', JSON.stringify(editMeetingValues));
    setIsEditingMeeting(false);
  };

  const handleSaveResources = () => {
    setResources(editResourceList);
    localStorage.setItem('s4j_resources', JSON.stringify(editResourceList));
    setIsEditingResources(false);
  };

  // Resource Editing Logic
  const addResource = () => {
    const newRes: Resource = {
      id: Date.now().toString(),
      title: 'New Resource',
      type: 'PDF',
      link: '#'
    };
    setEditResourceList([...editResourceList, newRes]);
  };

  const removeResource = (id: string) => {
    setEditResourceList(editResourceList.filter(r => r.id !== id));
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setEditResourceList(editResourceList.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white p-8 md:p-16">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1000" 
            alt="Nature path" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Grow Your Faith in <span className="text-amber-400">Community.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 mb-10 leading-relaxed">
            Join the Souls4Jesus Bible Study Circle. A place to explore scriptures, share reflections, and support each other through our spiritual journeys.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('planner')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20"
            >
              Start a Study <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('community')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full font-bold transition-all"
            >
              Join the Circle
            </button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-start">
        {/* Daily Verse Section */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-12 shadow-sm relative group">
            {isAdmin && !isEditingVerse && (
              <button 
                onClick={() => { setEditVerseValues(verse); setIsEditingVerse(true); }}
                className="absolute top-4 right-16 p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-all"
                title="Edit Daily Verse"
              >
                <Edit2 size={16} />
              </button>
            )}

            <div className="absolute top-8 right-8 text-amber-100">
              <Quote size={80} strokeWidth={1} />
            </div>
            
            <div className="flex items-center gap-2 text-amber-600 font-semibold mb-6">
              <Sparkles size={18} />
              <span className="uppercase tracking-wider text-xs">AI Daily Inspiration</span>
              <button 
                onClick={() => fetchVerse(true)}
                disabled={loading}
                className="ml-auto p-2 text-stone-400 hover:text-amber-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-stone-100 rounded w-3/4"></div>
                <div className="h-4 bg-stone-100 rounded w-full"></div>
                <div className="h-20 bg-stone-100 rounded w-full mt-8"></div>
              </div>
            ) : isEditingVerse && editVerseValues ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <textarea 
                  value={editVerseValues.text}
                  onChange={e => setEditVerseValues({...editVerseValues, text: e.target.value})}
                  className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-lg focus:outline-none min-h-[100px]"
                  placeholder="Verse Text"
                />
                <input 
                  type="text" 
                  value={editVerseValues.reference}
                  onChange={e => setEditVerseValues({...editVerseValues, reference: e.target.value})}
                  className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  placeholder="Reference (e.g., John 3:16)"
                />
                <textarea 
                  value={editVerseValues.reflection}
                  onChange={e => setEditVerseValues({...editVerseValues, reflection: e.target.value})}
                  className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none min-h-[120px]"
                  placeholder="Reflection"
                />
                <textarea 
                  value={editVerseValues.prayer}
                  onChange={e => setEditVerseValues({...editVerseValues, prayer: e.target.value})}
                  className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-sm italic focus:outline-none"
                  placeholder="Prayer"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveVerse} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Check size={18} /> Save</button>
                  <button onClick={() => setIsEditingVerse(false)} className="px-6 py-3 bg-white text-stone-500 rounded-xl font-bold border border-stone-200"><X size={18} /></button>
                </div>
              </div>
            ) : verse ? (
              <>
                <blockquote className="text-2xl md:text-3xl italic serif text-stone-800 mb-4 leading-snug">
                  "{verse.text}"
                </blockquote>
                <cite className="block text-amber-700 font-bold text-lg mb-8 not-italic">
                  — {verse.reference}
                </cite>
                <div className="pt-8 border-t border-stone-100">
                  <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Heart size={18} className="text-rose-400 fill-rose-400" />
                    Today's Reflection
                  </h3>
                  <p className="text-stone-600 leading-relaxed mb-6 whitespace-pre-wrap">{verse.reflection}</p>
                  <div className="bg-stone-50 p-6 rounded-2xl italic text-stone-500 text-sm border-l-4 border-amber-300">
                    " {verse.prayer} "
                  </div>
                </div>
              </>
            ) : (
              <p>Unable to load today's inspiration.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Meeting Section */}
          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 relative group">
            {isAdmin && !isEditingMeeting && (
              <button 
                onClick={() => { setEditMeetingValues(meetingInfo); setIsEditingMeeting(true); }}
                className="absolute top-4 right-4 p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-all"
                title="Edit Meeting Info"
              >
                <Edit2 size={16} />
              </button>
            )}

            <h3 className="text-xl font-bold mb-4 text-amber-900 serif">Join Tonight's Meeting</h3>
            
            {isEditingMeeting ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <input 
                  type="text" 
                  value={editMeetingValues.time}
                  onChange={e => setEditMeetingValues({...editMeetingValues, time: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="Time"
                />
                <input 
                  type="text" 
                  value={editMeetingValues.topic}
                  onChange={e => setEditMeetingValues({...editMeetingValues, topic: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="Topic"
                />
                <input 
                  type="text" 
                  value={editMeetingValues.whatsappLink}
                  onChange={e => setEditMeetingValues({...editMeetingValues, whatsappLink: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="WhatsApp Link"
                />
                <input 
                  type="text" 
                  value={editMeetingValues.discordLink}
                  onChange={e => setEditMeetingValues({...editMeetingValues, discordLink: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="Discord Link"
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveMeeting} className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-bold text-xs"><Check size={14} className="inline mr-1" /> Save</button>
                  <button onClick={() => setIsEditingMeeting(false)} className="px-3 py-2 bg-white text-stone-500 rounded-lg font-bold text-xs border border-stone-200"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-amber-800/80 text-sm mb-6">
                  We are meeting at <span className="font-bold text-amber-900">{meetingInfo.time}</span> to discuss the <span className="font-bold text-amber-900">{meetingInfo.topic}</span>. Choose your platform:
                </p>
                <div className="flex -space-x-2 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white object-cover" src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="Member" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold shadow-sm">
                    +12
                  </div>
                </div>
                <div className="space-y-3">
                  <a href={meetingInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold flex items-center justify-center gap-3 no-underline">
                    <MessageCircle size={20} /> WhatsApp Group
                  </a>
                  <a href={meetingInfo.discordLink} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold flex items-center justify-center gap-3 no-underline">
                    <MessageSquare size={20} /> Discord Server
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Quick Resources Section */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative group">
            {isAdmin && !isEditingResources && (
              <button 
                onClick={() => { setEditResourceList(resources); setIsEditingResources(true); }}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-600 rounded-full transition-all"
                title="Edit Resources"
              >
                <Edit2 size={16} />
              </button>
            )}

            <h3 className="font-bold text-stone-900 mb-4">Quick Resources</h3>
            
            {isEditingResources ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {editResourceList.map((res) => (
                    <div key={res.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={res.type}
                          onChange={e => updateResource(res.id, { type: e.target.value })}
                          className="w-16 bg-white border border-stone-200 rounded px-2 py-1 text-[10px] font-bold uppercase"
                          placeholder="Type"
                        />
                        <input 
                          type="text" 
                          value={res.title}
                          onChange={e => updateResource(res.id, { title: e.target.value })}
                          className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-xs"
                          placeholder="Title"
                        />
                        <button onClick={() => removeResource(res.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded"><Trash2 size={14} /></button>
                      </div>
                      <input 
                        type="text" 
                        value={res.link}
                        onChange={e => updateResource(res.id, { link: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-[10px]"
                        placeholder="Link URL"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={addResource} className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs flex items-center justify-center gap-1 hover:bg-stone-50"><Plus size={14} /> Add Resource</button>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveResources} className="flex-1 py-2 bg-stone-900 text-white rounded-lg font-bold text-xs"><Check size={14} className="inline mr-1" /> Save</button>
                  <button onClick={() => setIsEditingResources(false)} className="px-3 py-2 bg-white text-stone-500 rounded-lg font-bold text-xs border border-stone-200"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {resources.map((res) => (
                  <li key={res.id} className="flex items-center gap-3 text-stone-600 hover:text-amber-600 cursor-pointer transition-colors group/item">
                    <a href={res.link} className="flex items-center gap-3 w-full no-underline text-inherit">
                      <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400 group-hover/item:bg-amber-100 group-hover/item:text-amber-600 transition-colors">
                        {res.type}
                      </div>
                      <span className="text-sm">{res.title}</span>
                    </a>
                  </li>
                ))}
                {resources.length === 0 && <p className="text-xs text-stone-400 italic">No resources added yet.</p>}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
