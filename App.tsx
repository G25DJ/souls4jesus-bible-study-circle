
import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Home from './components/Home';
import Planner from './components/Planner';
import AskAI from './components/AskAI';
import Community from './components/Community';
import Resources from './components/Resources';
import AdminLogin from './components/AdminLogin';
import { 
  Home as HomeIcon, 
  Calendar, 
  MessageCircle, 
  Users, 
  BookOpen, 
  Menu, 
  X,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  RotateCcw
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('s4j_admin_mode') === 'true';
  });

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      localStorage.setItem('s4j_admin_mode', 'true');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('s4j_admin_mode');
    if (activeTab === 'admin-login') {
      setActiveTab('home');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all custom circles, posts, resources, and settings, returning the site to its original state.')) {
      // Clear all keys starting with s4j_
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('s4j_')) {
          localStorage.removeItem(key);
        }
      });
      // Force reload to pick up defaults
      window.location.reload();
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon size={20} /> },
    { id: 'planner', label: 'Study Planner', icon: <Calendar size={20} /> },
    { id: 'ask', label: 'Ask AI Assistant', icon: <MessageCircle size={20} /> },
    { id: 'community', label: 'Community', icon: <Users size={20} /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={(t) => setActiveTab(t)} isAdmin={isAdmin} />;
      case 'planner': return <Planner />;
      case 'ask': return <AskAI />;
      case 'community': return <Community isAdmin={isAdmin} />;
      case 'resources': return <Resources isAdmin={isAdmin} />;
      case 'admin-login': return <AdminLogin onLogin={handleAdminLogin} onNavigate={setActiveTab} />;
      default: return <Home onNavigate={(t) => setActiveTab(t)} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-amber-700 transition-colors">S</div>
              <span className="text-2xl font-bold tracking-tight text-stone-900 serif">Souls4Jesus</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                    activeTab === tab.id 
                    ? 'text-amber-700 bg-amber-50' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              {isAdmin && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-rose-600 hover:bg-rose-50 transition-all text-sm font-medium ml-4"
                  title="Sign out of Administration"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-600 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 py-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-6 py-3 text-left ${
                  activeTab === tab.id ? 'bg-amber-50 text-amber-700 font-bold' : 'text-stone-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-6 py-3 text-left text-rose-600 font-bold border-t border-stone-100"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-amber-600 rounded flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="text-xl font-bold serif">Souls4Jesus Bible Circle</span>
          </div>
          <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
            Building a community of faith, one verse at a time. Empowered by technology, guided by Spirit.
          </p>
          <div className="flex justify-center items-center gap-6 text-stone-400 mb-8 font-medium text-sm">
            <a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-600 transition-colors">Contact Us</a>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {isAdmin ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold hover:bg-rose-100 transition-all shadow-sm"
                >
                  <ShieldCheck size={14} />
                  Admin Mode: ON (Logout)
                </button>
                <button 
                  onClick={handleResetData}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-stone-500 border border-stone-200 rounded-full text-xs font-bold hover:bg-stone-50 hover:text-rose-600 transition-all shadow-sm"
                >
                  <RotateCcw size={14} />
                  Reset All Data
                </button>
              </>
            ) : (
              <button 
                onClick={() => setActiveTab('admin-login')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-200 text-stone-600 border border-stone-300 rounded-full text-xs font-bold hover:bg-stone-300 hover:text-stone-900 transition-all shadow-sm"
              >
                <ShieldAlert size={14} />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
