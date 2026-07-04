import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logOut } from './firebase';
import { seedDatabaseIfNeeded } from './data/seed';

// Modular UI Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';
import PatientsView from './components/PatientsView';
import SchedulesView from './components/SchedulesView';
import ChatView from './components/ChatView';

// Icons for Mobile Navigation Bottom bar
import { Home, Users, Calendar, MessageSquare, AlertOctagon, Bell, Power, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setView] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('somchai_rakdee');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Seed initial data if database is empty
        await seedDatabaseIfNeeded();
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      setView('dashboard');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const triggerSOS = () => {
    setSosActive(true);
  };

  // Render Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f5] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#006488] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#40484e] font-bold text-sm font-sans">กำลังเชื่อมต่อข้อมูลผู้ดูแล...</p>
      </div>
    );
  }

  // Render Auth Login Screen
  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#191c1d] font-sans antialiased">
      {/* Top Header Navbar */}
      <Header
        user={user}
        onLogout={handleLogout}
        title="ซีจี ซีเนียร์ แคร์"
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentView={currentView}
        setView={(v) => {
          setView(v);
          setMobileMenuOpen(false);
        }}
        onSOS={triggerSOS}
        user={user}
        onLogout={handleLogout}
      />

      {/* Mobile Drawer Slide Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex lg:hidden backdrop-blur-xs">
          <div className="w-64 bg-[#f3f4f5] p-6 h-full flex flex-col justify-between shadow-2xl border-r border-[#bfc8ce]">
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-extrabold text-[#006488]">ซีจี ซีเนียร์ แคร์</h1>
                <p className="text-xs text-[#40484e]">ระบบดูแลผู้สูงอายุ</p>
              </div>

              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl text-left font-bold transition-all ${
                    currentView === 'dashboard' ? 'bg-[#2d7da3] text-white' : 'text-[#40484e] hover:bg-gray-100'
                  }`}
                >
                  <Home size={18} />
                  <span>หน้าแรก</span>
                </button>

                <button
                  onClick={() => {
                    setView('patients');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl text-left font-bold transition-all ${
                    currentView === 'patients' ? 'bg-[#2d7da3] text-white' : 'text-[#40484e] hover:bg-gray-100'
                  }`}
                >
                  <Users size={18} />
                  <span>รายชื่อผู้ป่วย</span>
                </button>

                <button
                  onClick={() => {
                    setView('schedule');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl text-left font-bold transition-all ${
                    currentView === 'schedule' ? 'bg-[#2d7da3] text-white' : 'text-[#40484e] hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={18} />
                  <span>ตารางเวลา</span>
                </button>

                <button
                  onClick={() => {
                    setView('chat');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl text-left font-bold transition-all ${
                    currentView === 'chat' ? 'bg-[#2d7da3] text-white' : 'text-[#40484e] hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>ข้อความ</span>
                </button>
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerSOS();
                }}
                className="w-full py-3.5 bg-[#ba1a1a] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-red-700 animate-pulse"
              >
                <AlertOctagon size={18} />
                <span>แจ้งฉุกเฉิน SOS</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-gray-200 text-[#191c1d] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Power size={14} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
          <div className="flex-grow" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content Layout Container */}
      <main className="min-h-screen pt-20 pb-24 lg:pb-8 lg:pl-72 pr-6 pl-6 bg-white overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              user={user}
              setView={setView}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {currentView === 'patients' && (
            <PatientsView
              user={user}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {currentView === 'schedule' && (
            <SchedulesView
              user={user}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              user={user}
            />
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center z-40 px-2">
        <button
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 ${
            currentView === 'dashboard' ? 'text-[#006488]' : 'text-gray-400'
          }`}
          id="mobile-nav-dashboard"
        >
          <Home size={20} />
          <span className="text-[10px] font-bold">หน้าแรก</span>
        </button>

        <button
          onClick={() => setView('patients')}
          className={`flex flex-col items-center gap-0.5 py-1 ${
            currentView === 'patients' ? 'text-[#006488]' : 'text-gray-400'
          }`}
          id="mobile-nav-patients"
        >
          <Users size={20} />
          <span className="text-[10px] font-bold">รายชื่อ</span>
        </button>

        {/* Floating Mobile Center SOS Trigger */}
        <button
          onClick={triggerSOS}
          className="w-14 h-14 bg-[#ba1a1a] text-white rounded-full flex items-center justify-center shadow-lg -translate-y-4 ring-4 ring-white animate-bounce"
          id="mobile-nav-sos"
        >
          <AlertOctagon size={26} />
        </button>

        <button
          onClick={() => setView('schedule')}
          className={`flex flex-col items-center gap-0.5 py-1 ${
            currentView === 'schedule' ? 'text-[#006488]' : 'text-gray-400'
          }`}
          id="mobile-nav-schedule"
        >
          <Calendar size={20} />
          <span className="text-[10px] font-bold">ตาราง</span>
        </button>

        <button
          onClick={() => setView('chat')}
          className={`flex flex-col items-center gap-0.5 py-1 ${
            currentView === 'chat' ? 'text-[#006488]' : 'text-gray-400'
          }`}
          id="mobile-nav-chat"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold">ข้อความ</span>
        </button>
      </div>

      {/* EMERGENCY SOS ALARM OVERLAY PANEL */}
      {sosActive && (
        <div className="fixed inset-0 bg-[#ba1a1a] z-50 flex flex-col items-center justify-center p-6 text-white text-center animate-pulse">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/10 animate-beat">
            <ShieldAlert size={54} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 font-sans tracking-wide">กำลังแจ้งเหตุฉุกเฉิน (SOS)</h2>
          <p className="text-lg md:text-xl text-red-100 max-w-lg mb-8 leading-relaxed font-sans">
            สัญญาณฉุกเฉินและพิกัดผู้ป่วยกำลังถูกส่งไปยังศูนย์กู้ชีพ 1669 และคุณวิชัย (ญาติสายตรง) ทันที!
          </p>
          <button
            onClick={() => setSosActive(false)}
            className="px-10 py-4 bg-white text-[#ba1a1a] font-extrabold rounded-full shadow-2xl hover:bg-red-50 active:scale-95 transition-all text-base cursor-pointer font-sans"
            id="cancel-sos-btn"
          >
            ยกเลิกสัญญาณเตือน
          </button>
        </div>
      )}
    </div>
  );
}
