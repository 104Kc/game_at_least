'use client';

import { useEffect, useRef, useState, useMemo, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import MiniGames2 from '../Mini_games_2/Mini_games_2';
import MiniGames3 from '../Mini_games_3/Mini_games_3';
import MiniGames4 from '../Mini_games_4/Mini_games_4';
import MiniGames5 from '../Mini_games_5/Mini_games_5';
import AudioSettingsButton from '../components/AudioSettingsButton';

// ─────────────────────────────────────────────
//  โครงสร้างนี้สร้างตาม "ข้อมูลการทำงานของเส้นทางเนื้อเรื่อง.drawio"
//  เกมแบ่งเป็น 3 วัน วันละ 2 ทางเลือก (choice1 / choice2)
//
//  วันที่ 1:
//    - choice1: มีขั้น "มั่นใจกับทางเลือกไหม" และเป็นจุดตั้งชื่อผู้เล่น
//    - choice2: optB → มินิเกม (Mini_games_2) → Hope +1
//
//  วันที่ 2:
//    - choice1: optB → มินิเกม (Mini_games_4) → Hope +1
//    - choice2: optB → มินิเกม (Mini_games_5) → Hope +1
//
//  วันที่ 3:
//    - choice1: optB → เนื้อเรื่อง → Hope +1 (ไม่มีมินิเกม)
//    - choice2: optB → เนื้อเรื่อง → Hope +1 (ไม่มีมินิเกม)
//
//  ทางเลือก A ทุกจุด → Fracture +1 (ไปต่อทันที ไม่มี story node)
//  ทางเลือก B ทุกจุด → Hope +1 (วันที่ 1–2 ผ่านมินิเกม, วันที่ 3 ตรง)
//  จบวันที่ 3 → เปรียบ Hope กับ Fracture → Good / Bad Ending
// ─────────────────────────────────────────────

// ── คำบรรยายเปิดเกม (typewriter) ───────────────────────────────────────────
const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาเริ่มการผจญภัยกันเลย',
];

// ── เนื้อเรื่องทั้งหมด (แก้ไขข้อความตรงนี้ได้เลย) ───────────────────────────
// หมายเหตุ: ไม่มี *_optA_story เพราะทางเลือก A กระโดดไปรับ Fracture โดยตรง
const TEXT: Record<string, string> = {
  // ── วันที่ 1 ──────────────────────────────────────────────────────────
  day0_intro:              '[ เนื้อเรื่องเปิดเรื่องวันที่ 1 ]',
  day0_after_intro:        '[ เนื้อเรื่องหลังจบมินิเกมแรก ]',
  day0_choice1_optB_story: '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 1) ]',
  day0_converge_story:     '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 1) ]',
  day0_choice2_optB_story: '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 1) ]',
  day0_pre_ending:         '[ เนื้อเรื่องก่อนจบวันที่ 1 ]',

  // ── วันที่ 2 ──────────────────────────────────────────────────────────
  day1_choice1_optB_story: '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 2) ]',
  day1_converge_story:     '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 2) ]',
  day1_choice2_optB_story: '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 2) ]',
  day1_pre_ending:         '[ เนื้อเรื่องก่อนจบวันที่ 2 ]',

  // ── วันที่ 3 ──────────────────────────────────────────────────────────
  day2_choice1_optB_story: '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 3) ]',
  day2_converge_story:     '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 3) ]',
  day2_choice2_optB_story: '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 3) ]',
  day2_pre_ending:         '[ เนื้อเรื่องก่อนจบวันที่ 3 ]',

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
  hasIntro: boolean;
  introMiniGame?: MiniGameKey;
  choice1: Choice1Config;
  choice2: { optBMiniGame: MiniGameKey | 'none' };
};

// ─────────────────────────────────────────────
//  DAY CONFIGS
// ─────────────────────────────────────────────
const DAY_CONFIGS: DayConfig[] = [
  {
    dayLabel: 'วันที่ 1',
    hasIntro: true,
    introMiniGame: 'Mini_games_3',
    choice1: { hasConfirm: true },
    choice2: { optBMiniGame: 'Mini_games_2' },
  },
  {
    dayLabel: 'วันที่ 2',
    hasIntro: false,
    choice1: { hasConfirm: false, optBMiniGame: 'Mini_games_4' },
    choice2: { optBMiniGame: 'Mini_games_5' },
  },
  {
    dayLabel: 'วันที่ 3',
    hasIntro: false,
    // ตาม drawio: optB ทั้งสองช่วงไม่มีมินิเกม → Hope +1 ตรงๆ
    choice1: { hasConfirm: false, optBMiniGame: 'none' },
    choice2: { optBMiniGame: 'none' },
  },
];

// ── ข้อความบนปุ่ม "ถัดไป" ของแต่ละ node ──────────────────────────────────
// แก้ไขข้อความบนปุ่มถัดไปได้ที่นี่ (key = "day{index}_{suffix}" เหมือน TEXT
// หรือใช้ key พิเศษสำหรับหน้าที่ไม่ผูกกับวัน เช่น 'dialog', 'dayEnd', 'final')
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

// หมายเหตุ: ลบ 'choice1_optA' | 'choice1_miniGame' | 'choice2_optA' | 'choice2_miniGame'
// ออกจาก StoryNode เพราะไม่มี setNode() เรียกใช้ค่าเหล่านี้เลย
type StoryNode =
  | 'intro'
  | 'introMiniGame'
  | 'afterIntro'
  | 'choice1'
  | 'choice1_optB'
  | 'choice1_confirm'
  | 'choice1_name'
  | 'converge'
  | 'choice2'
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

  function goToDayStart(idx: number) {
    setDayIndex(idx);
    setScreen('story');
    setNode(DAY_CONFIGS[idx].hasIntro ? 'intro' : 'choice1');
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
  // optA: Fracture +1 → converge (ตรงทันที ไม่มี story node)
  function handleChoice1OptA() {
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

  function handleConfirmNo() {
    setFracture(f => f + 1);
    setNode('converge');
  }

  function handleConfirmName() {
    const name = inputName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    setPlayerName(name);
    setHope(h => h + 1);
    setNode('converge');
  }

  // ── ทางเลือกที่ 2 ─────────────────────────────────────────────────────────
  // optA: Fracture +1 → preEnding (ตรงทันที ไม่มี story node)
  function handleChoice2OptA() {
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

  // ปุ่ม "ถัดไป" กลาง ที่รับประกันว่ามองเห็นได้เสมอ ไม่ว่าคลาส btn-primary
  // จากไฟล์ CSS ภายนอกจะโหลดมาหรือไม่ก็ตาม (มีสี/ขอบ/เงาในตัวเอง)
  // และแก้ข้อความบนปุ่มได้ผ่าน prop `label`
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

  // เพิ่ม prop `nextLabel` เพื่อแก้ข้อความบนปุ่มถัดไปของแต่ละหน้าเนื้อเรื่องได้
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

  // เพิ่ม prop `playLabel` เพื่อแก้ข้อความบนปุ่มเล่นมินิเกมได้เช่นกัน
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
      <Stars />

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
          {/* ── เปิดวัน ── */}
          {node === 'intro' && (
            <StoryBox textKey={t('intro')} label={dayConfig.dayLabel} next={() => setNode('introMiniGame')} />
          )}

          {node === 'introMiniGame' && dayConfig.introMiniGame && (
            <MiniGameGate
              label={dayConfig.dayLabel}
              onPlay={() => launchMiniGame(dayConfig.introMiniGame!, 'intro')}
            />
          )}

          {node === 'afterIntro' && (
            <StoryBox textKey={t('after_intro')} next={() => setNode('choice1')} />
          )}

          {/* ── ทางเลือกที่ 1 ── */}
          {node === 'choice1' && (
            <ChoiceBox label={`ทางเลือก – ${dayConfig.dayLabel}`} choices={[
              { label: 'ทางเลือกที่ 1', color: 'green',  onClick: handleChoice1OptA },
              { label: 'ทางเลือกที่ 2', color: 'purple', onClick: handleChoice1OptB },
            ]} />
          )}

          {/*
            choice1_optB:
            - วันที่ 1: ไม่ถึง node นี้ (ข้ามไป choice1_confirm แทน)
            - วันที่ 2: แสดงเนื้อเรื่อง → เปิดมินิเกม → Hope +1
            - วันที่ 3: แสดงเนื้อเรื่อง → Hope +1 ตรงๆ
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

          {/*
            choice2_optB:
            - วันที่ 1: แสดงเนื้อเรื่อง → เปิดมินิเกม (Mini_games_2) → Hope +1
            - วันที่ 2: แสดงเนื้อเรื่อง → เปิดมินิเกม (Mini_games_5) → Hope +1
            - วันที่ 3: แสดงเนื้อเรื่อง → Hope +1 ตรงๆ
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

      {/* ── คำบรรยายจบเกม ── */}
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

      {/* ── สรุปผล ── */}
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

/* ── Stars ── */
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