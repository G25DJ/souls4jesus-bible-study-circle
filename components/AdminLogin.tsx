
import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Tab } from '../types';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onNavigate: (tab: Tab) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onNavigate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulated secure verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === 'Souls4Jesus') {
      onLogin(true);
      onNavigate('home');
    } else {
      setError('Invalid administrative credentials. Access denied.');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden relative">
        <div className="bg-stone-900 pt-12 pb-10 px-8 text-center relative">
          <button 
            onClick={() => onNavigate('home')}
            className="absolute left-6 top-8 text-stone-500 hover:text-white transition-colors"
            title="Return to Home"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <ShieldCheck size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-white serif">Sacred Access</h2>
          <p className="text-stone-400 text-sm mt-3 font-medium">Community Administration Portal</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-3 ml-1">
                Security Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret credentials..."
                  className="w-full pl-14 pr-6 py-5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-stone-800 placeholder:text-stone-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm animate-in shake font-medium">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !password}
              className="w-full py-5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock Admin Controls'
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400 italic leading-relaxed">
              "Whatever you do, work heartily, as for the Lord and not for men."
              <span className="block mt-1 font-bold not-italic">— Colossians 3:23</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-10 space-y-2">
        <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">
          Souls4Jesus Management System v2.0
        </p>
        <p className="text-stone-300 text-[10px]">
          Secure login required for content modification and member management.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
