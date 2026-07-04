import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Patient, Medication, Schedule, Note, Message, StatusUpdate } from '../types';

export async function seedDatabaseIfNeeded() {
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    if (!patientsSnap.empty) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Database empty. Seeding initial data...');

    // 1. Patients Data
    const patients: Patient[] = [
      {
        id: 'somchai_rakdee',
        name: 'นายสมชาย รักดี',
        age: 78,
        gender: 'เพศชาย',
        bloodType: 'O+',
        heartRate: 72,
        bloodPressure: '120/80',
        status: 'normal',
        history: 'โรคเบาหวานชนิดที่ 2 (รักษาต่อเนื่อง)\nความดันโลหิตสูง\nผ่าตัดข้อเข่าเสื่อมข้างขวา (2565)',
        specialCare: 'ต้องจำกัดน้ำตาลในอาหาร กายภาพบำบัดข้อเข่าสัปดาห์ละ 2 ครั้ง และระวังการทรงตัวขณะลุกจากที่นั่งเพื่อป้องกันการล้ม'
      },
      {
        id: 'prapha_srisook',
        name: 'นางประภา ศรีสุข',
        age: 75,
        gender: 'เพศหญิง',
        bloodType: 'AB-',
        heartRate: 84,
        bloodPressure: '135/85',
        status: 'special_care',
        history: 'โรคพาร์กินสัน\nโรคความดันโลหิตสูง\nโรคกระดูกพรุน',
        specialCare: 'ต้องช่วยเหลือในการทำกิจวัตรประจำวันอย่างใกล้ชิด ทำกายภาพฝึกเดินและนวดผ่อนคลายกล้ามเนื้ออย่างต่อเนื่อง'
      },
      {
        id: 'wichai_meechai',
        name: 'นายวิชัย มีชัย',
        age: 72,
        gender: 'เพศชาย',
        bloodType: 'A+',
        heartRate: 75,
        bloodPressure: '118/76',
        status: 'normal',
        history: 'โรคหลอดเลือดหัวใจ (ทำบายพาสแล้วปี 2566)\nไขมันในเลือดสูง',
        specialCare: 'ระมัดระวังอาการเหนื่อยง่าย ไม่ให้ทำงานหนักหรือเครียดเกินไป คอยเตือนเรื่องยาและเดินเล่นออกกำลังกายเบาๆ'
      }
    ];

    for (const p of patients) {
      await setDoc(doc(db, 'patients', p.id), p);
    }

    // 2. Notes for somchai_rakdee
    const notes: Note[] = [
      {
        id: 'note_1',
        patientId: 'somchai_rakdee',
        text: 'รับประทานอาหารได้ปกติ ทานยาครบตามกำหนด อารมณ์ดี ยิ้มแย้ม',
        timeTag: 'มื้อเช้า',
        createdAt: 'วันนี้, 09:30 น.',
        caregiverName: 'คุณเบญจวรรณ'
      },
      {
        id: 'note_2',
        patientId: 'somchai_rakdee',
        text: 'บ่นปวดเข่าเล็กน้อย ทานยาแก้ปวดแล้ว อาการดีขึ้นก่อนนอน',
        timeTag: 'มื้อเย็น',
        createdAt: 'เมื่อวาน, 20:00 น.',
        caregiverName: 'คุณเบญจวรรณ'
      }
    ];

    for (const n of notes) {
      await setDoc(doc(db, 'patients', n.patientId, 'notes', n.id), n);
    }

    // 3. Medications
    const medications: Medication[] = [
      {
        id: 'med_1',
        patientId: 'somchai_rakdee',
        time: '08:00 น.',
        name: 'ยาลดความดันโลหิต',
        instructions: '1 เม็ด หลังอาหารเช้า',
        status: 'done',
        givenBy: 'คุณเบญจวรรณ',
        givenAt: '08:15'
      },
      {
        id: 'med_2',
        patientId: 'somchai_rakdee',
        time: '12:30 น.',
        name: 'แคลเซียมและบำรุงกระดูก',
        instructions: '2 เม็ด หลังอาหารกลางวัน',
        status: 'pending'
      },
      {
        id: 'med_3',
        patientId: 'somchai_rakdee',
        time: '20:00 น.',
        name: 'ยานอนหลับ / คลายเครียด',
        instructions: '1 เม็ด ก่อนนอน 30 นาที',
        status: 'later'
      }
    ];

    for (const m of medications) {
      await setDoc(doc(db, 'medications', m.id), m);
    }

    // 4. Schedules
    const schedules: Schedule[] = [
      {
        id: 'sched_1',
        patientId: 'somchai_rakdee',
        title: 'ทานยาความดัน',
        location: 'ห้องนอน',
        date: '2026-07-03',
        time: '08:00',
        notes: 'ทานยาลดความดัน 1 เม็ดหลังอาหารทันที'
      },
      {
        id: 'sched_2',
        patientId: 'somchai_rakdee',
        title: 'นัดพบแพทย์หัวใจ',
        location: 'รพ.กรุงเทพ',
        date: '2026-07-03',
        time: '10:30',
        notes: 'พบหมอด้านโรคหัวใจเพื่อตรวจอัปเดตคลื่นไฟฟ้าหัวใจ'
      },
      {
        id: 'sched_3',
        patientId: 'somchai_rakdee',
        title: 'เดินเล่นในสวน',
        location: 'สวนสาธารณะ',
        date: '2026-07-03',
        time: '16:00',
        notes: 'กายภาพบำบัดช่วงบ่าย (ฝึกเดิน) เดินรอบสวน 2 รอบ'
      }
    ];

    for (const s of schedules) {
      await setDoc(doc(db, 'schedules', s.id), s);
    }

    // 5. Messages
    const messages: Message[] = [
      {
        id: 'msg_1',
        senderUid: 'daughter_gig',
        senderName: 'คุณลูกสาว (กิ๊ก)',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        text: 'สวัสดีค่ะคุณเนส วันนี้คุณแม่เป็นอย่างไรบ้างคะ?',
        timestamp: '09:15 น.'
      },
      {
        id: 'msg_2',
        senderUid: 'caregiver_nes',
        senderName: 'คุณเบญจวรรณ',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        text: 'สวัสดีครับคุณกิ๊ก วันนี้คุณแม่ทานข้าวได้เยอะครับ อารมณ์ดีมาก เพิ่งพาเดินเล่นในสวนมาครับ',
        images: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1kOHkuUc60i_nJV74rkLs-WLqfrzcze4u_EFJ5YuGLGyrEBKabhtMvBkYE1Xufdpi6K608gQ9XFIq6E2tOGiXMSEfcCWpGw1MEmJUKVxl-jwDAWN_NqxoJcBdrerQQUMLLU-Il14B4xSVpV0c-WcY8MqKb7HN8EKc3QvWQiJGAN5vI9HWYs1-iKArs3iHpI6f2i8HhcHd26qOInuYhlx53H5QcxrKBGQ3USBrizb3SgijlxohGGMBZnqMCyan1b3zReRQD4tFth5u,https://lh3.googleusercontent.com/aida-public/AB6AXuBIndluiUlB2ebnXDHI9n1cNXWFu1tGm584ipaiMpzT4q_rA_2aMJUrO_qjcciESckL4U-6ZqaD8hAlsfisnPo96ivZEPeLVvq82u1Cr0JXIQmC2eSNaouUi8b_iU9ooiJG7AwtNJyJ7jWe_HnAFPpN0dPCQWR2r6fBkRiWYT8Q1DuGojBqqFKOV6rXXMmzxxM1-WfnxYnzVEo76nBOgNyr-WMVnjkDpnpGxVpkVuCAvS12M9HEKZ-Nfr8alJPwRT_YRqCxfTJ6hmYZ',
        timestamp: '09:30 น.'
      },
      {
        id: 'msg_3',
        senderUid: 'daughter_gig',
        senderName: 'คุณลูกสาว (กิ๊ก)',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        text: 'ทานยาเรียบร้อยหรือยังคะคุณแม่?',
        timestamp: '10:45 น.'
      }
    ];

    for (const msg of messages) {
      await setDoc(doc(db, 'messages', msg.id), msg);
    }

    // 6. Status Updates
    const statusUpdates: StatusUpdate[] = [
      {
        id: 'status_1',
        text: 'วันนี้คุณปู่สมชายอารมณ์ดีมาก ทานข้าวต้มหมูสับได้หมดถ้วย ทานยาครบเรียบร้อยครับ ช่วงสายพาออกไปนั่งรับลมที่สวนหลังบ้าน ชวนคุยและเปิดเพลงสุนทราภรณ์ให้ฟัง ท่านหัวเราะและบอกคิดถึงหลานๆ ครับ',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1kOHkuUc60i_nJV74rkLs-WLqfrzcze4u_EFJ5YuGLGyrEBKabhtMvBkYE1Xufdpi6K608gQ9XFIq6E2tOGiXMSEfcCWpGw1MEmJUKVxl-jwDAWN_NqxoJcBdrerQQUMLLU-Il14B4xSVpV0c-WcY8MqKb7HN8EKc3QvWQiJGAN5vI9HWYs1-iKArs3iHpI6f2i8HhcHd26qOInuYhlx53H5QcxrKBGQ3USBrizb3SgijlxohGGMBZnqMCyan1b3zReRQD4tFth5u',
        createdAt: 'วันนี้, 11:00 น.',
        postedBy: 'คุณเบญจวรรณ'
      }
    ];

    for (const su of statusUpdates) {
      await setDoc(doc(db, 'statusUpdates', su.id), su);
    }

    console.log('Database successfully seeded!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
