
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Heart, Share2, ThumbsUp, PlusCircle, Edit2, Check, X, 
  Trash2, Send, Loader2, User, HandHeart, Clock, Info, ExternalLink, MessageCircle, Sparkles, Globe
} from 'lucide-react';

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

const Community: React.FC<CommunityProps> = ({ isAdmin = false }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('s4j_community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('s4j_prayer_requests');
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('s4j_community_posts', JSON.stringify(posts));
    localStorage.setItem('s4j_prayer_requests', JSON.stringify(prayerRequests));
  }, [posts, prayerRequests]);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        author: 'Community Member',
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

  const handleInteraction = (postId: string, type: 'like' | 'love' | 'share') => {
    const isLiked = userReactions[postId]?.liked;
    const isLoved = userReactions[postId]?.loved;
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (type === 'like') return { ...post, likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1 };
        if (type === 'love') return { ...post, loves: isLoved ? Math.max(0, post.loves - 1) : post.loves + 1 };
        if (type === 'share') return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));

    if (type !== 'share') {
      setUserReactions(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [type === 'like' ? 'liked' : 'loved']: type === 'like' ? !isLiked : !isLoved
        }
      }));
    }
  };

  const handleAddPrayer = () => {
    if (!newPrayerContent.trim()) return;
    const newRequest: PrayerRequest = {
      id: Date.now().toString(),
      author: 'Community Member',
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
    localStorage.setItem('s4j_prayed_for', JSON.stringify({ ...prayedFor, [id]: true }));
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Sidebar */}
      <aside className="space-y-6">
        {/* Public Community Links */}
        <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Globe size={60} />
          </div>
          <h3 className="font-bold text-lg mb-4 serif">Public Links</h3>
          <div className="space-y-3">
            <a href={PERMANENT_WHATSAPP} target="_blank" className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 no-underline">
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a href={PERMANENT_DISCORD} target="_blank" className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 no-underline">
              <MessageSquare size={18} /> Discord
            </a>
          </div>
        </div>

        {/* Public Prayer Chain Card */}
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
             <HandHeart size={60} className="text-amber-900" />
          </div>
          <h3 className="font-bold text-amber-900 mb-2 serif">Prayer Chain</h3>
          <p className="text-amber-800/70 text-sm mb-4">
            {prayerRequests.length === 0 ? 'Be the first to share a request.' : `Join ${prayerRequests.length} active prayer requests.`}
          </p>
          <button 
            onClick={() => setIsPrayerModalOpen(true)}
            className="w-full py-3 bg-white text-amber-700 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Open Chain
          </button>
        </div>
      </aside>

      {/* Main Public feed */}
      <section className="md:col-span-3 space-y-6">
        {/* Post Input */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              Me
            </div>
            <div className="flex-1">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share a reflection with the public circle..."
                className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 resize-none h-24 text-stone-700 serif text-lg"
              ></textarea>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim() || isPosting}
                  className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Post publicly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-stone-200">
              <MessageSquare size={48} className="mx-auto text-stone-100 mb-4" />
              <h4 className="text-stone-400 font-bold serif text-xl italic">The circle is quiet...</h4>
              <p className="text-stone-300 text-sm">Every reflection adds a spark of light. Be the first.</p>
            </div>
          ) : posts.map(post => {
            const isLiked = userReactions[post.id]?.liked;
            const isLoved = userReactions[post.id]?.loved;
            const isSharing = shareFeedback === post.id;
            const isCommentsOpen = openCommentId === post.id;

            return (
              <article key={post.id} id={`post-${post.id}`} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-top-4 duration-300">
                <div className="p-6 md:p-8 relative">
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="absolute top-6 right-6 p-2 text-stone-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <img src={post.avatar} className="w-12 h-12 rounded-full border border-stone-100 object-cover" alt={post.author} />
                    <div>
                      <h4 className="font-bold text-stone-900 flex items-center gap-2">
                        {post.author}
                      </h4>
                      <p className="text-stone-400 text-xs">{post.time}</p>
                    </div>
                  </div>
                  <p className="text-stone-700 leading-relaxed mb-6 text-lg serif whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center gap-6 pt-4 border-t border-stone-100 text-stone-500">
                    <button onClick={() => handleInteraction(post.id, 'like')} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-amber-600 font-bold' : 'hover:text-amber-600'}`}>
                      <ThumbsUp size={18} className={isLiked ? 'fill-amber-600' : ''} />
                      <span className="text-sm">{post.likes > 0 ? post.likes : 'Like'}</span>
                    </button>
                    <button onClick={() => handleInteraction(post.id, 'love')} className={`flex items-center gap-2 transition-colors ${isLoved ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}>
                      <Heart size={18} className={isLoved ? 'fill-rose-600 animate-pulse' : ''} />
                      <span className="text-sm">{post.loves > 0 ? post.loves : 'Love'}</span>
                    </button>
                    <button onClick={() => setOpenCommentId(isCommentsOpen ? null : post.id)} className="flex items-center gap-2 hover:text-stone-900 transition-colors">
                      <MessageSquare size={18} />
                      <span className="text-sm">{post.comments > 0 ? post.comments : 'Comment'}</span>
                    </button>
                    
                    {/* Enhanced Share Button */}
                    <button 
                      onClick={() => {
                        const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        handleInteraction(post.id, 'share');
                        setShareFeedback(post.id);
                        setTimeout(() => setShareFeedback(null), 2500);
                      }} 
                      className={`flex items-center gap-2 ml-auto transition-all ${isSharing ? 'text-emerald-600 font-bold' : 'hover:text-stone-900'}`}
                      title="Copy link to post"
                    >
                      {isSharing ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                          <Check size={18} />
                          <span className="text-sm uppercase tracking-tighter">Copied!</span>
                        </div>
                      ) : (
                        <>
                          <Share2 size={18} />
                          <span className="text-sm">{post.shares > 0 ? post.shares : 'Share'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isCommentsOpen && (
                  <div className="bg-stone-50 border-t border-stone-100 p-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 mb-4">
                      {post.commentsList?.map(c => (
                        <div key={c.id} className="flex gap-3">
                           <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold">
                             {c.author.charAt(0)}
                           </div>
                           <div className="bg-white p-3 rounded-2xl border border-stone-200 flex-1 shadow-sm">
                             <p className="text-xs font-bold text-stone-900">{c.author} • <span className="font-normal text-stone-400">{c.time}</span></p>
                             <p className="text-sm text-stone-700">{c.content}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={newCommentText[post.id] || ''}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a comment..."
                        className="w-full pl-4 py-2 bg-white border border-stone-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button onClick={() => {
                        if (!newCommentText[post.id]?.trim()) return;
                        const newComment: Comment = { id: Date.now().toString(), author: 'Me', content: newCommentText[post.id], time: 'Just now' };
                        setPosts(posts.map(p => p.id === post.id ? { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), newComment] } : p));
                        setNewCommentText({ ...newCommentText, [post.id]: '' });
                      }} className="p-2 text-amber-600 hover:text-amber-700 transition-colors"><Send size={18} /></button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Public Prayer Chain Modal */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsPrayerModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-3">
                <HandHeart size={28} className="text-amber-600" />
                <h3 className="text-2xl font-bold text-stone-900 serif">Public Prayer Chain</h3>
              </div>
              <button onClick={() => setIsPrayerModalOpen(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-4">
                <p className="text-[10px] uppercase font-bold text-amber-600 mb-3 tracking-widest">Add a Request</p>
                <div className="flex gap-4">
                  <textarea 
                    value={newPrayerContent}
                    onChange={(e) => setNewPrayerContent(e.target.value)}
                    placeholder="How can this circle pray for you?"
                    className="flex-1 p-4 bg-white rounded-2xl border border-stone-200 outline-none h-24 text-sm serif focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                  <button onClick={handleAddPrayer} className="px-6 bg-amber-600 text-white rounded-2xl font-bold shadow-md hover:bg-amber-700 transition-all">Add</button>
                </div>
              </div>

              {prayerRequests.length === 0 ? (
                <div className="py-20 text-center text-stone-300 italic">No active public prayer requests.</div>
              ) : prayerRequests.map((prayer) => (
                <div key={prayer.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative group/prayer">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-stone-900">{prayer.author}</p>
                    <button 
                      onClick={() => setPrayerRequests(prayerRequests.filter(p => p.id !== prayer.id))}
                      className="opacity-0 group-hover/prayer:opacity-100 p-1 text-stone-300 hover:text-rose-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-stone-700 italic serif mb-4 text-base">"{prayer.content}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <HandHeart size={14} /> {prayer.prayingCount} people praying
                    </span>
                    <button 
                      onClick={() => handlePray(prayer.id)}
                      disabled={prayedFor[prayer.id]}
                      className={`px-6 py-2 rounded-full font-bold text-xs shadow-sm transition-all ${prayedFor[prayer.id] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
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
