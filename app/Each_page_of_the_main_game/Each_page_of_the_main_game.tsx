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
//  - choice1 (เฉพาะวันที่ 1) มีขั้น "มั่นใจกับทางเลือกไหม" และเป็นจุดตั้งชื่อผู้เล่น
//  - ทางเลือก A ของทุกจุด  -> ได้รับ Fracture +1
//  - ทางเลือก B ของทุกจุด  -> ต้องเล่นมินิเกมก่อน แล้วได้รับ Hope +1
//  - จบวันที่ 3 แล้วนำ Hope กับ Fracture มาเทียบกัน เพื่อตัดสิน Good / Bad Ending
// ─────────────────────────────────────────────

// ── คำบรรยายเปิดเกม (typewriter) ───────────────────────────────────────────
const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาเริ่มการผจญภัยกันเลย',
];

// ── เนื้อเรื่องทั้งหมด (แก้ไขข้อความตรงนี้ได้เลย) ───────────────────────────
const TEXT: Record<string, string> = {
  // ── วันที่ 1 ──────────────────────────────────────────────────────────
  day0_intro:                 '[ เนื้อเรื่องเปิดเรื่องวันที่ 1 ]',
  day0_after_intro:           '[ เนื้อเรื่องหลังจบมินิเกมแรก ]',
  day0_choice1_optA_story:    '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 1) ]',
  day0_choice1_optB_story:    '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 1) ]',
  day0_converge_story:        '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 1) ]',
  day0_choice2_optA_story:    '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 1) ]',
  day0_choice2_optB_story:    '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 1) ]',
  day0_pre_ending:            '[ เนื้อเรื่องก่อนจบวันที่ 1 ]',

  // ── วันที่ 2 ──────────────────────────────────────────────────────────
  day1_choice1_optA_story:    '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 2) ]',
  day1_choice1_optB_story:    '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 2) ]',
  day1_converge_story:        '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 2) ]',
  day1_choice2_optA_story:    '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 2) ]',
  day1_choice2_optB_story:    '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 2) ]',
  day1_pre_ending:            '[ เนื้อเรื่องก่อนจบวันที่ 2 ]',

  // ── วันที่ 3 ──────────────────────────────────────────────────────────
  day2_choice1_optA_story:    '[ เนื้อเรื่องทางเลือกที่ 1 (วันที่ 3) ]',
  day2_choice1_optB_story:    '[ เนื้อเรื่องทางเลือกที่ 2 (วันที่ 3) ]',
  day2_converge_story:        '[ เนื้อเรื่องที่มาบรรจบกัน (วันที่ 3) ]',
  day2_choice2_optA_story:    '[ เนื้อเรื่องทางเลือก A รอบสอง (วันที่ 3) ]',
  day2_choice2_optB_story:    '[ เนื้อเรื่องทางเลือก B รอบสอง (วันที่ 3) ]',
  day2_pre_ending:            '[ เนื้อเรื่องก่อนจบวันที่ 3 ]',

  // ── จบเกม ────────────────────────────────────────────────────────────
  final_good:                  '[ คำบรรยายจบเกมแบบ Good Ending 🎉 ]',
  final_bad:                   '[ คำบรรยายจบเกมแบบ Bad Ending ]',
};

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
const MINI_GAMES = ['Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

type Choice1Config =
  | { hasConfirm: true }
  | { hasConfirm: false; optBMiniGame: MiniGameKey | 'random' };

type DayConfig = {
  dayLabel: string;
  hasIntro: boolean;
  introMiniGame?: MiniGameKey;
  choice1: Choice1Config;
  choice2: { optBMiniGame: MiniGameKey | 'random' };
};

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
    choice1: { hasConfirm: false, optBMiniGame: 'random' },
    choice2: { optBMiniGame: 'random' },
  },
];

type StoryNode =
  | 'intro'
  | 'introMiniGame'
  | 'afterIntro'
  | 'choice1'
  | 'choice1_optA'
  | 'choice1_optB'
  | 'choice1_confirm'
  | 'choice1_name'
  | 'choice1_miniGame'
  | 'converge'
  | 'choice2'
  | 'choice2_optA'
  | 'choice2_optB'
  | 'choice2_miniGame'
  | 'preEnding'
  | 'dayEnd';

// จุดที่กำลังเล่นมินิเกมอยู่ ใช้ตัดสินว่าจบมินิเกมแล้วต้องไปต่อจุดไหน + ได้ Hope จากจุดไหน
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

  // ── ค่าคะแนนของเรื่อง (แทนที่ระบบ score เดิม) ────────────────────────────
  const [hope, setHope] = useState(0);
  const [fracture, setFracture] = useState(0);

  // ── คำบรรยายเปิดเกม ──────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── ชื่อผู้เล่น (ตั้งชื่อกลางทางเลือกของวันที่ 1) ────────────────────────
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

  // ── Dialog typewriter (เปิดเกม) ────────────────────────────────────────────
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

  // ── helper: ไปเริ่มต้นวันที่ N ─────────────────────────────────────────────
  function goToDayStart(idx: number) {
    setDayIndex(idx);
    setScreen('story');
    setNode(DAY_CONFIGS[idx].hasIntro ? 'intro' : 'choice1');
  }

  // ── helper: เลือกมินิเกมแบบสุ่ม หรือมินิเกมตายตัว ──────────────────────────
  function resolveMiniGame(key: MiniGameKey | 'random'): MiniGameKey {
    if (key !== 'random') return key;
    return MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)];
  }

  function launchMiniGame(key: MiniGameKey | 'random', source: MiniGameSource) {
    setSelectedMiniGame(resolveMiniGame(key));
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

  // ── ทางเลือกที่ 1 (choice1) ───────────────────────────────────────────────
  function handleChoice1OptA() {
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
    // ไม่มั่นใจ -> ไปรับผลแบบทางเลือก A แทน
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

  // ── ทางเลือกที่ 2 (choice2) ───────────────────────────────────────────────
  function handleChoice2OptA() {
    setFracture(f => f + 1);
    setNode('preEnding');
  }

  function handleChoice2OptB() {
    setNode('choice2_optB');
  }

  // ── จบแต่ละวัน / จบเกม ───────────────────────────────────────────────────
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

        {/* ปุ่มตั้งค่าเสียง ระหว่างเล่นมินิเกม */}
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

  function StoryBox({ textKey, next, label = 'เนื้อเรื่อง' }: {
    textKey: string; next: () => void; label?: string;
  }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">{TEXT[textKey]}</p>
        <div className="mt-4 flex justify-end">
          <button onClick={next} className="btn-primary">ถัดไป ▶</button>
        </div>
      </Box>
    );
  }

  function MiniGameGate({ label, onPlay }: { label: string; onPlay: () => void }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
          ก่อนไปต่อ ลองเล่นมินิเกมกันก่อนสักหน่อย
        </p>
        <div className="mt-4 flex justify-end">
          <button onClick={onPlay} className="btn-primary">เล่นมินิเกม ▶</button>
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

  // ── ตัวช่วยดึง key ของ TEXT ตามวัน + node ────────────────────────────────
  function t(suffix: string) {
    return `day${dayIndex}_${suffix}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">
      <Stars />

      {/* ปุ่มตั้งค่าเสียง ลอยอยู่มุมขวาบนตลอดเวลา */}
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
            <button onClick={handleDialogNext} className="btn-primary">
              {step === DIALOGS.length - 1 && !isTyping ? 'เริ่มผจญภัย ▶' : 'ถัดไป ▶'}
            </button>
          </div>
        </Box>
      )}

      {screen === 'story' && (
        <>
          {/* ── เนื้อเรื่องเปิดวัน (เฉพาะวันที่มี hasIntro) ── */}
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
              { label: 'ทางเลือกที่ 1', color: 'green', onClick: handleChoice1OptA },
              { label: 'ทางเลือกที่ 2', color: 'purple', onClick: handleChoice1OptB },
            ]} />
          )}

          {node === 'choice1_optA' && (
            <StoryBox textKey={t('choice1_optA_story')} next={handleChoice1OptA} />
          )}

          {node === 'choice1_optB' && !dayConfig.choice1.hasConfirm && (
            <StoryBox
              textKey={t('choice1_optB_story')}
              next={() => {
                const cfg = dayConfig.choice1;
                if (!cfg.hasConfirm) launchMiniGame(cfg.optBMiniGame, 'choice1');
              }}
            />
          )}

          {node === 'choice1_confirm' && (
            <ChoiceBox label="มั่นใจกับทางเลือกไหม" choices={[
              { label: 'มั่นใจ', color: 'green', onClick: handleConfirmYes },
              { label: 'ไม่มั่นใจ', color: 'red', onClick: handleConfirmNo },
            ]} />
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
                <button onClick={handleConfirmName} className="bg-blue-900 hover:bg-blue-700 border border-blue-500 text-yellow-300 font-medium px-6 py-2.5 rounded-lg text-base whitespace-nowrap transition-colors">
                  ยืนยัน ✓
                </button>
              </div>
            </div>
          )}

          {/* ── เนื้อเรื่องที่มาบรรจบกัน ── */}
          {node === 'converge' && (
            <StoryBox textKey={t('converge_story')} next={() => setNode('choice2')} />
          )}

          {/* ── ทางเลือกที่ 2 ── */}
          {node === 'choice2' && (
            <ChoiceBox label={`ทางเลือก – ${dayConfig.dayLabel}`} choices={[
              { label: 'ทางเลือก A', color: 'green', onClick: handleChoice2OptA },
              { label: 'ทางเลือก B', color: 'purple', onClick: handleChoice2OptB },
            ]} />
          )}

          {node === 'choice2_optA' && (
            <StoryBox textKey={t('choice2_optA_story')} next={handleChoice2OptA} />
          )}

          {node === 'choice2_optB' && (
            <StoryBox
              textKey={t('choice2_optB_story')}
              next={() => launchMiniGame(dayConfig.choice2.optBMiniGame, 'choice2')}
            />
          )}

          {/* ── เนื้อเรื่องก่อนจบวัน ── */}
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
                <button onClick={handleDayEndNext} className="btn-primary">
                  {dayIndex < DAY_CONFIGS.length - 1 ? 'ไปวันถัดไป ▶' : 'สรุปผล ▶'}
                </button>
              </div>
            </Box>
          )}
        </>
      )}

      {/* ── คำบรรยายจบเกม (ตัดสินจาก Hope vs Fracture) ── */}
      {screen === 'final_narration' && (
        <Box label="จบเกม" showScore>
          <p className="text-[17px] leading-relaxed text-slate-100">
            {TEXT[hope > fracture ? 'final_good' : 'final_bad']}
          </p>
          <div className="mt-4 text-right">
            <button onClick={() => setScreen('recap')} className="btn-primary">ถัดไป ▶</button>
          </div>
        </Box>
      )}

      {/* ── สรุปการกระทำของผู้เล่นตลอดทั้งเกม ── */}
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
            <button onClick={handleRestart} className="btn-secondary">เริ่มเกมใหม่ ↺</button>
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