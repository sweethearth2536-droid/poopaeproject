import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Message, StatusUpdate } from '../types';
import { Send, Image, Camera, Plus, Video, Phone, CheckCheck, Smile, Award, Sparkles } from 'lucide-react';

interface ChatViewProps {
  user: any;
}

export default function ChatView({ user }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [activeChat, setActiveChat] = useState('daughter_gig');
  const [messageText, setMessageText] = useState('');
  const [statusText, setStatusText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch real-time messages
  useEffect(() => {
    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snap) => {
        const list: Message[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Message));
        // Sort by timestamp if applicable or order simply. Seed data has chronological ordering
        setMessages(list);
        scrollToBottom();
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'messages')
    );

    const unsubStatuses = onSnapshot(
      collection(db, 'statusUpdates'),
      (snap) => {
        const list: StatusUpdate[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as StatusUpdate));
        setStatusUpdates(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'statusUpdates')
    );

    return () => {
      unsubMessages();
      unsubStatuses();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Post Daily Status Update to Family Feed
  const handlePostStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusText.trim()) {
      alert('กรุณากรอกข้อความเพื่ออัปเดตสถานะวันนี้');
      return;
    }

    try {
      const id = 'status_' + Date.now();
      const newStatus: StatusUpdate = {
        id,
        text: statusText,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80', // default nice image
        createdAt: `วันนี้, ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
        postedBy: user?.displayName || 'คุณเบญจวรรณ'
      };

      await setDoc(doc(db, 'statusUpdates', id), newStatus);
      alert('โพสต์สถานะอัปเดตให้ครอบครัวผู้ป่วยทราบสำเร็จ!');
      setStatusText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'statusUpdates');
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const id = 'msg_' + Date.now();
      const newMsg: Message = {
        id,
        senderUid: user?.uid || 'caregiver_nes',
        senderName: user?.displayName || 'คุณเบญจวรรณ',
        senderAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        text: messageText,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
      };

      await setDoc(doc(db, 'messages', id), newMsg);
      setMessageText('');
      scrollToBottom();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Updates & Dialog Contacts List */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1 custom-scrollbar">
        {/* Post Today Update Section */}
        <div className="bg-[#f3f4f5] rounded-3xl p-6 border border-[#bfc8ce]">
          <h3 className="text-lg font-bold text-[#191c1d] mb-3 font-sans">อัปเดตสถานะวันนี้</h3>
          <form onSubmit={handlePostStatus} className="space-y-3">
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="พิมพ์รายงานอาการ ความน่ารัก และกิจกรรมวันนี้เพื่อแชร์กับลูกๆ หลานๆ..."
              rows={3}
              className="w-full rounded-xl border border-[#bfc8ce] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => alert('อัปโหลดรูปภาพคุณปู่/คุณแม่เพื่ออัปเดตให้ครอบครัวดู')}
                className="p-2 text-[#006488] hover:bg-[#e7e8e9] rounded-xl transition-colors cursor-pointer"
              >
                <Image size={22} />
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#006488] text-white rounded-full text-sm font-bold shadow-sm hover:bg-[#2d7da3] cursor-pointer"
              >
                อัปเดตสถานะ
              </button>
            </div>
          </form>
        </div>

        {/* Contact list & Shared Feed */}
        <div className="bg-white rounded-3xl border border-[#bfc8ce] p-6 flex flex-col flex-grow min-h-[250px]">
          <h3 className="text-lg font-bold text-[#191c1d] mb-4 font-sans">บทสนทนากับครอบครัว</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveChat('daughter_gig')}
              className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition-all ${
                activeChat === 'daughter_gig' ? 'bg-[#c4e7ff] text-[#001e2c]' : 'hover:bg-[#f3f4f5]'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#2d7da3]">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                  alt="Gig profile"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-sm">คุณลูกสาว (กิ๊ก)</h4>
                  <span className="text-[10px] text-gray-500">วันนี้</span>
                </div>
                <p className="text-xs text-[#40484e] truncate mt-1">
                  {messages.length > 0 ? messages[messages.length - 1].text : 'ไม่มีข้อความใหม่'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Active Interactive Chat Panel */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-[#bfc8ce] flex flex-col h-full overflow-hidden shadow-sm">
        {/* Chat header panel */}
        <div className="p-4 px-6 border-b border-[#bfc8ce] bg-[#f3f4f5] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-300">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                alt="Gig avatar"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#191c1d] text-base font-sans">คุณลูกสาว (กิ๊ก)</h3>
              <p className="text-[10px] text-[#1c7245] flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 bg-[#126c40] rounded-full inline-block animate-pulse"></span>
                <span>ออนไลน์</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => alert('กำลังเริ่มโทรศัพท์...')}
              className="p-2.5 text-[#006488] hover:bg-white/80 rounded-full transition-all border border-gray-200 cursor-pointer"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={() => alert('กำลังเริ่มวิดีโอคอล...')}
              className="p-2.5 text-[#006488] hover:bg-white/80 rounded-full transition-all border border-gray-200 cursor-pointer"
            >
              <Video size={18} />
            </button>
          </div>
        </div>

        {/* Message bubble stream */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-gray-50/50 custom-scrollbar">
          {messages.map((msg) => {
            const isMe = msg.senderUid === user?.uid || msg.senderUid === 'caregiver_nes';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 self-end">
                    <img className="w-full h-full object-cover" src={msg.senderAvatar} alt={msg.senderName} />
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className={`text-[10px] text-gray-500 px-1 ${isMe ? 'text-right' : ''}`}>
                    {msg.senderName}
                  </p>
                  
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                      isMe
                        ? 'bg-[#006488] text-white rounded-tr-none'
                        : 'bg-white text-[#191c1d] border border-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Render message photos if they exist (comma-separated URL string) */}
                    {msg.images && (
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-white/20">
                        {msg.images.split(',').map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-black/10">
                            <img className="w-full h-full object-cover" src={url} alt="Shared status" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className={`text-[9px] text-gray-400 px-1 flex items-center gap-1 justify-end ${isMe ? '' : 'flex-row-reverse'}`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck size={12} className="text-[#006488]" />}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input controller */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#bfc8ce] bg-[#f3f4f5] flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('เปิดกล้องถ่ายภาพผู้สูงอายุเพื่อส่งในแชท')}
            className="p-3 text-[#40484e] hover:bg-[#e7e8e9] rounded-xl transition-all cursor-pointer"
            title="ถ่ายภาพ"
          >
            <Camera size={22} />
          </button>
          
          <button
            type="button"
            onClick={() => alert('เลือกรูปภาพจากคลังเพื่อส่งในแชท')}
            className="p-3 text-[#40484e] hover:bg-[#e7e8e9] rounded-xl transition-all cursor-pointer"
            title="อัปโหลดภาพ"
          >
            <Image size={22} />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="พิมพ์ข้อความคุยกับครอบครัว..."
            className="flex-grow h-12 px-4 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488] text-sm"
          />

          <button
            type="submit"
            className="p-3 bg-[#006488] text-white rounded-xl shadow-md hover:bg-[#2d7da3] active:scale-95 transition-all cursor-pointer"
            title="ส่งข้อความ"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
