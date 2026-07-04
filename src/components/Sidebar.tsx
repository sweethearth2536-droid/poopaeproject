import React from 'react';
import { Home, Users, Calendar, MessageSquare, AlertCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  onSOS: () => void;
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ currentView, setView, onSOS, user, onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-24 pb-8 px-4 bg-[#f3f4f5] border-r border-[#bfc8ce] z-40">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-[#006488] font-sans">ซีจี ซีเนียร์ แคร์</h1>
        <p className="text-[#40484e] text-sm font-sans">ระบบดูแลผู้สูงอายุ</p>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <button
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-4 p-4 rounded-lg font-bold text-left transition-all ${
            currentView === 'dashboard'
              ? 'bg-[#2d7da3] text-white shadow-sm'
              : 'text-[#40484e] hover:bg-[#e7e8e9] hover:translate-x-1'
          }`}
          id="nav-dashboard"
        >
          <Home size={22} />
          <span className="text-lg">หน้าแรก</span>
        </button>

        <button
          onClick={() => setView('patients')}
          className={`flex items-center gap-4 p-4 rounded-lg font-bold text-left transition-all ${
            currentView === 'patients'
              ? 'bg-[#2d7da3] text-white shadow-sm'
              : 'text-[#40484e] hover:bg-[#e7e8e9] hover:translate-x-1'
          }`}
          id="nav-patients"
        >
          <Users size={22} />
          <span className="text-lg">รายชื่อผู้ป่วย</span>
        </button>

        <button
          onClick={() => setView('schedule')}
          className={`flex items-center gap-4 p-4 rounded-lg font-bold text-left transition-all ${
            currentView === 'schedule'
              ? 'bg-[#2d7da3] text-white shadow-sm'
              : 'text-[#40484e] hover:bg-[#e7e8e9] hover:translate-x-1'
          }`}
          id="nav-schedule"
        >
          <Calendar size={22} />
          <span className="text-lg">ตารางเวลา</span>
        </button>

        <button
          onClick={() => setView('chat')}
          className={`flex items-center gap-4 p-4 rounded-lg font-bold text-left transition-all ${
            currentView === 'chat'
              ? 'bg-[#2d7da3] text-white shadow-sm'
              : 'text-[#40484e] hover:bg-[#e7e8e9] hover:translate-x-1'
          }`}
          id="nav-chat"
        >
          <MessageSquare size={22} />
          <span className="text-lg">ข้อความ</span>
        </button>
      </nav>

      <div className="mt-auto px-2 flex flex-col gap-3">
        <button
          onClick={onSOS}
          className="w-full bg-[#ba1a1a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          id="sos-button"
        >
          <AlertCircle size={22} className="animate-bounce" />
          <span>แจ้งเหตุฉุกเฉิน (SOS)</span>
        </button>

        {user && (
          <button
            onClick={onLogout}
            className="w-full bg-[#e1e3e4] text-[#191c1d] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-all cursor-pointer text-sm"
            id="logout-button"
          >
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        )}
      </div>
    </aside>
  );
}
