import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Schedule } from '../types';
import { Calendar, MapPin, Clock, Edit3, CheckCircle, ChevronLeft, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';

interface SchedulesViewProps {
  user: any;
}

export default function SchedulesView({ user }: SchedulesViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-03'); // default is today
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('2026-07-03');
  const [formTime, setFormTime] = useState('10:00');
  const [formNotes, setFormNotes] = useState('');

  // Fetch Schedules in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'schedules'),
      (snap) => {
        const list: Schedule[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Schedule));
        setSchedules(list);
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'schedules')
    );

    return () => unsub();
  }, []);

  // Save new appointment to Firebase
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLocation.trim() || !formDate || !formTime) {
      alert('กรุณากรอกข้อมูลนัดหมายให้ครบถ้วน');
      return;
    }

    try {
      const id = 'sched_' + Date.now();
      const newSched: Schedule = {
        id,
        patientId: 'somchai_rakdee', // default patient for this mockup context
        title: formTitle,
        location: formLocation,
        date: formDate,
        time: formTime,
        notes: formNotes,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'schedules', id), newSched);
      alert('บันทึกนัดหมายสำเร็จและแชร์ข้อมูลลงคลาวด์แล้ว!');
      // Reset Form fields
      setFormTitle('');
      setFormLocation('');
      setFormNotes('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `schedules`);
    }
  };

  // Calendar Day generation helper (Fixed to July 2026 to align with mock dates or dynamically generated)
  const daysInMonth = 31;
  const startDayOffset = 3; // July 2026 starts on Wednesday (offset 3)
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day has any schedules
  const hasEventOnDay = (day: number) => {
    const paddedDay = String(day).padStart(2, '0');
    const dateString = `2026-07-${paddedDay}`;
    return schedules.some(s => s.date === dateString);
  };

  // Filter schedules for the selected date
  const filteredSchedules = schedules
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] font-sans">ตารางเวลาดูแลผู้สูงอายุ</h1>
          <p className="text-[#40484e] text-sm">ติดตามนัดหมายประจำวันและการดูแลสุขภาพแบบเรียลไทม์</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View Panel */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-[#bfc8ce] shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#006488] font-sans">กรกฎาคม 2569</h2>
            <div className="flex gap-2">
              <button
                onClick={() => alert('ฟังก์ชันเปลี่ยนเดือนจะถูกเพิ่มในการอัปเดตถัดไป')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => alert('ฟังก์ชันเปลี่ยนเดือนจะถูกเพิ่มในการอัปเดตถัดไป')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days Name Header */}
          <div className="grid grid-cols-7 text-center mb-4 text-[#40484e] font-bold text-sm">
            <div>อา</div><div>จ</div><div>อ</div><div>พ</div><div>พฤ</div><div>ศ</div><div>ส</div>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Offset fillers */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="aspect-square"></div>
            ))}

            {/* July 2026 Days */}
            {calendarDays.map((day) => {
              const paddedDay = String(day).padStart(2, '0');
              const dateString = `2026-07-${paddedDay}`;
              const isSelected = selectedDate === dateString;
              const hasEvents = hasEventOnDay(day);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateString)}
                  className={`aspect-square flex flex-col items-center justify-center p-1 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#2d7da3] text-white border-[#006488] font-bold shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{day}</span>
                  {hasEvents && (
                    <span
                      className={`absolute bottom-1.5 w-2 h-2 rounded-full ${
                        isSelected ? 'bg-[#a1f5bc]' : 'bg-[#126c40]'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming Events List Panel */}
        <section className="lg:col-span-5 space-y-4">
          <h3 className="text-xl font-bold text-[#191c1d] px-2 font-sans flex items-center gap-2">
            <span>รายการสำหรับวันที่: {selectedDate}</span>
          </h3>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-center py-10 text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-12 bg-[#f3f4f5] rounded-xl border border-dashed border-gray-300">
                <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 text-sm">ไม่มีนัดหมายสำหรับวันนี้</p>
                <p className="text-xs text-gray-400 mt-1">สามารถสร้างนัดหมายใหม่โดยใช้ฟอร์มด้านล่าง</p>
              </div>
            ) : (
              filteredSchedules.map((sched) => (
                <div
                  key={sched.id}
                  className="bg-white p-4 rounded-xl border-l-4 border-[#006488] shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#c4e7ff] text-[#004c69] flex items-center justify-center rounded-xl shrink-0">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-[#191c1d] text-base">{sched.title}</p>
                      <p className="text-xs text-[#40484e] flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {sched.location} • {sched.time} น.
                      </p>
                      {sched.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-1.5 rounded-md mt-1.5 leading-relaxed">
                          {sched.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Form Section to record a new Appointment */}
      <section className="bg-[#f3f4f5] rounded-2xl p-6 md:p-8 border border-[#bfc8ce]">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-sans text-[#191c1d]">
          <Edit3 className="text-[#006488]" size={24} />
          <span>บันทึกนัดหมายใหม่</span>
        </h2>
        <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 px-1">หัวข้อการนัดหมาย *</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value);
                // default values for testing
              }}
              placeholder="เช่น ทานยาเบาหวาน, พบหมอฟัน, ทำกายภาพบำบัด"
              className="w-full h-12 px-4 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 px-1">สถานที่ *</label>
            <input
              type="text"
              required
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="เช่น ห้องนั่งเล่น, รพ.กรุงเทพ, สวนสาธารณะ"
              className="w-full h-12 px-4 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 px-1">วันที่ *</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 px-1">เวลา *</label>
            <input
              type="time"
              required
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488]"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 px-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม หรือคำแนะนำจากแพทย์..."
              rows={3}
              className="w-full rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488] p-4 resize-none"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex justify-end pt-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-[#006488] text-white px-10 h-12 rounded-full font-bold cursor-pointer hover:bg-[#2d7da3] active:scale-95 transition-all shadow-md font-sans text-base"
            >
              บันทึกข้อมูลเข้า Firebase
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
