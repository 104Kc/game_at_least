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
// ─────────────────────────────────────────────

// ── ภาพฉากหลัง (ตามชื่อไฟล์จริงใน public/images/Daily story background images) ──
const IMG_BASE = '/images/Daily story background images/';
const BG = {
  bedroom: encodeURI(IMG_BASE + 'ห้องนอน.jpg'),
  classroomDay1: encodeURI(IMG_BASE + 'ห้องเรียนวันที่ 1.jpg'),
  courtyardDay2: encodeURI(IMG_BASE + 'ลานกว้างวันที่2.jpg'),
  courtyardEveningDay2: encodeURI(IMG_BASE + 'ลานกว้างตอนเย็นวันที่2.jpg'),
  gardenDay2: encodeURI(IMG_BASE + 'สวนวันที่2.jpg'),
  treeSpotDay3: encodeURI(IMG_BASE + 'จุดสงบใต้ต้นไม้วันที่3.jpg'),
  cafeteriaDay3: encodeURI(IMG_BASE + 'โรงอาหารวันที่3.jpeg'),
} as const;

const DAY_BACKGROUNDS: Record<number, Partial<Record<StoryNode, string>>> = {
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

const STORY_NODE_TEXT_KEY: Partial<Record<StoryNode, string>> = {
  intro: 'intro',
  afterIntro: 'after_intro',
  atSchool: 'at_school',
  choice1_optA: 'choice1_optA_story',
  choice1_optB: 'choice1_optB_story',
  converge: 'converge_story',
  choice2_optA: 'choice2_optA_story',
  choice2_optB: 'choice2_optB_story',
  preEnding: 'pre_ending',
};

function splitStorySegments(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) return paragraphs;

  const maxLength = 240;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return [trimmed];

  const chunks: string[] = [];
  let remainder = trimmed;

  while (remainder.length > maxLength) {
    const slice = remainder.slice(0, maxLength);
    const boundary = Math.max(
      slice.lastIndexOf('。'),
      slice.lastIndexOf('.'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?'),
      slice.lastIndexOf(' '),
    );
    const cut = boundary > 0 ? boundary + 1 : maxLength;
    chunks.push(remainder.slice(0, cut).trim());
    remainder = remainder.slice(cut).trim();
  }

  if (remainder) chunks.push(remainder);
  return chunks;
}

// ── คำบรรยายเปิดเกม (typewriter) ───────────────────────────────────────────
const DIALOGS = [
  'มันคืออีกหนึ่งวัน',
  'เป็นบรรยากาศที่ไม่ค่อยดีนักสำหรับวันใหม่',
  'ไม่มีเสียงนกร้อง',
  'ไม่มีแม้แต่แสงสว่างที่ลอดผ่านมาให้คุณเห็น',
  'ไม่มีแม้แต่แสงสว่างที่ลอดผ่านมาให้คุณเห็น',
  'มีเพียงเสียงรบกวนแปลกๆที่ดังอย่างต่อเนื่อง',
  'ต้นตอของมันอยู่ไม่ไกลมากจากตัวคุณมากนัก',
  'โทรศัพท์ที่วางอยู่บนลิ้นชักข้างหัวเตียง',
  'คุณขยับตัวเพียงเล็กน้อยจนเอื้อมือถึงมันได้สำเร็จ',
  'คุณปิดเสียงนาฬิกาปลุก',
];

const TEXT: Record<string, string> = {
  day0_intro: `ความสงบกลับมาอีกครั้ง
คุณพลิกตัวกลับไปในที่จุดเดิม
ดวงตาทั้งสองข้างของคุณยังคงลังเลที่จะเปิดออก
คุณรู้ดี ตอนนี้ไม่ใช่เวลาที่จะนิ่งเฉยและปล่อยเวลาให้ผ่านไป
ในตอนนั้นคุณได้ตัดสินใจ
คุณลุกขึ้น
คุณสูดหายใจเข้าลึกๆ
พยายามสั่งการร่างกายส่วนบนให้ขยับ

ทว่า
สิ่งที่เกิดขึ้นกลับเป็นตัวของคุณที่แค่พลิกไปด้านข้างเท่านั้น
คุณรู้สึกว่าร่างกายหนักอึ้งราวกับเหล็กหลายสิบตัน
แต่ในขณะเดียวกันก็ยังสามารถขยับแขนขาได้เป็นปกติ
เป็นความรู้สึกที่อธิบายไม่ได้
ลุกขึ้น

คุณพยายามอีกครั้ง
แต่ยิ่งคุณคิดที่จะทำมัน ก็ยิ่งรู้สึกว่ามีบางอย่างกดคุณเอาไว้
คุณยกแขนขึ้นมาก่ายหน้าผากตัวเอง ก่อนจะพยายามยืดเส้นเบาๆ
คุณสูดหายใจอีกครั้งและลองเริ่มจากการลืมตาขึ้นมาก่อน
ดวงตาของคุณที่เปิดออกเพียงครึ่งเดียวได้จ้องตรงไปที่เพดานห้อง
โฟกัส


คุณพยายามบอกตัวเองให้ลืมตาค้างเอาไว้
จ้องตรงต่อไปที่เพดานตรงหน้า
จากนั้นจึงเริ่มลองกวาดสายตามองรอบๆ ห้อง
ด้วยแรงอันน้อยนิดที่มี คุณทำได้เพียงแค่พลิกตัวไปมาอยู่สองสามครั้งเท่านั้น
คุณตัดสินใจกลับมาตั้งหลักอีกครั้ง
จ้องมองไปยังเพดานผืนเดิมที่ว่างเปล่า
มีเพียงหลอดไฟเพดานที่ไร้ซึ่งแสงไฟ


คุณจ้องมองไปในความว่างเปล่าอยู่นานสองนาน
เปลือกตาของคุณเบาขึ้นจนสามารถเปิดได้อย่างเต็มที่
ร่างกายของคุณเองก็ดูจะเบาขึ้นมาแล้วเหมือนกัน
ตอนนี้มีเพียงอุปสรรคเดียวเท่านั้น`,
  day0_after_intro:        '[ เนื้อเรื่องหลังจบมินิเกมแรก ]',
  day0_choice1_optA_story: '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 1) — ห้องเรียน ]',
  day0_choice1_optB_story: '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 1) — ห้องเรียน ]',
  day0_converge_story:     '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 1) — กลับห้องนอน ]',
  day0_choice2_optA_story: '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 1) ]',
  day0_choice2_optB_story: '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 1) ]',
  day0_pre_ending:         '[ เนื้อเรื่องก่อนจบวันที่ 1 ]',

  day1_intro:               '[ เริ่มเนื้อเรื่องวันที่ 2 — ห้องนอน ]',
  day1_at_school:           '[ เนื้อเรื่องตอนอยู่โรงเรียน — ลานกว้าง ]',
  day1_choice1_optA_story:  '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 2) ]',
  day1_choice1_optB_story:  '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 2) ]',
  day1_converge_story:      '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 2) — สวน ]',
  day1_choice2_optA_story:  '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 2) ]',
  day1_choice2_optB_story:  '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 2) ]',
  day1_pre_ending:          '[ เนื้อเรื่องก่อนจบวันที่ 2 ]',

  day2_intro:               '[ เริ่มเนื้อเรื่องวันที่ 3 — ห้องนอน ]',
  day2_choice1_optA_story:  '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 3) — โรงอาหาร ]',
  day2_choice1_optB_story:  '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 3) ]',
  day2_converge_story:      '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 3) — กลับห้องนอน ]',
  day2_choice2_optA_story:  '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 3) ]',
  day2_choice2_optB_story:  '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 3) ]',
  day2_pre_ending:          '[ เนื้อเรื่องก่อนจบวันที่ 3 ]',

  final_good: `คุณเคยได้ยินหรือเปล่า

เรื่องที่ว่าการขยับปีกของผีเสื้ออาจทำให้เกิดพายุเฮอริเคนได้

ถ้าได้เห็นกับตาคงเจ็บจี๊ดเนอะว่านั่น?

ฮ่าๆ....

แต่ดูเหมือนว่า....

เราจะได้เห็นมันแล้วล่ะ....

แบบนี้แสดงว่า... เราคงต้องตั้งชื่อพายุลูกนี้ว่า "{playerName}" ใช่มั้ยนะ?`,
  final_bad: `ในตอนที่ผีเสื้อสายเป็นครั้งแรก

มันราวกับว่าพวกมันได้เกิดใหม่...

เกิดใหม่เป็นสิ่งที่งดงามเกินจะบรรยาย

ปีกของพวกมันช่างน่าหลงใหล และน่าทึ่ง

ความงดงามนี้สามารถพาพวกมันบินข้ามมหาสมุทรได้

ช่างเป็นความงามที่แข็งแกร่ง...

แต่ในขณะเดียวกัน... ก็แสนบอบบาง

แม้จะเปล่งประกายมากแค่ไหน แต่เมื่อยามฝนตก... ปีกที่แสนบอบบางนั้น...`,
};

function formatStoryText(text: string, values: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
const MINI_GAMES = ['Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

type Choice1Config =
  | { hasConfirm: true }
  | { hasConfirm: false; optBMiniGame: MiniGameKey | 'none' };

type DayConfig = {
  dayLabel: string;
  introMiniGame?: MiniGameKey;
  hasSchoolIntro?: boolean;
  choice1: Choice1Config;
  choice2: { optBMiniGame: MiniGameKey | 'none' };
};

const DAY_CONFIGS: DayConfig[] = [
  {
    dayLabel: 'วันที่ 1',
    introMiniGame: 'Mini_games_4',
    choice1: { hasConfirm: true },
    choice2: { optBMiniGame: 'Mini_games_2' },
  },
  {
    dayLabel: 'วันที่ 2',
    hasSchoolIntro: true,
    choice1: { hasConfirm: false, optBMiniGame: 'Mini_games_3' },
    choice2: { optBMiniGame: 'Mini_games_5' },
  },
  {
    dayLabel: 'วันที่ 3',
    choice1: { hasConfirm: false, optBMiniGame: 'none' },
    choice2: { optBMiniGame: 'none' },
  },
];

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
  | 'atSchool'
  | 'choice1'
  | 'choice1_optA'
  | 'choice1_optB'
  | 'choice1_confirm'
  | 'choice1_name'
  | 'converge'
  | 'choice2'
  | 'choice2_optA'
  | 'choice2_optB'
  | 'preEnding'
  | 'dayEnd';

type MiniGameSource = 'intro' | 'choice1' | 'choice2';

type Screen = 'opening_dialog' | 'story' | 'final_narration' | 'recap';

// ─────────────────────────────────────────────
//  STABLE, TOP-LEVEL UI COMPONENTS
//  (แยกออกมานอก MainGamePage เพื่อไม่ให้ถูกสร้างใหม่ทุกครั้งที่ re-render
//   ระหว่าง typewriter กำลังพิมพ์ — นี่คือสาเหตุของบั๊ก
//   "กดครั้งแรกแล้วข้อความขึ้นครบ + ข้ามไปเลยในคลิกเดียว" เดิม
//   เพราะปุ่มถูก unmount/remount ทุก 40ms ระหว่างพิมพ์)
// ─────────────────────────────────────────────

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

function Box({
  label,
  children,
  showScore,
  hope,
  fracture,
  fadeUp = true,
}: {
  label?: string;
  children: React.ReactNode;
  showScore?: boolean;
  hope: number;
  fracture: number;
  fadeUp?: boolean;
}) {
  return (
    <div className={`relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 ${fadeUp ? 'animate-fadeUp' : ''}`}>
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

/**
 * StoryBox — จุดสำคัญของการแก้บั๊ก
 *
 * onAdvance คือ "ผู้ตัดสินใจเพียงจุดเดียว" ว่าจะทำอะไรเมื่อผู้เล่นกด:
 *  - ถ้ากำลังพิมพ์อยู่ (isTyping)      -> แสดงข้อความให้ครบทันที (ไม่ไปไหนต่อ)
 *  - ถ้าพิมพ์ครบแล้วแต่ยังมี segment ถัดไป -> เลื่อนไป segment ถัดไป (เริ่มพิมพ์ใหม่)
 *  - ถ้าพิมพ์ครบและอยู่ segment สุดท้าย   -> เรียก next() เพื่อไปฉาก/โหนดถัดไป
 *
 * ต่างจากโค้ดเดิมที่ StoryBox มี handleClick ของตัวเอง "และ" proceedStory
 * ก็เช็คเงื่อนไขซ้ำอีกชั้นหนึ่ง (สองจุดเช็ค isTyping/segmentIndex ซ้อนกัน)
 * เมื่อรวมกับการที่ StoryBox ถูกสร้างเป็นคอมโพเนนต์ใหม่ทุก re-render
 * (เพราะเดิมประกาศไว้ข้างในฟังก์ชันคอมโพเนนต์หลัก) ทำให้ปุ่มถูก
 * unmount/remount ระหว่างพิมพ์ตัวอักษรทุก 40ms จนบางครั้งคลิกครั้งแรก
 * โดนตีความว่าเป็นการคลิกที่ปุ่ม "คนละตัว" ล่วงหน้า ผลคือพิมพ์ครบ + ข้ามไปในคลิกเดียว
 */
function StoryBox({
  isTyping,
  displayedText,
  label = 'เนื้อเรื่อง',
  nextLabel = NEXT_LABELS.default,
  showScore,
  hope,
  fracture,
  fadeUp,
  onAdvance,
}: {
  isTyping: boolean;
  displayedText: string;
  label?: string;
  nextLabel?: string;
  showScore?: boolean;
  hope: number;
  fracture: number;
  fadeUp?: boolean;
  onAdvance: () => void;
}) {
  return (
    <Box label={label} showScore={showScore} hope={hope} fracture={fracture} fadeUp={fadeUp}>
      <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
        {displayedText}
        <span className="inline-block w-[2px] h-[1.1em] bg-blue-400 align-middle ml-0.5 animate-blink" />
      </p>
      <div className="mt-4 flex justify-end">
        <NextButton onClick={onAdvance} label={nextLabel} />
      </div>
    </Box>
  );
}

function MiniGameGate({
  label,
  onPlay,
  playLabel = NEXT_LABELS.miniGameGate,
  showScore,
  hope,
  fracture,
}: {
  label: string;
  onPlay: () => void;
  playLabel?: string;
  showScore?: boolean;
  hope: number;
  fracture: number;
}) {
  return (
    <Box label={label} showScore={showScore} hope={hope} fracture={fracture}>
      <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
        ก่อนไปต่อ ลองเล่นมินิเกมกันก่อนสักหน่อย
      </p>
      <div className="mt-4 flex justify-end">
        <NextButton onClick={onPlay} label={playLabel} />
      </div>
    </Box>
  );
}

function ChoiceBox({
  label,
  choices,
  showScore,
  hope,
  fracture,
}: {
  label: string;
  choices: { label: string; color: 'green' | 'purple' | 'yellow' | 'red'; onClick: () => void }[];
  showScore?: boolean;
  hope: number;
  fracture: number;
}) {
  return (
    <Box label={label} showScore={showScore} hope={hope} fracture={fracture}>
      <div className="flex flex-col gap-3">
        {choices.map((c, i) => (
          <button key={i} onClick={c.onClick} className={`choice-btn choice-${c.color}`}>{c.label}</button>
        ))}
      </div>
    </Box>
  );
}

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

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function MainGamePage() {
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>('opening_dialog');
  const [dayIndex, setDayIndex] = useState(0);
  const [node, setNode] = useState<StoryNode>('intro');

  const [hope, setHope] = useState(0);
  const [fracture, setFracture] = useState(0);

  const currentBg = getBackground(dayIndex, node);

  // ── คำบรรยายเปิดเกม ──
  const [step, setStep] = useState(0);
  const [dialogDisplayedText, setDialogDisplayedText] = useState('');
  const [dialogIsTyping, setDialogIsTyping] = useState(false);
  const dialogTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── เนื้อเรื่องระหว่างเล่น ──
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [storySegments, setStorySegments] = useState<string[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── ชื่อผู้เล่น ──
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── มินิเกม ──
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
  const currentSegmentText = storySegments[segmentIndex] ?? '';

  // ── Dialog typewriter (หน้าเปิดเกม) ──
  useEffect(() => {
    if (screen !== 'opening_dialog') return;
    startDialogTyping(DIALOGS[step]);
    return () => { if (dialogTimerRef.current) clearInterval(dialogTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, screen]);

  // ── Focus ช่องตั้งชื่อ ──
  useEffect(() => {
    if (screen === 'story' && node === 'choice1_name') {
      inputRef.current?.focus();
    }
  }, [screen, node]);

  // ── เมื่อเปลี่ยนโหนด/วัน/ฉากจบ -> โหลด segments ของข้อความใหม่ ──
  useEffect(() => {
    if (screen === 'opening_dialog') return;

    let text: string | null = null;
    if (screen === 'story') {
      const suffix = STORY_NODE_TEXT_KEY[node];
      if (suffix) {
        text = TEXT[`day${dayIndex}_${suffix}`];
      }
    } else if (screen === 'final_narration') {
      if (hope > fracture) {
        text = formatStoryText(TEXT.final_good, {
          playerName: playerName || 'พายุลูกนี้',
        });
      } else {
        text = TEXT.final_bad;
      }
    }

    const segments = text ? splitStorySegments(text) : [];
    setStorySegments(segments);
    setSegmentIndex(0);
  }, [screen, node, dayIndex, hope, fracture, playerName]);

  // ── เมื่อ segment เปลี่ยน -> เริ่มพิมพ์ข้อความ segment นั้น ──
  useEffect(() => {
    if (screen === 'opening_dialog') return;
    if (!currentSegmentText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    startTyping(currentSegmentText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, currentSegmentText]);

  function startDialogTyping(text: string) {
    if (dialogTimerRef.current) clearInterval(dialogTimerRef.current);
    setDialogDisplayedText('');
    setDialogIsTyping(true);
    let i = 0;
    dialogTimerRef.current = setInterval(() => {
      i++;
      setDialogDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(dialogTimerRef.current!);
        dialogTimerRef.current = null;
        setDialogIsTyping(false);
      }
    }, 40);
  }

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
    if (dialogIsTyping) {
      // คลิกครั้งแรกระหว่างพิมพ์ -> แสดงข้อความให้ครบทันที เท่านั้น (ไม่ไปต่อ)
      if (dialogTimerRef.current) {
        clearInterval(dialogTimerRef.current);
        dialogTimerRef.current = null;
      }
      setDialogDisplayedText(DIALOGS[step]);
      setDialogIsTyping(false);
      return;
    }
    // คลิกครั้งถัดไป (พิมพ์ครบแล้ว) -> ไปประโยคถัดไป
    const next = step + 1;
    if (next < DIALOGS.length) {
      setStep(next);
    } else {
      goToDayStart(0);
    }
  }

  /**
   * ตัวจัดการเดียวสำหรับ "กดถัดไป" ระหว่างเดินเรื่อง (แทนที่ของเดิมที่มี
   * ทั้ง proceedStory และ StoryBox.handleClick เช็คเงื่อนไขซ้ำกันสองจุด)
   *
   * - พิมพ์ไม่ครบ -> โชว์ข้อความให้ครบ แล้วหยุด (คลิกเดียวทำแค่นี้)
   * - พิมพ์ครบ + ยังมี segment ถัดไป -> ไป segment ถัดไป แล้วหยุด
   * - พิมพ์ครบ + อยู่ segment สุดท้ายแล้ว -> เรียก nextNode() เพื่อไปฉากถัดไป
   */
  function handleStoryAdvance(nextNode: () => void) {
    if (isTyping) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setDisplayedText(currentSegmentText);
      setIsTyping(false);
      return;
    }

    if (segmentIndex < storySegments.length - 1) {
      setSegmentIndex((index) => index + 1);
      return;
    }

    nextNode();
  }

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

  // ── ทางเลือกที่ 1 ──
  function handleChoice1OptA() {
    setNode('choice1_optA');
  }

  function handleChoice1OptAContinue() {
    setFracture(f => f + 1);
    setNode('converge');
  }

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

  // ── ทางเลือกที่ 2 ──
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

  function handleChoice1OptBFinish() {
    const cfg = dayConfig.choice1;
    if (cfg.hasConfirm) return;
    if (cfg.optBMiniGame === 'none') {
      setHope(h => h + 1);
      setNode('converge');
    } else {
      launchMiniGame(cfg.optBMiniGame, 'choice1');
    }
  }

  function handleChoice2OptBFinish() {
    if (dayConfig.choice2.optBMiniGame === 'none') {
      setHope(h => h + 1);
      setNode('preEnding');
    } else {
      launchMiniGame(dayConfig.choice2.optBMiniGame, 'choice2');
    }
  }

  // ── จบวัน / จบเกม ──
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

  function t(suffix: string) {
    return `day${dayIndex}_${suffix}`;
  }
  void t; // เก็บไว้เผื่อใช้ debug/logging ต่อ ไม่ได้ใช้แสดงผลโดยตรงแล้ว (ใช้ currentSegmentText แทน)

  // ── Mini-game overlay ──
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
  //  SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">
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
        <Box label="ข้อความ" hope={hope} fracture={fracture} fadeUp={false}>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {dialogDisplayedText}
            <span className="inline-block w-[2px] h-[1.1em] bg-blue-400 align-middle ml-0.5 animate-blink" />
          </p>
          <div className="mt-3 text-right">
            <NextButton
              onClick={handleDialogNext}
              label={step === DIALOGS.length - 1 && !dialogIsTyping ? NEXT_LABELS.dialogStart : NEXT_LABELS.dialog}
            />
          </div>
        </Box>
      )}

      {screen === 'story' && (
        <>
          {node === 'intro' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              label={dayConfig.dayLabel}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              fadeUp={true}
              onAdvance={() => handleStoryAdvance(handleIntroNext)}
            />
          )}

          {node === 'introMiniGame' && dayConfig.introMiniGame && (
            <MiniGameGate
              label={dayConfig.dayLabel}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onPlay={() => launchMiniGame(dayConfig.introMiniGame!, 'intro')}
            />
          )}

          {node === 'afterIntro' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(() => setNode('choice1'))}
            />
          )}

          {node === 'atSchool' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(() => setNode('choice1'))}
            />
          )}

          {node === 'choice1' && (
            <ChoiceBox
              label={`ทางเลือก – ${dayConfig.dayLabel}`}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              choices={[
                { label: 'ทางเลือกที่ 1', color: 'green',  onClick: handleChoice1OptA },
                { label: 'ทางเลือกที่ 2', color: 'purple', onClick: handleChoice1OptB },
              ]}
            />
          )}

          {node === 'choice1_optA' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(handleChoice1OptAContinue)}
            />
          )}

          {node === 'choice1_optB' && !dayConfig.choice1.hasConfirm && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(handleChoice1OptBFinish)}
            />
          )}

          {node === 'choice1_confirm' && (
            <ChoiceBox
              label="มั่นใจกับทางเลือกไหม"
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              choices={[
                { label: 'มั่นใจ',    color: 'green', onClick: handleConfirmYes },
                { label: 'ไม่มั่นใจ', color: 'red',   onClick: handleConfirmNo },
              ]}
            />
          )}

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

          {node === 'converge' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(() => setNode('choice2'))}
            />
          )}

          {node === 'choice2' && (
            <ChoiceBox
              label={`ทางเลือก – ${dayConfig.dayLabel}`}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              choices={[
                { label: 'ทางเลือก A', color: 'green',  onClick: handleChoice2OptA },
                { label: 'ทางเลือก B', color: 'purple', onClick: handleChoice2OptB },
              ]}
            />
          )}

          {node === 'choice2_optA' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(handleChoice2OptAContinue)}
            />
          )}

          {node === 'choice2_optB' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(handleChoice2OptBFinish)}
            />
          )}

          {node === 'preEnding' && (
            <StoryBox
              isTyping={isTyping}
              displayedText={displayedText}
              label="ก่อนจบวัน"
              hope={hope}
              fracture={fracture}
              showScore={showScoreCounter}
              onAdvance={() => handleStoryAdvance(() => setNode('dayEnd'))}
            />
          )}

          {node === 'dayEnd' && (
            <Box label={dayConfig.dayLabel} showScore={showScoreCounter} hope={hope} fracture={fracture}>
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

      {/* ── คำบรรยายจบเกม ── */}
      {screen === 'final_narration' && (
        <StoryBox
          isTyping={isTyping}
          displayedText={displayedText}
          label="จบเกม"
          hope={hope}
          fracture={fracture}
          nextLabel={NEXT_LABELS.final}
          onAdvance={() => handleStoryAdvance(() => setScreen('recap'))}
        />
      )}

      {/* ── สรุปผล ── */}
      {screen === 'recap' && (
        <Box label="สรุปผล" hope={hope} fracture={fracture}>
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