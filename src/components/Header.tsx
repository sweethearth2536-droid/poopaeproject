import React from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  title?: string;
  onToggleMobileMenu?: () => void;
}

export default function Header({ user, onLogout, title = 'ซีจี ซีเนียร์ แคร์', onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white shadow-sm border-b border-[#e7e8e9]">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 hover:bg-[#edeeef] rounded-lg transition-colors"
            id="mobile-menu-trigger"
          >
            <Menu size={24} className="text-[#006488]" />
          </button>
        )}
        <span className="text-xl font-bold text-[#006488] font-sans">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Simple Notification Button */}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e7e8e9] transition-colors relative"
          onClick={() => alert('ไม่มีการแจ้งเตือนใหม่')}
          id="notif-bell"
        >
          <Bell size={22} className="text-[#40484e]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
        </button>

        {/* User Profile */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#191c1d] leading-none">
                {user.displayName || 'ผู้ดูแล'}
              </span>
              <span className="text-[11px] text-[#40484e]">
                {user.email}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2d7da3] shadow-sm">
              <img
                className="w-full h-full object-cover"
                src={user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'}
                alt={user.displayName || 'Profile'}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#2d7da3] flex items-center justify-center text-white font-bold">
            U
          </div>
        )}
      </div>
    </header>
  );
}
