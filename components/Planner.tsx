
import React, { useState } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { StudyPlan } from '../types';
// Added missing Sparkles import
import { Book, CheckCircle2, ChevronRight, Loader2, Search, Target, Sparkles } from 'lucide-react';

const Planner: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const data = await generateStudyPlan(topic);
      setPlan(data);
    } catch (error) {
      console.error("Failed to generate plan", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 serif">Custom Bible Study Planner</h2>
        <p className="text-stone-500 max-w-xl mx-auto">
          Need guidance on a specific topic? Enter a theme, emotional state, or biblical book, and Souls4Jesus's AI will craft a 7-day personal study plan for you.
        </p>
      </header>

      <form onSubmit={handleGenerate} className="bg-white p-2 rounded-2xl shadow-lg border border-stone-200 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Finding peace in anxiety, Book of Romans, Forgiveness..."
            className="w-full pl-12 pr-4 py-4 rounded-xl text-stone-800 bg-stone-50 focus:bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            disabled={loading}
          />
        </div>
        <button 
          type="submit"
          disabled={loading || !topic.trim()}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Generate Plan'}
        </button>
      </form>

      {plan && !loading && (
        <div className="space-y-8 pb-12">
          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
            <div className="flex items-center gap-3 text-amber-700 font-bold text-sm uppercase tracking-widest mb-2">
              <Target size={16} />
              Study Focus
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4 serif">{plan.topic}</h3>
            <p className="text-amber-800/80 leading-relaxed italic text-lg">
              "{plan.overview}"
            </p>
          </div>

          <div className="grid gap-6">
            {plan.days.map((day) => (
              <div key={day.day} className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex flex-col items-center justify-center border border-stone-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Day</span>
                      <span className="text-2xl font-bold">{day.day}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{day.title}</h4>
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                        <Book size={12} />
                        {day.scripture}
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      {day.focus}
                    </p>
                    <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-stone-900 block">Action Step:</span>
                        <span className="text-stone-500">{day.actionStep}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8">
            <button className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2 mx-auto">
              Save Plan to Dashboard <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {!plan && !loading && (
        <div className="grid md:grid-cols-3 gap-6 opacity-60">
          {['Grace', 'Patience', 'Leadership'].map((t) => (
            <div 
              key={t}
              onClick={() => {
                setTopic(t);
              }}
              className="bg-stone-50 border border-dashed border-stone-300 rounded-3xl p-6 text-center cursor-pointer hover:bg-white hover:border-amber-400 transition-all group"
            >
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-50">
                <Sparkles size={20} className="text-stone-400 group-hover:text-amber-500" />
              </div>
              <p className="font-medium text-stone-500 group-hover:text-stone-900">Try "{t}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Planner;
