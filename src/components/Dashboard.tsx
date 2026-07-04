import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Medication, Patient } from '../types';
import { AlertTriangle, Phone, Calendar, Heart, ShieldAlert, Check, Clock, Sparkles, Plus, Dumbbell } from 'lucide-react';

interface DashboardProps {
  user: any;
  setView: (view: string) => void;
  setSelectedPatientId: (id: string) => void;
}

export default function Dashboard({ user, setView, setSelectedPatientId }: DashboardProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityNote, setActivityNote] = useState('');
  const [activityPill, setActivityPill] = useState('มื้อบ่าย');

  // Load real-time medications & patients from Firebase
  useEffect(() => {
    const unsubMeds = onSnapshot(
      collection(db, 'medications'),
      (snap) => {
        const list: Medication[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Medication));
        setMedications(list);
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'medications')
    );

    const unsubPatients = onSnapshot(
      collection(db, 'patients'),
      (snap) => {
        const list: Patient[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Patient));
        setPatients(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'patients')
    );

    return () => {
      unsubMeds();
      unsubPatients();
    };
  }, []);

  // Format today's Thai date
  const getThaiDateString = () => {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const d = new Date();
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    const yearThai = d.getFullYear() + 543;
    return `${dayName}ที่ ${dateNum} ${monthName} ${yearThai}`;
  };

  // Give Medication Action - Stores state in Firestore
  const handleGiveMedication = async (medId: string) => {
    try {
      const caregiverName = user?.displayName || 'คุณเบญจวรรณ';
      const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      await updateDoc(doc(db, 'medications', medId), {
        status: 'done',
        givenBy: caregiverName,
        givenAt: now,
      });
      alert('บันทึกการให้ยาเรียบร้อยแล้ว!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `medications/${medId}`);
    }
  };

  // Add Activity record as patient note in Firestore
  const handleSaveActivity = async () => {
    if (!activityNote.trim()) {
      alert('กรุณากรอกข้อมูลกิจกรรม');
      return;
    }
    try {
      const noteId = 'note_' + Date.now();
      const newNote = {
        id: noteId,
        patientId: 'somchai_rakdee',
        text: `บันทึกกิจกรรมกายภาพ: ${activityNote}`,
        timeTag: activityPill,
        createdAt: `วันนี้, ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
        caregiverName: user?.displayName || 'คุณเบญจวรรณ'
      };

      await setDoc(doc(db, 'patients', 'somchai_rakdee', 'notes', noteId), newNote);
      alert('เริ่มบันทึกกิจกรรมและเพิ่มในประวัติเรียบร้อย!');
      setShowActivityModal(false);
      setActivityNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'patients/somchai_rakdee/notes');
    }
  };

  // Urgent Alert Patient Click
  const handleInspectAlert = () => {
    setSelectedPatientId('somchai_rakdee');
    setView('patients');
  };

  // Count remaining medications
  const remainingMeds = medications.filter(m => m.status !== 'done').length;

  return (
    <div className="space-y-6">
      {/* Caregiver Greeting */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[#006488] font-semibold text-base mb-1 font-sans">สวัสดีตอนเช้า</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d] font-sans">
              คุณ{user?.displayName || 'เบญจวรรณ'} ยินดีต้อนรับกลับมา
            </h2>
            <p className="text-[#40484e] text-lg font-sans mt-1">
              วันนี้มี {medications.length} กิจกรรมที่ต้องดูแล และ 1 การแจ้งเตือนด่วน
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#a1f5bc] px-5 py-2.5 rounded-full text-[#1c7245] shadow-sm font-semibold">
            <Calendar size={18} />
            <span className="text-base font-sans">{getThaiDateString()}</span>
          </div>
        </div>
      </section>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Urgent Alerts Section */}
        <div className="md:col-span-8 bg-[#ffdad6] rounded-3xl p-6 shadow-sm border border-red-200 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#93000a]">
              <AlertTriangle size={28} className="animate-pulse" />
              <h3 className="text-xl font-bold font-sans">การแจ้งเตือนด่วน</h3>
            </div>
            
            <div className="bg-white/85 backdrop-blur-md p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-8 border-[#ba1a1a] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <Heart size={24} className="text-[#ba1a1a] animate-beat" />
                </div>
                <div>
                  <h4 className="font-bold text-[#191c1d] text-lg font-sans">คุณปู่สมชาย - อัตราการเต้นของหัวใจสูง</h4>
                  <p className="text-[#40484e] text-base font-sans">เมื่อ 10 นาทีที่แล้ว: 105 bpm ขณะพักผ่อน</p>
                </div>
              </div>
              <button
                onClick={handleInspectAlert}
                className="bg-[#006488] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#2d7da3] active:scale-95 transition-all self-start sm:self-center cursor-pointer font-sans"
              >
                ตรวจสอบ
              </button>
            </div>
          </div>
          {/* Abstract Decorative Icon */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.04] pointer-events-none">
            <ShieldAlert size={180} />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="md:col-span-4 bg-[#e7e8e9] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#191c1d] font-sans">ติดต่อฉุกเฉิน</h3>
              <ShieldAlert className="text-[#006488]" size={24} />
            </div>
            
            <div className="space-y-3">
              <a
                href="tel:1669"
                className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#bfc8ce] hover:scale-[1.02] active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[#ba1a1a]" />
                  <span className="font-bold text-[#191c1d] font-sans">ศูนย์กู้ชีพ 1669</span>
                </div>
                <span className="text-xs bg-red-100 text-[#ba1a1a] px-2.5 py-1 rounded-full font-bold">โทรด่วน</span>
              </a>

              <button
                onClick={() => alert('กำลังโทรหา ญาติสายตรง (คุณวิชัย)...')}
                className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border border-[#bfc8ce] hover:scale-[1.02] active:scale-95 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[#006488]" />
                  <span className="font-bold text-[#191c1d] font-sans">ญาติสายตรง (คุณวิชัย)</span>
                </div>
                <span className="text-xs bg-blue-100 text-[#006488] px-2.5 py-1 rounded-full font-bold">โทรด่วน</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedPatientId('somchai_rakdee');
              setView('patients');
            }}
            className="w-full text-center text-[#006488] font-bold mt-4 hover:underline cursor-pointer flex items-center justify-center gap-1.5 font-sans"
          >
            ดูรายชื่อญาติทั้งหมด
          </button>
        </div>

        {/* Medication Reminders Panel */}
        <div className="md:col-span-12 bg-[#f3f4f5] rounded-3xl p-6 md:p-8 shadow-sm border border-[#bfc8ce]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#2d7da3] rounded-2xl flex items-center justify-center shadow-inner">
                <Heart size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191c1d] font-sans">เตือนความจำยา (วันนี้)</h3>
                <p className="text-sm text-[#40484e]">กรุณากด ยืนยันการให้ยา เพื่อลงบันทึกในระบบจริง</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-[#126c40]/10 text-[#1c7245] rounded-full text-sm font-bold border border-[#126c40]/20">
                {remainingMeds > 0 ? `เหลืออีก ${remainingMeds} รายการ` : 'ให้ยาครบทุกรายการแล้ว 🎉'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {medications.map((med) => {
              const isDone = med.status === 'done';
              const isPending = med.status === 'pending';
              const isLater = med.status === 'later';

              return (
                <div
                  key={med.id}
                  className={`bg-white p-6 rounded-2xl border-l-8 shadow-sm relative transition-all ${
                    isDone
                      ? 'border-[#126c40] opacity-80'
                      : isPending
                      ? 'border-[#006488] ring-2 ring-[#006488]/15'
                      : 'border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        isDone
                          ? 'bg-[#a1f5bc] text-[#1c7245]'
                          : isPending
                          ? 'bg-[#c4e7ff] text-[#004c69]'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {med.time}
                    </span>
                    {isDone ? (
                      <Check className="text-[#126c40]" size={24} />
                    ) : (
                      <Clock className={isPending ? 'text-[#006488]' : 'text-gray-400'} size={24} />
                    )}
                  </div>

                  <h4 className="font-bold text-[#191c1d] text-lg font-sans">{med.name}</h4>
                  <p className="text-[#40484e] text-sm mt-1">{med.instructions}</p>

                  {isDone ? (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[#1c7245] text-xs font-bold flex items-center gap-1">
                        ✓ ให้ยาแล้วเมื่อ {med.givenAt} น. โดย {med.givenBy}
                      </p>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={() => handleGiveMedication(med.id)}
                      className="mt-6 w-full bg-[#006488] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2d7da3] active:scale-95 transition-colors cursor-pointer font-sans"
                    >
                      ยืนยันการให้ยา
                    </button>
                  ) : (
                    <div className="mt-6 flex items-center gap-2 text-gray-400 text-xs font-semibold">
                      <span>ยังไม่ถึงเวลาให้ยา</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Activity Section */}
        <div className="md:col-span-12 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-sm shrink-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB57vd6L3kaR77kQO3h5QhSyl6UBKQrAwAE_j2P-ZUsODqjulxgultS6GpMermSH7bbL0Co-7X5H4Djir-EH8sADymnu2M4HO7m2BU-eyLShgzVGVuUmUpE7Q2NDT-TR--LTrJ_5_Ni3xo_jE6FC6XM7XUqlJYhTgCRWqJvxbhwpGf8AVAzM7NRD-IDM-9l2qwJGhJ4Smb-vfHCWL9e12iE4C3AVEmMIFL24tWTZlNifJYrTEn1kWYNDvfFvG3PcFrp1oiTHcD359"
              alt="Physiotherapy room"
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 text-[#126c40] font-bold mb-2">
              <Dumbbell size={20} />
              <span className="font-sans">กิจกรรมถัดไป</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#191c1d] mb-2 font-sans">
              กายภาพบำบัดช่วงบ่าย (ฝึกเดิน)
            </h3>
            <p className="text-[#40484e] text-base leading-relaxed mb-6">
              เป้าหมายวันนี้: เดินรอบสวน 2 รอบ พร้อมใช้ไม้เท้าพยุง 4 ขา เพื่อเสริมความมั่นคงของกล้ามเนื้อขา
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-6 py-3.5 bg-[#126c40] text-white rounded-xl font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all cursor-pointer font-sans"
              >
                เริ่มบันทึกกิจกรรม
              </button>
              <button
                onClick={() => {
                  setSelectedPatientId('somchai_rakdee');
                  setView('patients');
                }}
                className="px-6 py-3.5 border-2 border-[#bfc8ce] rounded-xl font-bold text-[#40484e] hover:bg-gray-50 transition-all cursor-pointer font-sans"
              >
                ดูรายละเอียดเพิ่มเติม
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Recorder Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#006488] font-sans">เริ่มบันทึกกิจกรรมกายภาพบำบัด</h3>
            <p className="text-sm text-gray-500">บันทึกนี้จะถูกส่งไปเก็บไว้ใน Firebase และแสดงในหน้ารายชื่อผู้ป่วย</p>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ช่วงเวลา</label>
              <select
                value={activityPill}
                onChange={(e) => setActivityPill(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488]"
              >
                <option value="มื้อเช้า">มื้อเช้า</option>
                <option value="มื้อบ่าย">มื้อบ่าย</option>
                <option value="มื้อเย็น">มื้อเย็น</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">รายละเอียดผลลัพธ์การฝึกเดิน</label>
              <textarea
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                placeholder="เช่น เดินได้ครบ 2 รอบ อารมณ์ดี ไม่บ่นปวดเข่า..."
                rows={4}
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold cursor-pointer hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveActivity}
                className="px-5 py-3 rounded-xl bg-[#126c40] text-white font-bold cursor-pointer hover:bg-green-700"
              >
                บันทึกกิจกรรม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
