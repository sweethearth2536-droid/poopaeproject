import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Patient, Note } from '../types';
import { Search, Plus, Calendar, Heart, Activity, ShieldAlert, FileText, ChevronRight, CheckCircle2, User, Trash2, Edit } from 'lucide-react';

interface PatientsViewProps {
  user: any;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
}

export default function PatientsView({ user, selectedPatientId, setSelectedPatientId }: PatientsViewProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);

  // Add Patient Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(75);
  const [newPatientGender, setNewPatientGender] = useState('เพศชาย');
  const [newPatientBloodType, setNewPatientBloodType] = useState('O+');
  const [newPatientHeartRate, setNewPatientHeartRate] = useState<number>(72);
  const [newPatientBloodPressure, setNewPatientBloodPressure] = useState('120/80');
  const [newPatientStatus, setNewPatientStatus] = useState<'normal' | 'special_care'>('normal');
  const [newPatientHistory, setNewPatientHistory] = useState('');
  const [newPatientSpecialCare, setNewPatientSpecialCare] = useState('');

  // Add Note Form State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTimeTag, setNewNoteTimeTag] = useState('มื้อเช้า');

  // Edit Patient Form State
  const [editPatientHeartRate, setEditPatientHeartRate] = useState<number>(72);
  const [editPatientBloodPressure, setEditPatientBloodPressure] = useState('120/80');
  const [editPatientStatus, setEditPatientStatus] = useState<'normal' | 'special_care'>('normal');
  const [editPatientSpecialCare, setEditPatientSpecialCare] = useState('');

  // Fetch Patients
  useEffect(() => {
    const unsubPatients = onSnapshot(
      collection(db, 'patients'),
      (snap) => {
        const list: Patient[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Patient));
        setPatients(list);
        setLoading(false);
        if (list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0].id);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'patients')
    );

    return () => unsubPatients();
  }, [selectedPatientId, setSelectedPatientId]);

  // Fetch Notes for Selected Patient
  useEffect(() => {
    if (!selectedPatientId) return;

    const unsubNotes = onSnapshot(
      collection(db, 'patients', selectedPatientId, 'notes'),
      (snap) => {
        const list: Note[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Note));
        // Sort notes by date descending or timestamp style
        setNotes(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `patients/${selectedPatientId}/notes`)
    );

    return () => unsubNotes();
  }, [selectedPatientId]);

  // Sync edit form with selected patient
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  useEffect(() => {
    if (selectedPatient) {
      setEditPatientHeartRate(selectedPatient.heartRate);
      setEditPatientBloodPressure(selectedPatient.bloodPressure);
      setEditPatientStatus(selectedPatient.status);
      setEditPatientSpecialCare(selectedPatient.specialCare);
    }
  }, [selectedPatient]);

  // Search Filter
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Patient Action
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      alert('กรุณากรอกชื่อผู้ป่วย');
      return;
    }
    try {
      const pId = 'patient_' + Date.now();
      const patientData: Patient = {
        id: pId,
        name: newPatientName,
        age: Number(newPatientAge),
        gender: newPatientGender,
        bloodType: newPatientBloodType,
        heartRate: Number(newPatientHeartRate),
        bloodPressure: newPatientBloodPressure,
        status: newPatientStatus,
        history: newPatientHistory || 'ไม่มีประวัติการรักษาที่ระบุ',
        specialCare: newPatientSpecialCare || 'ไม่มีรายละเอียดการดูแลพิเศษที่ระบุ'
      };

      await setDoc(doc(db, 'patients', pId), patientData);
      alert('เพิ่มประวัติผู้ป่วยใหม่ลงระบบ Firebase สำเร็จ!');
      setSelectedPatientId(pId);
      setShowAddPatient(false);
      // Reset state
      setNewPatientName('');
      setNewPatientHistory('');
      setNewPatientSpecialCare('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'patients');
    }
  };

  // Add Daily Note Action
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      alert('กรุณากรอกข้อความบันทึก');
      return;
    }
    try {
      const nId = 'note_' + Date.now();
      const noteData: Note = {
        id: nId,
        patientId: selectedPatientId,
        text: newNoteText,
        timeTag: newNoteTimeTag,
        createdAt: `วันนี้, ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
        caregiverName: user?.displayName || 'คุณเบญจวรรณ'
      };

      await setDoc(doc(db, 'patients', selectedPatientId, 'notes', nId), noteData);
      alert('เพิ่มบันทึกการดูแลใหม่เรียบร้อย!');
      setNewNoteText('');
      setShowAddNote(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `patients/${selectedPatientId}/notes`);
    }
  };

  // Update Patient Profile Action
  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'patients', selectedPatientId), {
        heartRate: Number(editPatientHeartRate),
        bloodPressure: editPatientBloodPressure,
        status: editPatientStatus,
        specialCare: editPatientSpecialCare
      });
      alert('อัปเดตข้อมูลผู้ป่วยใน Firebase เรียบร้อย!');
      setShowEditPatient(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `patients/${selectedPatientId}`);
    }
  };

  // Static Avatar generator based on ID
  const getAvatarUrl = (id: string) => {
    if (id === 'somchai_rakdee') {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
    }
    if (id === 'prapha_srisook') {
      return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80';
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] font-sans">รายชื่อผู้ป่วยในการดูแล</h1>
          <p className="text-[#40484e] text-base mt-1">จัดการข้อมูลและติดตามอาการผู้สูงอายุอย่างใกล้ชิดด้วย Firebase Database</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search Input bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหารายชื่อผู้ป่วย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border border-[#bfc8ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#006488] w-64 text-sm"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>

          <button
            onClick={() => setShowAddPatient(true)}
            className="px-5 py-3 bg-[#006488] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#2d7da3] active:scale-95 transition-all cursor-pointer font-sans text-sm"
          >
            <Plus size={18} />
            <span>เพิ่มผู้ป่วย</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Patients List Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#bfc8ce] p-2 flex flex-col gap-2 shadow-sm h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <p className="text-center py-8 text-gray-500 text-sm">กำลังโหลดรายชื่อผู้ป่วย...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm">ไม่พบรายชื่อผู้ป่วยที่ตรงตามเงื่อนไข</p>
            ) : (
              filteredPatients.map((p) => {
                const isActive = p.id === selectedPatientId;
                const isSpecial = p.status === 'special_care';

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full p-4 rounded-lg flex items-center gap-4 text-left transition-all ${
                      isActive
                        ? 'bg-[#a1f5bc] border-l-4 border-[#126c40] text-[#00210f]'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-gray-300 overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={getAvatarUrl(p.id)}
                        alt={p.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#191c1d] truncate text-base">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${isSpecial ? 'bg-red-500 animate-pulse' : 'bg-[#126c40]'}`}
                        ></span>
                        <span className="text-xs text-[#40484e]">
                          {isSpecial ? 'ต้องดูแลพิเศษ' : 'อาการปกติ'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className={isActive ? 'text-[#126c40]' : 'text-gray-400'} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profile Panel */}
        <div className="lg:col-span-8">
          {selectedPatient ? (
            <div className="bg-white rounded-xl border border-[#bfc8ce] shadow-sm overflow-hidden flex flex-col">
              {/* Profile Header */}
              <div className="p-6 md:p-8 bg-[#f3f4f5] border-b border-[#bfc8ce] flex flex-col md:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={getAvatarUrl(selectedPatient.id)}
                    alt={selectedPatient.name}
                  />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                    <h2 className="text-2xl font-bold text-[#191c1d] font-sans">{selectedPatient.name}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedPatient.status === 'special_care'
                          ? 'bg-red-100 text-[#ba1a1a]'
                          : 'bg-[#a1f5bc] text-[#1c7245]'
                      }`}
                    >
                      {selectedPatient.status === 'special_care' ? 'ต้องดูแลพิเศษ' : 'อาการปกติ'}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-[#40484e] text-sm">
                    <span className="flex items-center gap-1.5">
                      <User size={16} /> อายุ {selectedPatient.age} ปี
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User size={16} /> {selectedPatient.gender}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart size={16} /> หมู่เลือด {selectedPatient.bloodType}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditPatient(true)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-[#006488] shadow-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                    title="แก้ไขประวัติ"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              </div>

              {/* Vitals Stats Grid */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#bfc8ce]">
                <div className="p-5 rounded-2xl bg-[#f3f4f5] border-l-8 border-[#006488] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[#40484e] text-sm font-semibold">อัตราการเต้นของหัวใจ</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-[#006488]">{selectedPatient.heartRate}</span>
                      <span className="text-xs text-gray-500">ครั้ง/นาที</span>
                    </div>
                  </div>
                  <Heart size={32} className="text-[#006488] animate-beat shrink-0" />
                </div>

                <div className="p-5 rounded-2xl bg-[#f3f4f5] border-l-8 border-[#126c40] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[#40484e] text-sm font-semibold">ความดันโลหิต</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-[#126c40]">{selectedPatient.bloodPressure}</span>
                      <span className="text-xs text-gray-500">mmHg</span>
                    </div>
                  </div>
                  <Activity size={32} className="text-[#126c40] shrink-0" />
                </div>
              </div>

              {/* History & Daily Notes Panels */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left col: History & Special instructions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#191c1d] mb-3 flex items-center gap-2 font-sans">
                      <FileText size={18} className="text-[#006488]" />
                      <span>ประวัติการรักษา</span>
                    </h3>
                    <div className="bg-[#f3f4f5] p-5 rounded-xl border border-[#bfc8ce] text-sm text-[#40484e] leading-relaxed whitespace-pre-line">
                      {selectedPatient.history}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#191c1d] mb-3 flex items-center gap-2 font-sans">
                      <ShieldAlert size={18} className="text-[#006488]" />
                      <span>การดูแลพิเศษ</span>
                    </h3>
                    <div className="bg-[#f3f4f5] p-5 rounded-xl border border-[#bfc8ce] text-sm text-[#40484e] leading-relaxed">
                      {selectedPatient.specialCare}
                    </div>
                  </div>
                </div>

                {/* Right col: Daily Care Records (Notes Subcollection) */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#191c1d] flex items-center gap-2 font-sans">
                      <FileText size={18} className="text-[#006488]" />
                      <span>บันทึกการดูแล</span>
                    </h3>
                    <button
                      onClick={() => setShowAddNote(true)}
                      className="text-xs bg-[#006488] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#2d7da3] cursor-pointer flex items-center gap-1 font-sans"
                    >
                      <Plus size={14} />
                      <span>เพิ่มบันทึก</span>
                    </button>
                  </div>

                  <div className="flex-grow space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {notes.length === 0 ? (
                      <p className="text-center py-8 text-gray-400 text-xs">ยังไม่มีบันทึกการดูแลของวันนี้</p>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-white border border-[#bfc8ce] rounded-xl shadow-xs relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#126c40]"></div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-gray-500">{note.createdAt}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-[#a1f5bc] text-[#1c7245] rounded-full font-bold">
                              {note.timeTag}
                            </span>
                          </div>
                          <p className="text-[#191c1d] text-sm leading-relaxed">{note.text}</p>
                          <p className="text-[10px] text-gray-400 mt-2 text-right">ผู้บันทึก: {note.caregiverName}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-20 text-[#40484e]">กรุณาเลือกผู้ป่วยเพื่อดูรายละเอียด</p>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW PATIENT */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#006488] mb-4 font-sans">เพิ่มประวัติผู้ป่วยใหม่ลง Firebase</h3>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ชื่อ - นามสกุลผู้สูงอายุ *</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="เช่น นายสมบูรณ์ สุขใจ"
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">อายุ (ปี) *</label>
                  <input
                    type="number"
                    required
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">เพศ *</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  >
                    <option value="เพศชาย">เพศชาย</option>
                    <option value="เพศหญิง">เพศหญิง</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">หมู่เลือด *</label>
                  <input
                    type="text"
                    required
                    value={newPatientBloodType}
                    onChange={(e) => setNewPatientBloodType(e.target.value)}
                    placeholder="เช่น O+, AB-"
                    className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">อัตราการเต้นของหัวใจ (bpm)</label>
                  <input
                    type="number"
                    value={newPatientHeartRate}
                    onChange={(e) => setNewPatientHeartRate(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">ความดันโลหิต (mmHg)</label>
                  <input
                    type="text"
                    value={newPatientBloodPressure}
                    onChange={(e) => setNewPatientBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ระดับความดูแลต้องการ *</label>
                <select
                  value={newPatientStatus}
                  onChange={(e) => setNewPatientStatus(e.target.value as 'normal' | 'special_care')}
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                >
                  <option value="normal">อาการปกติ</option>
                  <option value="special_care">ต้องดูแลพิเศษ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ประวัติการเจ็บป่วย</label>
                <textarea
                  value={newPatientHistory}
                  onChange={(e) => setNewPatientHistory(e.target.value)}
                  placeholder="ระบุโรคประจำตัว การผ่าตัด ฯลฯ"
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">การดูแลพิเศษและข้อควรระวัง</label>
                <textarea
                  value={newPatientSpecialCare}
                  onChange={(e) => setNewPatientSpecialCare(e.target.value)}
                  placeholder="เช่น ต้องจำกัดอาหารรสจัด ระวังการลุกเดิน..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#006488] text-white font-bold hover:bg-[#2d7da3] cursor-pointer"
                >
                  บันทึกผู้ป่วยใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CARE NOTE */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#006488] mb-4 font-sans">เพิ่มบันทึกการดูแลสำหรับผู้สูงอายุ</h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ช่วงเวลาอาหาร / กิจกรรม</label>
                <select
                  value={newNoteTimeTag}
                  onChange={(e) => setNewNoteTimeTag(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488]"
                >
                  <option value="มื้อเช้า">มื้อเช้า</option>
                  <option value="มื้อกลางวัน">มื้อกลางวัน</option>
                  <option value="มื้อเย็น">มื้อเย็น</option>
                  <option value="ระหว่างวัน">ระหว่างวัน</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">รายละเอียดอาการและพฤติกรรมวันนี้ *</label>
                <textarea
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="เช่น ทานข้าวต้มได้ดี อารมณ์แจ่มใสดีค่ะ..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[#bfc8ce] focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#006488] text-white font-bold hover:bg-[#2d7da3] cursor-pointer"
                >
                  โพสต์บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PATIENT RECORD */}
      {showEditPatient && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#006488] mb-4 font-sans">อัปเดตสถานะและข้อมูลการดูแล</h3>
            <form onSubmit={handleEditPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">ชีพจรล่าสุด (bpm)</label>
                  <input
                    type="number"
                    value={editPatientHeartRate}
                    onChange={(e) => setEditPatientHeartRate(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">ความดันล่าสุด (mmHg)</label>
                  <input
                    type="text"
                    value={editPatientBloodPressure}
                    onChange={(e) => setEditPatientBloodPressure(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ระดับอาการ</label>
                <select
                  value={editPatientStatus}
                  onChange={(e) => setEditPatientStatus(e.target.value as 'normal' | 'special_care')}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488]"
                >
                  <option value="normal">อาการปกติ</option>
                  <option value="special_care">ต้องดูแลพิเศษ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ข้อระวังและการดูแลพิเศษ</label>
                <textarea
                  value={editPatientSpecialCare}
                  onChange={(e) => setEditPatientSpecialCare(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006488] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditPatient(false)}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#006488] text-white font-bold hover:bg-[#2d7da3] cursor-pointer"
                >
                  บันทึกการอัปเดต
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
