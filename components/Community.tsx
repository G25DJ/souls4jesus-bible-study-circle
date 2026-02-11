
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Heart, Share2, ThumbsUp, PlusCircle, Edit2, Check, X, 
  Trash2, Send, Loader2, User, HandHeart, Clock, Info, ExternalLink, MessageCircle, Sparkles
} from 'lucide-react';
import { Circle } from '../types';
import { seedCommunityContent } from '../services/geminiService';

interface CommunityProps {
  isAdmin?: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  isAdmin?: boolean;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  loves: number;
  shares: number;
  comments: number; 
  commentsList?: Comment[];
  timestamp: number;
}

interface PrayerRequest {
  id: string;
  author: string;
  content: string;
  prayingCount: number;
  time: string;
  timestamp: number;
}

const PERMANENT_WHATSAPP = "https://chat.whatsapp.com/CedwGPg5qByF4Bg55nirSX";
const PERMANENT_DISCORD = "https://discord.gg/sw2TA96M3X";
const DEFAULT_CIRCLES: Circle[] = [];

const Community: React.FC<CommunityProps> = ({ isAdmin = false }) => {
  const [circles, setCircles] = useState<Circle[]>(() => {
    const saved = localStorage.getItem('s4j_circles');
    return saved ? JSON.parse(saved) : DEFAULT_CIRCLES;
  });
  const [isEditingCircles, setIsEditingCircles] = useState(false);
  const [editCirclesList, setEditCirclesList] = useState<Circle[]>([]);
  
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('s4j_community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('s4j_prayer_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSeeding, setIsSeeding] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [newPrayerContent, setNewPrayerContent] = useState('');
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

  const [userReactions, setUserReactions] = useState<{ [postId: string]: { liked?: boolean, loved?: boolean } }>(() => {
    const saved = localStorage.getItem('s4j_user_reactions');
    return saved ? JSON.parse(saved) : {};
  });

  const [prayedFor, setPrayedFor] = useState<{ [id: string]: boolean }>(() => {
    const saved = localStorage.getItem('s4j_prayed_for');
    return saved ? JSON.parse(saved) : {};
  });

  // Seed community if empty
  useEffect(() => {
    const hasSeeded = localStorage.getItem('s4j_has_seeded') === 'true';
    if (posts.length === 0 && !hasSeeded) {
      handleSeed();
    }
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const content = await seedCommunityContent();
      
      const seededPosts: Post[] = content.posts.map((p: any, i: number) => ({
        id: `seed-post-${i}`,
        author: p.author,
        avatar: `https://picsum.photos/seed/post${i}/100/100`,
        time: 'Earlier today',
        content: p.content,
        likes: p.likes || 0,
        loves: Math.floor(Math.random() * 5),
        shares: Math.floor(Math.random() * 2),
        comments: 0,
        timestamp: Date.now() - (i * 3600000)
      }));

      const seededPrayers: PrayerRequest[] = content.prayers.map((p: any, i: number) => ({
        id: `seed-prayer-${i}`,
        author: p.author,
        content: p.content,
        prayingCount: p.prayingCount || 0,
        time: 'Today',
        timestamp: Date.now() - (i * 7200000)
      }));

      setPosts(seededPosts);
      setPrayerRequests(seededPrayers);
      localStorage.setItem('s4j_has_seeded', 'true');
    } catch (e) {
      console.error("Seeding failed", e);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('s4j_community_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('s4j_user_reactions', JSON.stringify(userReactions));
  }, [userReactions]);

  useEffect(() => {
    localStorage.setItem('s4j_prayer_requests', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    localStorage.setItem('s4j_prayed_for', JSON.stringify(prayedFor));
  }, [prayedFor]);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        author: isAdmin ? 'Admin Shepherd' : 'Community Member',
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
        time: 'Just now',
        content: newPostContent,
        likes: 0,
        loves: 0,
        shares: 0,
        comments: 0,
        commentsList: [],
        timestamp: Date.now()
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setIsPosting(false);
    }, 400);
  };

  const handleInteraction = (postId: string, type: 'like' | 'love') => {
    const isLiked = userReactions[postId]?.liked;
    const isLoved = userReactions[postId]?.loved;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (type === 'like') return { ...post, likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1 };
        return { ...post, loves: isLoved ? Math.max(0, post.loves - 1) : post.loves + 1 };
      }
      return post;
    }));
    setUserReactions(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [type === 'like' ? 'liked' : 'loved']: type === 'like' ? !isLiked : !isLoved
      }
    }));
  };

  const handleAddPrayer = () => {
    if (!newPrayerContent.trim()) return;
    const newRequest: PrayerRequest = {
      id: Date.now().toString(),
      author: isAdmin ? 'Admin Shepherd' : 'Community Member',
      content: newPrayerContent.trim(),
      prayingCount: 0,
      time: 'Just now',
      timestamp: Date.now()
    };
    setPrayerRequests([newRequest, ...prayerRequests]);
    setNewPrayerContent('');
  };

  const handlePray = (id: string) => {
    if (prayedFor[id]) return;
    setPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, prayingCount: p.prayingCount + 1 } : p));
    setPrayedFor(prev => ({ ...prev, [id]: true }));
  };

  const deletePrayer = (id: string) => {
    if (!isAdmin) return;
    setPrayerRequests(prev => prev.filter(p => p.id !== id));
  };

  const handleCommentSubmit = (postId: string) => {
    const content = newCommentText[postId];
    if (!content?.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: isAdmin ? 'Admin Shepherd' : 'Community Member',
      content: content.trim(),
      time: 'Just now',
      isAdmin: isAdmin
    };
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...(post.commentsList || []), newComment]
        };
      }
      return post;
    }));
    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (postId: string) => {
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, shares: post.shares + 1 } : post));
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`).then(() => {
      setShareFeedback(postId);
      setTimeout(() => setShareFeedback(null), 2000);
    });
  };

  const handleDeletePost = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Remove from the community circle?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleSaveCircles = () => {
    setCircles(editCirclesList);
    localStorage.setItem('s4j_circles', JSON.stringify(editCirclesList));
    setIsEditingCircles(false);
  };

  const startEditingCircles = () => {
    setEditCirclesList(circles);
    setIsEditingCircles(true);
  };

  const addCircle = () => {
    const newCircle: Circle = {
      id: Date.now().toString(),
      name: 'New Circle',
      members: 0,
      initial: 'N',
      color: 'bg-stone-100 text-stone-400'
    };
    setEditCirclesList([...editCirclesList, newCircle]);
    setIsEditingCircles(true);
  };

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Sidebar */}
      <aside className="space-y-6">
        {/* Connection Links - High Visibility */}
        <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles size={60} />
          </div>
          <h3 className="font-bold text-lg mb-4 serif">Join Global Circle</h3>
          <div className="space-y-3">
            <a 
              href={PERMANENT_WHATSAPP} 
              target="_blank" 
              className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a 
              href={PERMANENT_DISCORD} 
              target="_blank" 
              className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <MessageSquare size={18} /> Discord
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative group">
          {isAdmin && !isEditingCircles && (
            <button 
              onClick={startEditingCircles}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-600 rounded-full transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}

          <h3 className="font-bold text-lg mb-4 text-stone-900 serif">Local Circles</h3>
          
          {isEditingCircles ? (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {editCirclesList.map((circle) => (
                  <div key={circle.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex gap-2 items-center mb-2">
                      <input 
                        type="text" 
                        value={circle.name}
                        onChange={e => setEditCirclesList(editCirclesList.map(c => c.id === circle.id ? { ...c, name: e.target.value, initial: e.target.value.charAt(0).toUpperCase() } : c))}
                        className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-xs font-bold"
                        placeholder="Name"
                      />
                      <button onClick={() => setEditCirclesList(editCirclesList.filter(c => c.id !== circle.id))} className="text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addCircle} className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs font-bold">
                + Add Circle
              </button>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveCircles} className="flex-1 py-2 bg-stone-900 text-white rounded-lg font-bold text-xs">Save</button>
                <button onClick={() => setIsEditingCircles(false)} className="px-3 py-2 bg-white text-stone-500 rounded-lg font-bold text-xs border border-stone-200">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {circles.map((circle) => (
                <div key={circle.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${circle.color}`}>
                    {circle.initial}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-800">{circle.name}</p>
                    <p className="text-xs text-stone-500">{circle.members} Members</p>
                  </div>
                </div>
              ))}
              <button onClick={addCircle} className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-stone-400 text-xs font-bold mt-2">
                + Start Circle
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Prayer Chain Card */}
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
             <HandHeart size={60} className="text-amber-900" />
          </div>
          <h3 className="font-bold text-amber-900 mb-2 serif">Prayer Chain</h3>
          <p className="text-amber-800/70 text-sm mb-4">
            Join <span className="font-bold text-amber-900">{prayerRequests.length}</span> active prayer requests in your circle.
          </p>
          <button 
            onClick={() => setIsPrayerModalOpen(true)}
            className="w-full py-3 bg-white text-amber-700 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Open Prayer Chain
          </button>
        </div>
      </aside>

      {/* Main feed */}
      <section className="md:col-span-3 space-y-6">
        {/* Global Intro Header */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-900 serif mb-2">Welcome to the Community Circle</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            Share your spiritual journey with believers around the world. Every reflection adds a spark of light to the global circle.
          </p>
          <div className="flex gap-4">
            <a href={PERMANENT_WHATSAPP} target="_blank" className="flex items-center gap-2 text-[#25D366] font-bold text-sm hover:underline">
               <MessageCircle size={16} /> Official WhatsApp
            </a>
            <a href={PERMANENT_DISCORD} target="_blank" className="flex items-center gap-2 text-[#5865F2] font-bold text-sm hover:underline">
               <MessageSquare size={16} /> Official Discord
            </a>
          </div>
        </div>

        {/* Post Input */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              {isAdmin ? 'A' : 'Me'}
            </div>
            <div className="flex-1">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share a reflection with the circle..."
                className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 resize-none h-24 text-stone-700"
              ></textarea>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim() || isPosting}
                  className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isSeeding ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <Loader2 size={40} className="animate-spin text-amber-500" />
              <p className="text-stone-400 font-bold serif italic">Connecting to the global circle...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
              <MessageSquare size={48} className="mx-auto text-stone-200 mb-4" />
              <h4 className="text-stone-400 font-bold serif text-xl">The circle is quiet...</h4>
              <p className="text-stone-300 text-sm">Be the first to share a reflection.</p>
            </div>
          ) : (
            posts.map(post => {
              const isLiked = userReactions[post.id]?.liked;
              const isLoved = userReactions[post.id]?.loved;
              const isSharing = shareFeedback === post.id;
              const isCommentsOpen = openCommentId === post.id;

              return (
                <article key={post.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-top-4 duration-300">
                  <div className="p-6 md:p-8 relative">
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="absolute top-6 right-6 p-2 text-stone-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <img src={post.avatar} className="w-12 h-12 rounded-full border border-stone-100 object-cover" alt={post.author} />
                      <div>
                        <h4 className="font-bold text-stone-900">{post.author}</h4>
                        <p className="text-stone-400 text-xs">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-6 text-lg serif whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-stone-100 text-stone-500">
                      <button onClick={() => handleInteraction(post.id, 'like')} className={`flex items-center gap-2 ${isLiked ? 'text-amber-600 font-bold' : ''}`}>
                        <ThumbsUp size={18} className={isLiked ? 'fill-amber-600' : ''} />
                        <span className="text-sm">{post.likes > 0 ? post.likes : 'Like'}</span>
                      </button>
                      <button onClick={() => handleInteraction(post.id, 'love')} className={`flex items-center gap-2 ${isLoved ? 'text-rose-600 font-bold' : ''}`}>
                        <Heart size={18} className={isLoved ? 'fill-rose-600 animate-pulse' : ''} />
                        <span className="text-sm">{post.loves > 0 ? post.loves : 'Love'}</span>
                      </button>
                      <button onClick={() => setOpenCommentId(isCommentsOpen ? null : post.id)} className="flex items-center gap-2">
                        <MessageSquare size={18} />
                        <span className="text-sm">{post.comments > 0 ? post.comments : 'Comment'}</span>
                      </button>
                      <button onClick={() => handleShare(post.id)} className={`flex items-center gap-2 ml-auto ${isSharing ? 'text-emerald-600 font-bold' : ''}`}>
                        {isSharing ? 'Copied!' : <><Share2 size={18} /> Share</>}
                      </button>
                    </div>
                  </div>

                  {isCommentsOpen && (
                    <div className="bg-stone-50 border-t border-stone-100 p-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex gap-3">
                        <input 
                          type="text"
                          value={newCommentText[post.id] || ''}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="w-full pl-4 py-2 bg-white border border-stone-200 rounded-full text-sm outline-none"
                        />
                        <button onClick={() => handleCommentSubmit(post.id)} className="p-2 text-amber-600"><Send size={18} /></button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Prayer Chain Modal */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsPrayerModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-3">
                <HandHeart size={28} className="text-amber-600" />
                <h3 className="text-2xl font-bold text-stone-900 serif">Prayer Chain</h3>
              </div>
              <button onClick={() => setIsPrayerModalOpen(false)} className="p-2 text-stone-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-4">
                <p className="text-[10px] uppercase font-bold text-amber-600 mb-3 tracking-widest">Share a Request</p>
                <div className="flex gap-4">
                  <textarea 
                    value={newPrayerContent}
                    onChange={(e) => setNewPrayerContent(e.target.value)}
                    placeholder="How can we pray for you?"
                    className="flex-1 p-4 bg-white rounded-2xl border border-stone-200 outline-none h-24 text-sm"
                  ></textarea>
                  <button onClick={handleAddPrayer} className="px-6 bg-amber-600 text-white rounded-2xl font-bold">Add</button>
                </div>
              </div>

              {prayerRequests.map((prayer) => (
                <div key={prayer.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative group/prayer">
                  {isAdmin && <button onClick={() => deletePrayer(prayer.id)} className="absolute top-4 right-4 text-stone-300"><Trash2 size={16} /></button>}
                  <p className="font-bold text-sm text-stone-900 mb-1">{prayer.author}</p>
                  <p className="text-stone-700 italic serif mb-4">"{prayer.content}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                    <span className="text-xs font-bold text-amber-600">{prayer.prayingCount} people praying</span>
                    <button 
                      onClick={() => handlePray(prayer.id)}
                      disabled={prayedFor[prayer.id]}
                      className={`px-6 py-2 rounded-full font-bold text-xs ${prayedFor[prayer.id] ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-900 text-white'}`}
                    >
                      {prayedFor[prayer.id] ? 'Amen' : 'I am praying'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
