
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, ThumbsUp, PlusCircle, Edit2, Check, X, Trash2, Send, Loader2, User } from 'lucide-react';
import { Circle } from '../types';

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
  comments: number; // count
  commentsList?: Comment[];
  timestamp: number;
}

const DEFAULT_CIRCLES: Circle[] = [];

const Community: React.FC<CommunityProps> = ({ isAdmin = false }) => {
  const [circles, setCircles] = useState<Circle[]>(() => {
    const saved = localStorage.getItem('s4j_circles');
    return saved ? JSON.parse(saved) : DEFAULT_CIRCLES;
  });
  const [isEditingCircles, setIsEditingCircles] = useState(false);
  const [editCirclesList, setEditCirclesList] = useState<Circle[]>(circles);
  
  // Post State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('s4j_community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Comment State
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

  // Tracking user reactions locally
  const [userReactions, setUserReactions] = useState<{ [postId: string]: { liked?: boolean, loved?: boolean } }>(() => {
    const saved = localStorage.getItem('s4j_user_reactions');
    return saved ? JSON.parse(saved) : {};
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('s4j_community_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('s4j_user_reactions', JSON.stringify(userReactions));
  }, [userReactions]);

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
        if (type === 'like') {
          return { ...post, likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1 };
        } else {
          return { ...post, loves: isLoved ? Math.max(0, post.loves - 1) : post.loves + 1 };
        }
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
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));

    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`).then(() => {
      setShareFeedback(postId);
      setTimeout(() => setShareFeedback(null), 2000);
    });
  };

  const handleDeletePost = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to remove this post from the community circle?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleSaveCircles = () => {
    setCircles(editCirclesList);
    localStorage.setItem('s4j_circles', JSON.stringify(editCirclesList));
    setIsEditingCircles(false);
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
  };

  const removeCircle = (id: string) => {
    setEditCirclesList(editCirclesList.filter(c => c.id !== id));
  };

  const updateCircle = (id: string, updates: Partial<Circle>) => {
    setEditCirclesList(editCirclesList.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        if (updates.name) {
          next.initial = updates.name.charAt(0).toUpperCase();
        }
        return next;
      }
      return c;
    }));
  };

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Sidebar - Group Info */}
      <aside className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative group">
          {isAdmin && !isEditingCircles && (
            <button 
              onClick={() => { setEditCirclesList(circles); setIsEditingCircles(true); }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-600 rounded-full transition-all"
              title="Edit Circles"
            >
              <Edit2 size={16} />
            </button>
          )}

          <h3 className="font-bold text-lg mb-4 text-stone-900 serif">Your Circle</h3>
          
          {isEditingCircles ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {editCirclesList.map((circle) => (
                  <div key={circle.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${circle.color}`}>
                        {circle.initial}
                      </div>
                      <input 
                        type="text" 
                        value={circle.name}
                        onChange={e => updateCircle(circle.id, { name: e.target.value })}
                        className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-xs font-bold"
                        placeholder="Circle Name"
                      />
                      <button onClick={() => removeCircle(circle.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded"><Trash2 size={14} /></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase font-bold text-stone-400">Members:</label>
                      <input 
                        type="number" 
                        value={circle.members}
                        onChange={e => updateCircle(circle.id, { members: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-white border border-stone-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addCircle} className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs flex items-center justify-center gap-1 hover:bg-stone-50"><PlusCircle size={14} /> Add Circle</button>
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button onClick={handleSaveCircles} className="flex-1 py-2 bg-stone-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Check size={14} /> Save</button>
                <button onClick={() => setIsEditingCircles(false)} className="px-3 py-2 bg-white text-stone-500 rounded-lg font-bold text-xs border border-stone-200"><X size={14} /></button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {circles.map((circle) => (
                <div key={circle.id} className="flex items-center gap-3 group/item cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all group-hover/item:scale-110 ${circle.color}`}>
                    {circle.initial}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-800 group-hover/item:text-amber-600 transition-colors">{circle.name}</p>
                    <p className="text-xs text-stone-500">{circle.members} Members</p>
                  </div>
                </div>
              ))}
              {circles.length === 0 && <p className="text-xs text-stone-400 italic text-center py-2">No active circles.</p>}
              <button onClick={addCircle} className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-stone-400 text-xs font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2 mt-2">
                <PlusCircle size={14} /> Create New Circle
              </button>
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
          <h3 className="font-bold text-amber-900 mb-4 serif">Prayer Chain</h3>
          <p className="text-amber-800/70 text-sm mb-4 leading-relaxed">Join 0 active prayer requests in your circle today.</p>
          <button className="w-full py-3 bg-white text-amber-700 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95">
            Join the Prayer Chain
          </button>
        </div>
      </aside>

      {/* Main feed */}
      <section className="md:col-span-3 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              {isAdmin ? 'A' : 'Me'}
            </div>
            <div className="flex-1">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share a reflection, prayer request, or question with your circle..."
                className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 resize-none h-28 placeholder:text-stone-400 text-stone-700 transition-all"
              ></textarea>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2"></div>
                <button 
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim() || isPosting}
                  className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Post to Circle
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
              <MessageSquare size={48} className="mx-auto text-stone-200 mb-4" />
              <h4 className="text-stone-400 font-bold serif text-xl">The circle is quiet...</h4>
              <p className="text-stone-300 text-sm">Be the first to share a reflection or word of encouragement.</p>
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
                        className="absolute top-6 right-6 p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Post (Admin)"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <img src={post.avatar} className="w-12 h-12 rounded-full border border-stone-100 object-cover shadow-sm" alt={post.author} />
                      <div>
                        <h4 className="font-bold text-stone-900 flex items-center gap-2">
                          {post.author}
                          {post.author.includes('Admin') && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-bold uppercase tracking-wider">Staff</span>
                          )}
                        </h4>
                        <p className="text-stone-400 text-xs">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-6 text-lg serif whitespace-pre-wrap">
                      {post.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 md:gap-8 pt-4 border-t border-stone-100 text-stone-500">
                      <button 
                        onClick={() => handleInteraction(post.id, 'like')}
                        className={`flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-amber-600' : 'hover:text-amber-600'}`}
                      >
                        <ThumbsUp size={18} className={isLiked ? 'fill-amber-600' : ''} />
                        <span className="text-sm font-medium">{post.likes > 0 ? post.likes : 'Like'}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleInteraction(post.id, 'love')}
                        className={`flex items-center gap-2 transition-all active:scale-90 ${isLoved ? 'text-rose-600' : 'hover:text-rose-600'}`}
                      >
                        <Heart size={18} className={isLoved ? 'fill-rose-600 animate-pulse' : ''} />
                        <span className="text-sm font-medium">{post.loves > 0 ? post.loves : 'Love'}</span>
                      </button>

                      <button 
                        onClick={() => setOpenCommentId(isCommentsOpen ? null : post.id)}
                        className={`flex items-center gap-2 transition-colors ${isCommentsOpen ? 'text-amber-600' : 'hover:text-amber-600'}`}
                      >
                        <MessageSquare size={18} className={isCommentsOpen ? 'fill-amber-50' : ''} />
                        <span className="text-sm font-medium">{post.comments > 0 ? post.comments : 'Comment'}</span>
                      </button>

                      <button 
                        onClick={() => handleShare(post.id)}
                        className={`flex items-center gap-2 transition-all ml-auto ${isSharing ? 'text-emerald-600' : 'hover:text-amber-600'}`}
                      >
                        {isSharing ? (
                          <span className="text-xs font-bold animate-in fade-in zoom-in">Link Copied!</span>
                        ) : (
                          <>
                            <Share2 size={18} />
                            <span className="text-sm font-medium">{post.shares > 0 ? post.shares : 'Share'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  {isCommentsOpen && (
                    <div className="bg-stone-50 border-t border-stone-100 p-6 md:px-8 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4 mb-6">
                        {post.commentsList && post.commentsList.length > 0 ? (
                          post.commentsList.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${comment.isAdmin ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                                {comment.author.charAt(0)}
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-stone-900">{comment.author}</span>
                                  <span className="text-[10px] text-stone-400">{comment.time}</span>
                                </div>
                                <p className="text-sm text-stone-700 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-xs text-stone-400 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isAdmin ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                          {isAdmin ? 'A' : 'M'}
                        </div>
                        <div className="flex-1 relative">
                          <input 
                            type="text"
                            value={newCommentText[post.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                            placeholder="Add a comment..."
                            className="w-full pl-4 pr-10 py-2 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                          />
                          <button 
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!(newCommentText[post.id]?.trim())}
                            className="absolute right-2 top-1.5 p-1 text-amber-600 hover:bg-amber-50 rounded-full transition-all disabled:opacity-30"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Community;
