'use client';

import { useEffect, useRef, useState, useMemo, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import MiniGames2 from '../Mini_games_2/Mini_games_2';
import MiniGames3 from '../Mini_games_3/Mini_games_3';
import MiniGames4 from '../Mini_games_4/Mini_games_4';
import MiniGames5 from '../Mini_games_5/Mini_games_5';
import AudioSettingsButton from '../components/AudioSettingsButton';

// ─────────────────────────────────────────────
//  โครงสร้างนี้สร้างตาม
//  "ข้อมูลการทำงานของเส้นทางเนื้อเรื่อง + ภาพ.drawio" (เวอร์ชันล่าสุด)
//
//  แก้ไขจากเวอร์ชันก่อนหน้า 3 เรื่องหลัก:
//   1) สลับมินิเกมให้ตรงผัง
//      - วันที่ 1 (ช่วงเปิดเรื่อง / introMiniGame)  -> Mini_games_4
//      - วันที่ 2 (ทางเลือกที่ 1 / optB)             -> Mini_games_3
//      - วันที่ 1 (ทางเลือกที่ 2 / optB)             -> Mini_games_2  (เหมือนเดิม)
//      - วันที่ 2 (ทางเลือกที่ 2 / optB)             -> Mini_games_5  (เหมือนเดิม)
//      - วันที่ 3 ไม่มีมินิเกมเลย                    -> 'none'         (เหมือนเดิม)
//
//   2) เพิ่มฉาก "เนื้อเรื่องทางเลือกที่ 1" (optA) ที่หายไป
//      ผังจริงทุกทางเลือก A (ทั้ง 3 วัน x ทั้ง 2 จุดเลือก) จะมีการโชว์
//      เนื้อเรื่องสั้นๆ ก่อน แล้วค่อยได้ Fracture +1 ไม่ใช่กระโดดรับแต้มทันที
//      (ปุ่ม "ไม่มั่นใจ" ในวันที่ 1 ก็จะย้อนไปที่ฉากเดียวกันนี้ตามผัง)
//
//   3) เพิ่มฉากเปิดวันที่ยังไม่มีในโค้ดเดิม
//      - วันที่ 2: "เริ่มเนื้อเรื่องวันที่2" -> "เนื้อเรื่องตอนอยู่โรงเรียน" -> ทางเลือก
//      - วันที่ 3: "เริ่มเนื้อเรื่องวันที่3" -> ทางเลือก
//
//   4) เพิ่มระบบ "ฉากหลัง" (background) ตามภาพที่ผังระบุไว้ในแต่ละจุด
//      ใช้ไฟล์จาก public/images/Daily story background images/
// ─────────────────────────────────────────────

// ── ภาพฉากหลัง (ตามชื่อไฟล์จริงใน public/images/Daily story background images) ──
const IMG_BASE = '/images/Daily story background images/';
const BG = {
  bedroom: encodeURI(IMG_BASE + 'ห้องนอน.jpg'),                     // ภาพห้องนอน
  classroomDay1: encodeURI(IMG_BASE + 'ห้องเรียนวันที่ 1.jpg'),        // ภาพห้องเรียนวันที่ 1
  courtyardDay2: encodeURI(IMG_BASE + 'ลานกว้างวันที่2.jpg'),          // ภาพลานกว้างวันที่ 2 (ตอนกลางวัน)
  courtyardEveningDay2: encodeURI(IMG_BASE + 'ลานกว้างตอนเย็นวันที่2.jpg'), // ภาพลานกว้างตอนเย็นวันที่ 2
  gardenDay2: encodeURI(IMG_BASE + 'สวนวันที่2.jpg'),                 // ภาพสวนวันที่ 2
  treeSpotDay3: encodeURI(IMG_BASE + 'จุดสงบใต้ต้นไม้วันที่3.jpg'),     // ภาพจุดสงบใต้ต้นไม้วันที่ 3
  cafeteriaDay3: encodeURI(IMG_BASE + 'โรงอาหารวันที่3.jpeg'),         // ภาพโรงอาหารวันที่ 3 (นามสกุล .jpeg)
} as const;

// ── ฉากหลังของ "ทุกโหนด" ในทุกวัน ระบุตรงๆ ทีละจุด (ไม่พึ่งการคงค่าเดิม) ──
// เพื่อให้ทุกทางแยก (optA / optB / confirm / ตั้งชื่อ / minigame gate / preEnding ฯลฯ)
// ที่อยู่ใน "ช่วงฉากเดียวกัน" ใช้ภาพพื้นหลังตรงกันเสมอ ไม่มีจุดไหนหลุดหรือเพี้ยน
// จุดที่ .drawio ระบุภาพไว้ชัดเจน (เปลี่ยนฉาก) กับจุดที่ .drawio ไม่ได้ระบุ (อยู่ในช่วง
// เดียวกับฉากก่อนหน้า) ถูกเขียนออกมาให้ครบทุก node ในนี้แล้ว
const DAY_BACKGROUNDS: Record<number, Partial<Record<StoryNode, string>>> = {
  // ── วันที่ 1: ห้องนอน -> ห้องเรียนวันที่ 1 (ช่วงทางเลือกที่ 1) -> ห้องนอน (ช่วงทางเลือกที่ 2) ──
  0: {
    intro: BG.bedroom,
    introMiniGame: BG.bedroom,
    afterIntro: BG.bedroom,
    choice1: BG.classroomDay1,
    choice1_optA: BG.classroomDay1,
    choice1_optB: BG.classroomDay1,
    choice1_confirm: BG.classroomDay1,
    choice1_name: BG.classroomDay1,
    converge: BG.bedroom,
    choice2: BG.bedroom,
    choice2_optA: BG.bedroom,
    choice2_optB: BG.bedroom,
    preEnding: BG.bedroom,
    dayEnd: BG.bedroom,
  },
  // ── วันที่ 2: ห้องนอน -> ลานกว้าง -> ลานกว้างตอนเย็น (ช่วงทางเลือกที่ 1) -> สวน (ช่วงทางเลือกที่ 2) ──
  1: {
    intro: BG.bedroom,
    atSchool: BG.courtyardDay2,
    choice1: BG.courtyardEveningDay2,
    choice1_optA: BG.courtyardEveningDay2,
    choice1_optB: BG.courtyardEveningDay2,
    converge: BG.gardenDay2,
    choice2: BG.gardenDay2,
    choice2_optA: BG.gardenDay2,
    choice2_optB: BG.gardenDay2,
    preEnding: BG.gardenDay2,
    dayEnd: BG.gardenDay2,
  },
  // ── วันที่ 3: ห้องนอน -> จุดสงบใต้ต้นไม้ (ช่วงทางเลือกที่ 1) -> ห้องนอน (ช่วงทางเลือกที่ 2) ──
  // หมายเหตุ: มีเพียง choice1_optA จุดเดียวที่ .drawio ระบุภาพแยกเป็นโรงอาหาร
  2: {
    intro: BG.bedroom,
    choice1: BG.treeSpotDay3,
    choice1_optA: BG.cafeteriaDay3,
    choice1_optB: BG.treeSpotDay3,
    converge: BG.bedroom,
    choice2: BG.bedroom,
    choice2_optA: BG.bedroom,
    choice2_optB: BG.bedroom,
    preEnding: BG.bedroom,
    dayEnd: BG.bedroom,
  },
};

function getBackground(dayIndex: number, node: StoryNode): string {
  return DAY_BACKGROUNDS[dayIndex]?.[node] ?? BG.bedroom;
}

// ── คำบรรยายเปิดเกม (typewriter) ───────────────────────────────────────────
const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาเริ่มการผจญภัยกันเลย',
];

// ── เนื้อเรื่องทั้งหมด (แก้ไขข้อความตรงนี้ได้เลย) ───────────────────────────
// หมายเหตุ: ตอนนี้มี *_optA_story ครบทุกวันแล้ว เพราะตามผัง .drawio
// ทางเลือก A ก็มีฉากเนื้อเรื่องของตัวเองก่อนได้รับ Fracture เช่นกัน
const TEXT: Record<string, string> = {
  // ── วันที่ 1 (ฉากหลัง: ห้องนอน -> ห้องเรียนวันที่ 1 -> ห้องนอน) ──────────
  day0_intro:              '[ เนื้อเรื่องเปิดเรื่องวันที่ 1 — ห้องนอน ]',
  day0_after_intro:        '[ เนื้อเรื่องหลังจบมินิเกมแรก ]',
  day0_choice1_optA_story: '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 1) — ห้องเรียน ]',
  day0_choice1_optB_story: '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 1) — ห้องเรียน ]',
  day0_converge_story:     '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 1) — กลับห้องนอน ]',
  day0_choice2_optA_story: '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 1) ]',
  day0_choice2_optB_story: '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 1) ]',
  day0_pre_ending:         '[ เนื้อเรื่องก่อนจบวันที่ 1 ]',

  // ── วันที่ 2 (ฉากหลัง: ห้องนอน -> ลานกว้าง -> ลานกว้างตอนเย็น -> สวน) ───
  day1_intro:               '[ เริ่มเนื้อเรื่องวันที่ 2 — ห้องนอน ]',
  day1_at_school:           '[ เนื้อเรื่องตอนอยู่โรงเรียน — ลานกว้าง ]',
  day1_choice1_optA_story:  '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 2) ]',
  day1_choice1_optB_story:  '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 2) ]',
  day1_converge_story:      '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 2) — สวน ]',
  day1_choice2_optA_story:  '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 2) ]',
  day1_choice2_optB_story:  '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 2) ]',
  day1_pre_ending:          '[ เนื้อเรื่องก่อนจบวันที่ 2 ]',

  // ── วันที่ 3 (ฉากหลัง: ห้องนอน -> จุดสงบใต้ต้นไม้ -> (โรงอาหาร) -> ห้องนอน) ─
  day2_intro:               '[ เริ่มเนื้อเรื่องวันที่ 3 — ห้องนอน ]',
  day2_choice1_optA_story:  '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 3) — โรงอาหาร ]',
  day2_choice1_optB_story:  '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 3) ]',
  day2_converge_story:      '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 3) — กลับห้องนอน ]',
  day2_choice2_optA_story:  '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 3) ]',
  day2_choice2_optB_story:  '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 3) ]',
  day2_pre_ending:          '[ เนื้อเรื่องก่อนจบวันที่ 3 ]',

  // ── จบเกม ────────────────────────────────────────────────────────────
  final_good: '[ คำบรรยายจบเกมแบบ Good Ending 🎉 ]',
  final_bad:  '[ คำบรรยายจบเกมแบบ Bad Ending ]',
};

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
const MINI_GAMES = ['Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

// 'none' = ไม่มีมินิเกม รับ Hope โดยตรง (ใช้ใน วันที่ 3)
type Choice1Config =
  | { hasConfirm: true }
  | { hasConfirm: false; optBMiniGame: MiniGameKey | 'none' };

type DayConfig = {
  dayLabel: string;
  introMiniGame?: MiniGameKey; // มีเฉพาะวันที่ 1
  hasSchoolIntro?: boolean;    // มีเฉพาะวันที่ 2 (ฉาก "เนื้อเรื่องตอนอยู่โรงเรียน")
  choice1: Choice1Config;
  choice2: { optBMiniGame: MiniGameKey | 'none' };
};

// ─────────────────────────────────────────────
//  DAY CONFIGS (ตรงตาม .drawio)
// ─────────────────────────────────────────────
const DAY_CONFIGS: DayConfig[] = [
  {
    dayLabel: 'วันที่ 1',
    introMiniGame: 'Mini_games_4', // แก้ตามผัง (เดิมเคยเป็น Mini_games_3)
    choice1: { hasConfirm: true },
    choice2: { optBMiniGame: 'Mini_games_2' },
  },
  {
    dayLabel: 'วันที่ 2',
    hasSchoolIntro: true,
    choice1: { hasConfirm: false, optBMiniGame: 'Mini_games_3' }, // แก้ตามผัง (เดิมเคยเป็น Mini_games_4)
    choice2: { optBMiniGame: 'Mini_games_5' },
  },
  {
    dayLabel: 'วันที่ 3',
    // ตาม .drawio: optB ทั้งสองช่วงไม่มีมินิเกม -> Hope +1 ตรงๆ
    choice1: { hasConfirm: false, optBMiniGame: 'none' },
    choice2: { optBMiniGame: 'none' },
  },
];

// ── ข้อความบนปุ่ม "ถัดไป" ของแต่ละ node ──────────────────────────────────
const NEXT_LABELS: Record<string, string> = {
  dialog:      'ถัดไป ▶',
  dialogStart: 'เริ่มผจญภัย ▶',
  miniGameGate:'เล่นมินิเกม ▶',
  dayEnd:      'ไปวันถัดไป ▶',
  dayEndLast:  'สรุปผล ▶',
  final:       'ถัดไป ▶',
  restart:     'เริ่มเกมใหม่ ↺',
  default:     'ถัดไป ▶',
};

type StoryNode =
  | 'intro'
  | 'introMiniGame'
  | 'afterIntro'
  | 'atSchool'        // ใหม่: วันที่ 2 เท่านั้น
  | 'choice1'
  | 'choice1_optA'    // ใหม่: ฉากเนื้อเรื่องก่อนรับ Fracture (ทุกวัน)
  | 'choice1_optB'
  | 'choice1_confirm'
  | 'choice1_name'
  | 'converge'
  | 'choice2'
  | 'choice2_optA'    // ใหม่: ฉากเนื้อเรื่องก่อนรับ Fracture (ทุกวัน)
  | 'choice2_optB'
  | 'preEnding'
  | 'dayEnd';

type MiniGameSource = 'intro' | 'choice1' | 'choice2';

type Screen = 'opening_dialog' | 'story' | 'final_narration' | 'recap';

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function MainGamePage() {
  const router = useRouter();

  // ── สถานะหลัก ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('opening_dialog');
  const [dayIndex, setDayIndex] = useState(0);
  const [node, setNode] = useState<StoryNode>('intro');

  // ── ค่าคะแนน ─────────────────────────────────────────────────────────────
  const [hope, setHope] = useState(0);
  const [fracture, setFracture] = useState(0);

  // ── ฉากหลัง ──────────────────────────────────────────────────────────────
  const currentBg = getBackground(dayIndex, node);

  // ── คำบรรยายเปิดเกม ──────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── ชื่อผู้เล่น ───────────────────────────────────────────────────────────
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── มินิเกม ───────────────────────────────────────────────────────────────
  const [selectedMiniGame, setSelectedMiniGame] = useState<MiniGameKey | null>(null);
  const [miniGameSource, setMiniGameSource] = useState<MiniGameSource | null>(null);

  const miniGameComponents = useMemo<Record<MiniGameKey, ComponentType>>(() => ({
    Mini_games_2: MiniGames2,
    Mini_games_3: MiniGames3,
    Mini_games_4: MiniGames4,
    Mini_games_5: MiniGames5,
  }), []);

  const dayConfig = DAY_CONFIGS[dayIndex];
  const showScoreCounter = screen === 'story' && node !== 'intro';

  // ── Dialog typewriter ─────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'opening_dialog') return;
    startTyping(DIALOGS[step]);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, screen]);

  // ── Focus ช่องตั้งชื่อ ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'story' && node === 'choice1_name') {
      inputRef.current?.focus();
    }
  }, [screen, node]);

  function startTyping(text: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsTyping(false);
      }
    }, 40);
  }

  function handleDialogNext() {
    if (isTyping) {
      clearInterval(timerRef.current!);
      timerRef.current = null;
      setDisplayedText(DIALOGS[step]);
      setIsTyping(false);
      return;
    }
    const next = step + 1;
    if (next < DIALOGS.length) {
      setStep(next);
    } else {
      goToDayStart(0);
    }
  }

  // ทุกวันเริ่มที่ node 'intro' เสมอ (วันที่ 1 มีมินิเกมเปิดเรื่อง,
  // วันที่ 2 มีฉาก "อยู่โรงเรียน" ต่อจาก intro, วันที่ 3 เข้า choice1 ต่อทันที)
  function goToDayStart(idx: number) {
    setDayIndex(idx);
    setScreen('story');
    setNode('intro');
  }

  function handleIntroNext() {
    if (dayConfig.introMiniGame) {
      setNode('introMiniGame');
    } else if (dayConfig.hasSchoolIntro) {
      setNode('atSchool');
    } else {
      setNode('choice1');
    }
  }

  function launchMiniGame(key: MiniGameKey, source: MiniGameSource) {
    setSelectedMiniGame(key);
    setMiniGameSource(source);
  }

  function handleReturnFromMiniGame() {
    const source = miniGameSource;
    setSelectedMiniGame(null);
    setMiniGameSource(null);

    if (source === 'intro') {
      setNode('afterIntro');
    } else if (source === 'choice1') {
      setHope(h => h + 1);
      setNode('converge');
    } else if (source === 'choice2') {
      setHope(h => h + 1);
      setNode('preEnding');
    }
  }

  // ── ทางเลือกที่ 1 ─────────────────────────────────────────────────────────
  // optA: โชว์เนื้อเรื่อง "เนื้อเรื่องทางเลือกที่ 1" ก่อน แล้วค่อยได้ Fracture +1
  function handleChoice1OptA() {
    setNode('choice1_optA');
  }

  function handleChoice1OptAContinue() {
    setFracture(f => f + 1);
    setNode('converge');
  }

  // optB: ไปแสดงเนื้อเรื่อง (หรือ confirm ถ้าวันที่ 1)
  function handleChoice1OptB() {
    if (dayConfig.choice1.hasConfirm) {
      setNode('choice1_confirm');
    } else {
      setNode('choice1_optB');
    }
  }

  function handleConfirmYes() {
    setNode('choice1_name');
  }

  // ตามผัง: "ไม่มั่นใจ" จะย้อนไปที่ฉาก "เนื้อเรื่องทางเลือกที่ 1" เดียวกับ optA
  // แล้วได้ Fracture +1 เหมือนกัน
  function handleConfirmNo() {
    setNode('choice1_optA');
  }

  function handleConfirmName() {
    const name = inputName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    setPlayerName(name);
    setHope(h => h + 1);
    setNode('converge');
  }

  // ── ทางเลือกที่ 2 ─────────────────────────────────────────────────────────
  // optA: โชว์เนื้อเรื่องก่อน แล้วค่อยได้ Fracture +1
  function handleChoice2OptA() {
    setNode('choice2_optA');
  }

  function handleChoice2OptAContinue() {
    setFracture(f => f + 1);
    setNode('preEnding');
  }

  function handleChoice2OptB() {
    setNode('choice2_optB');
  }

  // ── จบวัน / จบเกม ─────────────────────────────────────────────────────────
  function handleDayEndNext() {
    if (dayIndex < DAY_CONFIGS.length - 1) {
      goToDayStart(dayIndex + 1);
    } else {
      setScreen('final_narration');
    }
  }

  function handleRestart() {
    setScreen('opening_dialog');
    setStep(0);
    setDayIndex(0);
    setNode('intro');
    setHope(0);
    setFracture(0);
    setPlayerName('');
    setInputName('');
    router.push('/');
  }

  // ── Mini-game overlay ─────────────────────────────────────────────────────
  if (selectedMiniGame) {
    const SelectedGame = miniGameComponents[selectedMiniGame];
    return (
      <div className="relative min-h-screen bg-black">
        <div className="absolute z-50 top-4 left-4">
          <button
            type="button"
            onClick={handleReturnFromMiniGame}
            className="rounded-lg border border-slate-200/30 bg-slate-950/80 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
          >
            จบเกมและกลับ
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50">
          <AudioSettingsButton />
        </div>
        <SelectedGame />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  UI helpers
  // ─────────────────────────────────────────────────────────────────────────
  function NextButton({
    onClick,
    label = NEXT_LABELS.default,
    className = '',
  }: {
    onClick: () => void;
    label?: string;
    className?: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          'btn-primary inline-flex items-center justify-center gap-2 rounded-lg ' +
          'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 ' +
          'text-white font-semibold px-6 py-2.5 text-base ' +
          'border border-blue-400/60 shadow-lg shadow-blue-950/50 ' +
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
          className
        }
      >
        {label}
      </button>
    );
  }

  function Box({ label, children, showScore }: { label?: string; children: React.ReactNode; showScore?: boolean }) {
    return (
      <div className={`relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 ${node !== 'choice1_name' ? 'animate-fadeUp' : ''}`}>
        {showScore && (
          <div className="absolute top-3 right-5 flex items-center gap-3 rounded-full bg-blue-950/80 border border-blue-500/40 px-3 py-1">
            <span className="flex items-center gap-1 text-cyan-300 text-sm font-semibold">
              <span className="text-xs">✨</span>{hope}
            </span>
            <span className="flex items-center gap-1 text-red-300 text-sm font-semibold">
              <span className="text-xs">💔</span>{fracture}
            </span>
          </div>
        )}
        {label && <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">{label}</p>}
        {children}
      </div>
    );
  }

  function StoryBox({ textKey, next, label = 'เนื้อเรื่อง', nextLabel = NEXT_LABELS.default }: {
    textKey: string; next: () => void; label?: string; nextLabel?: string;
  }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">{TEXT[textKey]}</p>
        <div className="mt-4 flex justify-end">
          <NextButton onClick={next} label={nextLabel} />
        </div>
      </Box>
    );
  }

  function MiniGameGate({ label, onPlay, playLabel = NEXT_LABELS.miniGameGate }: {
    label: string; onPlay: () => void; playLabel?: string;
  }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
          ก่อนไปต่อ ลองเล่นมินิเกมกันก่อนสักหน่อย
        </p>
        <div className="mt-4 flex justify-end">
          <NextButton onClick={onPlay} label={playLabel} />
        </div>
      </Box>
    );
  }

  function ChoiceBox({ label, choices }: {
    label: string;
    choices: { label: string; color: 'green' | 'purple' | 'yellow' | 'red'; onClick: () => void }[];
  }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <div className="flex flex-col gap-3">
          {choices.map((c, i) => (
            <button key={i} onClick={c.onClick} className={`choice-btn choice-${c.color}`}>{c.label}</button>
          ))}
        </div>
      </Box>
    );
  }

  function t(suffix: string) {
    return `day${dayIndex}_${suffix}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">
      {/* ── ฉากหลัง (เปลี่ยนตามจุดที่ .drawio ระบุ) ── แสดงเฉพาะช่วงเดินเนื้อเรื่อง */}
      {screen === 'story' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-500"
          style={{ backgroundImage: `url(${currentBg})` }}
        >
          <div className="absolute inset-0 bg-black/55" />
        </div>
      )}
      {screen !== 'story' && <Stars />}

      <div className="fixed top-4 right-4 z-50">
        <AudioSettingsButton />
      </div>

      {/* ── คำบรรยายเปิดเกม ── */}
      {screen === 'opening_dialog' && (
        <Box label="ข้อความ">
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {displayedText}
            <span className="inline-block w-[2px] h-[1.1em] bg-blue-400 align-middle ml-0.5 animate-blink" />
          </p>
          <div className="mt-3 text-right">
            <NextButton
              onClick={handleDialogNext}
              label={step === DIALOGS.length - 1 && !isTyping ? NEXT_LABELS.dialogStart : NEXT_LABELS.dialog}
            />
          </div>
        </Box>
      )}

      {screen === 'story' && (
        <>
          {/* ── เปิดวัน (ฉากที่ 1 ของทุกวัน) ── */}
          {node === 'intro' && (
            <StoryBox textKey={t('intro')} label={dayConfig.dayLabel} next={handleIntroNext} />
          )}

          {/* ── มินิเกมเปิดเรื่อง (มีเฉพาะวันที่ 1 -> Mini_games_4) ── */}
          {node === 'introMiniGame' && dayConfig.introMiniGame && (
            <MiniGameGate
              label={dayConfig.dayLabel}
              onPlay={() => launchMiniGame(dayConfig.introMiniGame!, 'intro')}
            />
          )}

          {node === 'afterIntro' && (
            <StoryBox textKey={t('after_intro')} next={() => setNode('choice1')} />
          )}

          {/* ── ฉาก "เนื้อเรื่องตอนอยู่โรงเรียน" (มีเฉพาะวันที่ 2) ── */}
          {node === 'atSchool' && (
            <StoryBox textKey={t('at_school')} next={() => setNode('choice1')} />
          )}

          {/* ── ทางเลือกที่ 1 ── */}
          {node === 'choice1' && (
            <ChoiceBox label={`ทางเลือก – ${dayConfig.dayLabel}`} choices={[
              { label: 'ทางเลือกที่ 1', color: 'green',  onClick: handleChoice1OptA },
              { label: 'ทางเลือกที่ 2', color: 'purple', onClick: handleChoice1OptB },
            ]} />
          )}

          {/*
            choice1_optA: ฉากเนื้อเรื่องของทางเลือกที่ 1 (ทุกวัน) — โชว์ก่อนได้ Fracture +1
            ปุ่ม "ไม่มั่นใจ" ในวันที่ 1 ก็จะวนมาที่ฉากนี้เหมือนกันตามผัง
          */}
          {node === 'choice1_optA' && (
            <StoryBox textKey={t('choice1_optA_story')} next={handleChoice1OptAContinue} />
          )}

          {/*
            choice1_optB:
            - วันที่ 1: ไม่ถึง node นี้ (ข้ามไป choice1_confirm แทน)
            - วันที่ 2: แสดงเนื้อเรื่อง -> เปิดมินิเกม (Mini_games_3) -> Hope +1
            - วันที่ 3: แสดงเนื้อเรื่อง -> Hope +1 ตรงๆ (ไม่มีมินิเกม)
          */}
          {node === 'choice1_optB' && !dayConfig.choice1.hasConfirm && (
            <StoryBox
              textKey={t('choice1_optB_story')}
              next={() => {
                const cfg = dayConfig.choice1;
                if (cfg.hasConfirm) return;
                if (cfg.optBMiniGame === 'none') {
                  setHope(h => h + 1);
                  setNode('converge');
                } else {
                  launchMiniGame(cfg.optBMiniGame, 'choice1');
                }
              }}
            />
          )}

          {/* ── มั่นใจ? (วันที่ 1 เท่านั้น) ── */}
          {node === 'choice1_confirm' && (
            <ChoiceBox label="มั่นใจกับทางเลือกไหม" choices={[
              { label: 'มั่นใจ',    color: 'green', onClick: handleConfirmYes },
              { label: 'ไม่มั่นใจ', color: 'red',   onClick: handleConfirmNo },
            ]} />
          )}

          {/* ── ตั้งชื่อผู้เล่น (วันที่ 1 เท่านั้น) ── */}
          {node === 'choice1_name' && (
            <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6">
              <p className="text-base font-medium text-yellow-300 mb-1">ตั้งชื่อตัวละครของคุณ</p>
              <p className="text-sm text-blue-300 mb-4">ใส่ชื่อตัวเอกของเรื่องราวด้านล่าง</p>
              <div className="flex gap-3 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={20}
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmName()}
                  placeholder="ชื่อตัวละคร..."
                  autoFocus
                  className="flex-1 bg-white/5 border border-blue-600 focus:border-blue-400 rounded-lg text-slate-100 text-base px-4 py-2.5 outline-none placeholder-blue-900 transition-colors"
                />
                <NextButton onClick={handleConfirmName} label="ยืนยัน ✓" />
              </div>
            </div>
          )}

          {/* ── บรรจบกัน ── */}
          {node === 'converge' && (
            <StoryBox textKey={t('converge_story')} next={() => setNode('choice2')} />
          )}

          {/* ── ทางเลือกที่ 2 ── */}
          {node === 'choice2' && (
            <ChoiceBox label={`ทางเลือก – ${dayConfig.dayLabel}`} choices={[
              { label: 'ทางเลือก A', color: 'green',  onClick: handleChoice2OptA },
              { label: 'ทางเลือก B', color: 'purple', onClick: handleChoice2OptB },
            ]} />
          )}

          {/* ── choice2_optA: ฉากเนื้อเรื่องของทางเลือก A (ทุกวัน) ก่อนได้ Fracture +1 ── */}
          {node === 'choice2_optA' && (
            <StoryBox textKey={t('choice2_optA_story')} next={handleChoice2OptAContinue} />
          )}

          {/*
            choice2_optB:
            - วันที่ 1: แสดงเนื้อเรื่อง -> เปิดมินิเกม (Mini_games_2) -> Hope +1
            - วันที่ 2: แสดงเนื้อเรื่อง -> เปิดมินิเกม (Mini_games_5) -> Hope +1
            - วันที่ 3: แสดงเนื้อเรื่อง -> Hope +1 ตรงๆ (ไม่มีมินิเกม)
          */}
          {node === 'choice2_optB' && (
            <StoryBox
              textKey={t('choice2_optB_story')}
              next={() => {
                if (dayConfig.choice2.optBMiniGame === 'none') {
                  setHope(h => h + 1);
                  setNode('preEnding');
                } else {
                  launchMiniGame(dayConfig.choice2.optBMiniGame, 'choice2');
                }
              }}
            />
          )}

          {/* ── ก่อนจบวัน ── */}
          {node === 'preEnding' && (
            <StoryBox textKey={t('pre_ending')} label="ก่อนจบวัน" next={() => setNode('dayEnd')} />
          )}

          {/* ── จบวัน ── */}
          {node === 'dayEnd' && (
            <Box label={dayConfig.dayLabel} showScore={showScoreCounter}>
              <p className="text-[17px] leading-relaxed text-slate-100">
                จบ{dayConfig.dayLabel}แล้ว
              </p>
              <div className="mt-4 text-right">
                <NextButton
                  onClick={handleDayEndNext}
                  label={dayIndex < DAY_CONFIGS.length - 1 ? NEXT_LABELS.dayEnd : NEXT_LABELS.dayEndLast}
                />
              </div>
            </Box>
          )}
        </>
      )}

      {/* ── คำบรรยายจบเกม (คำนวณค่า Hope / Fracture) ── */}
      {screen === 'final_narration' && (
        <Box label="จบเกม" showScore>
          <p className="text-[17px] leading-relaxed text-slate-100">
            {TEXT[hope > fracture ? 'final_good' : 'final_bad']}
          </p>
          <div className="mt-4 text-right">
            <NextButton onClick={() => setScreen('recap')} label={NEXT_LABELS.final} />
          </div>
        </Box>
      )}

      {/* ── สรุปผล (Recap การกระทำของผู้เล่นตลอดทั้งเกม) ── */}
      {screen === 'recap' && (
        <Box label="สรุปผล">
          <p className="text-lg text-yellow-300">
            {playerName ? `${playerName} ` : ''}ผ่านการผจญภัยมาได้แล้ว
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-cyan-300">✨ Hope: {hope}</span>
            <span className="text-red-300">💔 Fracture: {fracture}</span>
          </div>
          <p className="text-sm text-blue-300 mt-3">ขอบคุณที่เล่นเกมนี้ 🌟</p>
          <div className="mt-4 text-right">
            <button onClick={handleRestart} className="btn-secondary">
              {NEXT_LABELS.restart}
            </button>
          </div>
        </Box>
      )}
    </div>
  );
}

/* ── Stars (ใช้ตอนไม่มีฉากหลังภาพ เช่น หน้าคำบรรยายเปิด/ปิดเกม) ── */
function Stars() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  })), []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 20% 30%, #0a0a2e 0%, #000 70%)' }}
    >
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
    </div>
  );
}