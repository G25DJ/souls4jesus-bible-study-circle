
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
  FileText,
  CalendarDays,
  ExternalLink
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: Tab) => void;
  isAdmin?: boolean;
}

interface MeetingInfo {
  time: string;
  topic: string;
}

const PERMANENT_WHATSAPP = "https://chat.whatsapp.com/CedwGPg5qByF4Bg55nirSX";
const PERMANENT_DISCORD = "https://discord.gg/sw2TA96M3X";

const DEFAULT_MEETING: MeetingInfo = {
  time: '',
  topic: '',
};

const INITIAL_RESOURCES: Resource[] = [];

const Home: React.FC<HomeProps> = ({ onNavigate, isAdmin = false }) => {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingVerse, setIsEditingVerse] = useState(false);
  const [editVerseValues, setEditVerseValues] = useState<DailyVerse | null>(null);

  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>(() => {
    const saved = localStorage.getItem('s4j_meeting_info');
    return saved ? JSON.parse(saved) : DEFAULT_MEETING;
  });
  const [editMeetingValues, setEditMeetingValues] = useState<MeetingInfo>(meetingInfo);

  const [isEditingResources, setIsEditingResources] = useState(false);
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('s4j_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
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

  const addResource = () => {
    const newRes: Resource = { id: Date.now().toString(), title: 'New Resource', type: 'PDF', link: '#' };
    setEditResourceList([...editResourceList, newRes]);
    setIsEditingResources(true);
  };

  const isMeetingScheduled = meetingInfo.time.trim() !== '' || meetingInfo.topic.trim() !== '';

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-stone-900 text-white p-8 md:p-16">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1000" alt="Path" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight serif">
            Grow Your Faith in <span className="text-amber-400">Community.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 mb-10 leading-relaxed">
            Welcome to Souls4Jesus. A public space for our Bible group to share, grow, and study together.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => onNavigate('community')} className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20">
              Go to Community <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative group">
            {isAdmin && !isEditingVerse && (
              <button onClick={() => { setEditVerseValues(verse); setIsEditingVerse(true); }} className="absolute top-4 right-16 p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-all">
                <Edit2 size={16} />
              </button>
            )}

            <div className="absolute top-8 right-8 text-amber-100"><Quote size={80} strokeWidth={1} /></div>
            
            <div className="flex items-center gap-2 text-amber-600 font-semibold mb-6">
              <Sparkles size={18} />
              <span className="uppercase tracking-wider text-xs">Daily Inspiration</span>
              <button onClick={() => fetchVerse(true)} disabled={loading} className="ml-auto p-2 text-stone-400 hover:text-amber-600 transition-colors disabled:opacity-50">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-stone-100 rounded w-3/4"></div>
                <div className="h-20 bg-stone-100 rounded w-full mt-8"></div>
              </div>
            ) : isEditingVerse && editVerseValues ? (
              <div className="space-y-4">
                <textarea value={editVerseValues.text} onChange={e => setEditVerseValues({...editVerseValues, text: e.target.value})} className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-lg outline-none min-h-[100px]" />
                <input type="text" value={editVerseValues.reference} onChange={e => setEditVerseValues({...editVerseValues, reference: e.target.value})} className="w-full bg-stone-50 border border-amber-200 rounded-xl px-4 py-3 text-sm outline-none" />
                <div className="flex gap-2">
                  <button onClick={handleSaveVerse} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Check size={18} /> Save</button>
                  <button onClick={() => setIsEditingVerse(false)} className="px-6 py-3 bg-white text-stone-500 rounded-xl font-bold border border-stone-200"><X size={18} /></button>
                </div>
              </div>
            ) : verse && (
              <>
                <blockquote className="text-2xl md:text-3xl italic serif text-stone-800 mb-4 leading-snug">"{verse.text}"</blockquote>
                <cite className="block text-amber-700 font-bold text-lg mb-8 not-italic">— {verse.reference}</cite>
                <div className="pt-8 border-t border-stone-100">
                  <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Heart size={18} className="text-rose-400 fill-rose-400" /> Reflection</h3>
                  <p className="text-stone-600 leading-relaxed mb-6 whitespace-pre-wrap serif text-lg">{verse.reflection}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <h3 className="text-xl font-bold mb-2 serif">Group Links</h3>
            <p className="text-stone-400 text-xs mb-6">Stay connected through our official channels.</p>
            <div className="space-y-3">
              <a href={PERMANENT_WHATSAPP} target="_blank" className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 no-underline shadow-lg">
                <MessageCircle size={22} /> WhatsApp Group
              </a>
              <a href={PERMANENT_DISCORD} target="_blank" className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 no-underline shadow-lg">
                <MessageSquare size={22} /> Discord Server
              </a>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 relative shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={20} className="text-amber-600" />
              <h3 className="text-xl font-bold text-amber-900 serif">Gathering</h3>
            </div>
            
            {isEditingMeeting ? (
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={editMeetingValues.topic}
                  onChange={e => setEditMeetingValues({...editMeetingValues, topic: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm outline-none"
                  placeholder="Topic"
                />
                <input 
                  type="text" 
                  value={editMeetingValues.time}
                  onChange={e => setEditMeetingValues({...editMeetingValues, time: e.target.value})}
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm outline-none uppercase text-[10px]"
                  placeholder="Date/Time"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveMeeting} className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold">Save</button>
                  <button onClick={() => setIsEditingMeeting(false)} className="px-3 py-2 bg-white text-stone-400 rounded-lg text-xs border border-stone-200">Cancel</button>
                </div>
              </div>
            ) : isMeetingScheduled ? (
              <div className="relative group">
                <button onClick={() => { setEditMeetingValues(meetingInfo); setIsEditingMeeting(true); }} className="absolute -top-10 right-0 p-1 text-amber-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14}/></button>
                <p className="text-amber-800/80 text-sm mb-3">Join our next study session:</p>
                <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl">
                  <p className="text-amber-900 font-bold serif leading-tight mb-1">{meetingInfo.topic}</p>
                  <p className="text-[10px] uppercase font-bold text-amber-600">{meetingInfo.time}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center border-2 border-dashed border-amber-200 rounded-2xl">
                <p className="text-xs text-amber-700 italic mb-2">No gathering scheduled.</p>
                <button onClick={() => setIsEditingMeeting(true)} className="text-[10px] font-bold text-amber-600 hover:underline">Schedule One</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm relative group">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-stone-900 serif">Shared Resources</h3>
               <button onClick={addResource} className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors"><Plus size={18} /></button>
            </div>
            
            {isEditingResources && editResourceList.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {editResourceList.map(res => (
                    <div key={res.id} className="flex gap-2 items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                      <input 
                        type="text" 
                        value={res.title}
                        onChange={e => setEditResourceList(editResourceList.map(r => r.id === res.id ? {...r, title: e.target.value} : r))}
                        className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-xs"
                        placeholder="Title"
                      />
                      <button onClick={() => setEditResourceList(editResourceList.filter(r => r.id !== res.id))} className="text-rose-400"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveResources} className="flex-1 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold">Save</button>
                  <button onClick={() => setIsEditingResources(false)} className="px-3 py-2 bg-white text-stone-400 rounded-lg text-xs border border-stone-200">Cancel</button>
                </div>
              </div>
            ) : resources.length > 0 ? (
              <ul className="space-y-3">
                {resources.map((res) => (
                  <li key={res.id} className="flex items-center gap-3 text-stone-600 hover:text-amber-600 cursor-pointer group/item">
                    <a href={res.link} className="flex items-center gap-3 w-full no-underline text-inherit">
                      <div className="w-8 h-8 rounded bg-stone-50 flex items-center justify-center text-[10px] font-bold text-stone-400 group-hover/item:bg-amber-50 group-hover/item:text-amber-600 transition-colors">{res.type}</div>
                      <span className="text-sm font-medium">{res.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center border-2 border-dashed border-stone-100 rounded-2xl">
                <p className="text-xs text-stone-400 italic mb-2">No resources shared yet.</p>
                <button onClick={addResource} className="text-[10px] font-bold text-amber-600 hover:underline">Add Resource</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
