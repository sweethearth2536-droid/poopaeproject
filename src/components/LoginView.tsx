import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { Heart, Key, Shield, LogIn, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'การเข้าสู่ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#bfc8ce] shadow-xl overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="bg-[#006488] p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
            <Heart size={24} className="text-white animate-pulse" />
          </div>
          <div className="w-16 h-16 bg-white/15 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm">
            <Heart size={36} className="text-[#a1f5bc]" />
          </div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight">ซีจี ซีเนียร์ แคร์</h1>
          <p className="text-[#c4e7ff] text-sm mt-1.5 font-sans">ระบบจัดการดูแลผู้สูงอายุแบบครบวงจร</p>
        </div>

        {/* Content & Sign-In Actions */}
        <div className="p-8 space-y-6">
          <div className="space-y-2.5 text-center">
            <h2 className="text-xl font-bold text-[#191c1d] font-sans">ลงชื่อเข้าใช้ระบบผู้ดูแล</h2>
            <p className="text-sm text-[#40484e] leading-relaxed">
              ยินดีต้อนรับผู้ดูแลและสมาชิกครอบครัว กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อความปลอดภัยในการรักษาข้อมูลสุขภาพ
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-150">
              <Shield className="text-[#006488] shrink-0" size={16} />
              <span>ข้อมูลจัดเก็บอย่างปลอดภัยบน Google Cloud Platform • โครงการ poopae-project-2026</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white hover:bg-gray-50 active:scale-98 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-3 border-2 border-gray-300 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            id="google-signin-btn"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#006488] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <img
                  className="w-6 h-6"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                <span className="text-[#191c1d] text-base font-sans">เข้าสู่ระบบด้วย Gmail / Google Account</span>
              </>
            )}
          </button>

          {/* Quick Sandbox Login / Bypass for demo preview in case popup blocked */}
          <div className="pt-4 border-t border-gray-150 text-center">
            <p className="text-[11px] text-gray-400">หรือต้องการทดลองเข้าใช้ระบบโดยข้ามขั้นตอนล็อกอิน?</p>
            <button
              onClick={() => {
                onLoginSuccess({
                  uid: 'caregiver_nes',
                  displayName: 'เบญจวรรณ (ผู้ดูแลจำลอง)',
                  email: 'caregiver.nes@gmail.com',
                  photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
                });
              }}
              className="mt-2 text-xs font-bold text-[#006488] hover:underline cursor-pointer"
            >
              คลิกตรงนี้เพื่อทดลองใช้ระบบทันที (Bypass Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
