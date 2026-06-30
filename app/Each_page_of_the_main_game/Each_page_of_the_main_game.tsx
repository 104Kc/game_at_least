'use client';

import { useEffect, useRef, useState, useMemo, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import MiniGames2 from '../Mini_games_2/Mini_games_2';
import MiniGames3 from '../Mini_games_3/Mini_games_3';
import MiniGames4 from '../Mini_games_4/Mini_games_4';
import MiniGames5 from '../Mini_games_5/Mini_games_5';

// ─────────────────────────────────────────────
//  TEXT CONTENT  (แก้ตรงนี้ทีหลัง)
// ─────────────────────────────────────────────
const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาตั้งชื่อตัวละครของคุณกัน',
];

const TEXT: Record<string, string> = {
  // ── ช่วงต้น ──────────────────────────────────────────────────────────────
  intro_story:              '[ เนื้อเรื่องเปิดเรื่อง ]',

  // ── ทางเลือก 1 (forest) ──────────────────────────────────────────────────
  ch1_story_a:              '[ เนื้อเรื่องทางเลือกที่ 1 – ส่วนที่ 1 ]',
  ch1_story_b:              '[ เนื้อเรื่องทางเลือกที่ 1 – ส่วนที่ 2 ]',

  // ── ทางเลือก 2 (mountain) ────────────────────────────────────────────────
  ch2_story_a:              '[ เนื้อเรื่องทางเลือกที่ 2 – ส่วนที่ 1 ]',
  ch2_story_b:              '[ เนื้อเรื่องทางเลือกที่ 2 – ส่วนที่ 2 ]',

  // ── ทางเลือก 1.1 (forest → A) ───────────────────────────────────────────
  ch1_1_story:              '[ เนื้อเรื่องทางเลือกที่ 1.1 ]',
  ch1_1_story_b:            '[ เนื้อเรื่องทางเลือกที่ 1.1 – ส่วนที่ 2 ]',

  // ── ทางเลือก 2.1 (forest → B / mountain → A) ────────────────────────────
  shared_1_story:           '[ เนื้อเรื่องรวม (1.1 + 2.1) ]',
  shared_1_story_b:         '[ เนื้อเรื่องรวม – ส่วนที่ 2 ]',

  // ── ทางเลือก 2.1 (mountain → B) ─────────────────────────────────────────
  ch2_1_story:              '[ เนื้อเรื่องทางเลือกที่ 2.1 ]',
  ch2_1_story_b:            '[ เนื้อเรื่องทางเลือกที่ 2.1 – ส่วนที่ 2 ]',

  // ── เนื้อเรื่องรวม (หลังทางเลือก 1.2 / 0 / 2.2) ──────────────────────
  shared_2_story:           '[ เนื้อเรื่องรวมสาย 1 (1.2 / ทางเลือก 0) ]',
  shared_3_story:           '[ เนื้อเรื่องรวมสาย 2 (2.2 / ทางเลือก 0) ]',

  // ── เนื้อเรื่องก่อนจบ ────────────────────────────────────────────────────
  pre_ending_story:         '[ เนื้อเรื่องก่อนจบเกม ]',
  reflect_1:                '[ คุณคิดไตร่ตรองกับการเลือกของคุณ – สาย 1 ]',
  reflect_2:                '[ คุณคิดไตร่ตรองกับการเลือกของคุณ – สาย 2 ]',

  // ── จบ ───────────────────────────────────────────────────────────────────
  good_ending:              '[ จบเกมแบบดี 🎉 ]',
  bad_ending:               '[ คุณยอมแพ้... ]',
};

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
const MINI_GAMES = ['Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

type Screen =
  | 'dialog'
  | 'name'
  | 'greeting'
  // ── intro ──
  | 'intro_story'
  // ── first branch ──
  | 'first_choice'
  | 'ch1_story_a' | 'ch1_story_b'
  | 'ch2_story_a' | 'ch2_story_b'
  // ── second branch (from ch1) ──
  | 'second_choice_ch1'
  | 'ch1_1_story' | 'ch1_1_story_b'
  | 'shared_1_story' | 'shared_1_story_b'
  // ── second branch (from ch2) ──
  | 'second_choice_ch2'
  | 'ch2_1_story' | 'ch2_1_story_b'
  // ── third branch ──
  | 'third_choice_1' | 'third_choice_2' | 'third_choice_0'
  | 'shared_2_story' | 'shared_3_story'
  // ── fourth branch ──
  | 'fourth_choice_1' | 'fourth_choice_2'
  | 'reflect_1' | 'reflect_2'
  // ── endings ──
  | 'pre_ending_story'
  | 'final_choice_1' | 'final_choice_2'
  | 'good_ending' | 'bad_ending';

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function MainGamePage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('dialog');
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [selectedMiniGame, setSelectedMiniGame] = useState<MiniGameKey | null>(null);
  const [score, setScore] = useState(0);
  const [miniGameReturnScreen, setMiniGameReturnScreen] = useState<Screen>('first_choice');
  const [lastScreenPlayedMiniGame, setLastScreenPlayedMiniGame] = useState<Screen | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // จำหน้าก่อนเข้ามินิเกม เพื่อกลับมาถูกหน้าเสมอ
  const previousScreenRef = useRef<Screen>('first_choice');

  const miniGameComponents = useMemo<Record<MiniGameKey, ComponentType>>(() => ({
    Mini_games_2: MiniGames2,
    Mini_games_3: MiniGames3,
    Mini_games_4: MiniGames4,
    Mini_games_5: MiniGames5,
  }), []);

  // แสดงตัวนับคะแนน: หลังตั้งชื่อ (greeting เป็นต้นไป) จนถึงก่อนหน้าจบเกม
  const showScoreCounter = !['dialog', 'name', 'good_ending', 'bad_ending'].includes(screen);

  // ── Dialog typewriter ─────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'dialog') return;
    startTyping(DIALOGS[step]);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, screen]);

  // ── Focus name input ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'name') {
      inputRef.current?.focus();
    }
  }, [screen]);

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

  // ── Dialog handler ────────────────────────────────────────────────────────
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
      setScreen('name');
    }
  }

  // ── Name handler ──────────────────────────────────────────────────────────
  function handleConfirm() {
    const name = inputName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    setPlayerName(name);
    setScreen('greeting');
  }

  // ── Mini-game helpers ─────────────────────────────────────────────────────
  function launchRandomMiniGame() {
    // บันทึกหน้าปัจจุบันก่อนเข้ามินิเกมให้กลับมาในหน้าทางเลือกเดิม
    const targetScreen = screen;
    previousScreenRef.current = targetScreen;
    setMiniGameReturnScreen(targetScreen);
    const i = Math.floor(Math.random() * MINI_GAMES.length);
    setSelectedMiniGame(MINI_GAMES[i]);
  }

  function handleReturnFromMiniGame() {
    setSelectedMiniGame(null);
    setScore(prev => prev + 5);
    setLastScreenPlayedMiniGame(miniGameReturnScreen);
    // คืนกลับหน้าทางเลือกที่อยู่ก่อนเข้ามินิเกมโดยตรง
    setScreen(miniGameReturnScreen || previousScreenRef.current);
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
        <SelectedGame />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  UI helpers
  // ─────────────────────────────────────────────────────────────────────────
  function Box({ label, children, showScore }: { label?: string; children: React.ReactNode; showScore?: boolean }) {
    return (
      <div className={`relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 ${screen !== 'name' ? 'animate-fadeUp' : ''}`}>
        {showScore && (
          <div className="absolute top-3 right-5 flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 px-3 py-1">
            <span className="text-yellow-300 text-xs">⭐</span>
            <span className="text-yellow-300 text-sm font-semibold">{score}</span>
          </div>
        )}
        {label && <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">{label}</p>}
        {children}
      </div>
    );
  }

  function StoryBox({ textKey, next, label = 'เนื้อเรื่อง', backTo }: {
    textKey: string; next: () => void; label?: string; backTo?: () => void;
  }) {
    return (
      <Box label={label} showScore={showScoreCounter}>
        <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">{TEXT[textKey]}</p>
        <div className="mt-4 flex justify-between gap-3">
          {backTo && (
            <button onClick={backTo} className="btn-secondary">◀ กลับ</button>
          )}
          <button onClick={next} className="btn-primary ml-auto">ถัดไป ▶</button>
        </div>
      </Box>
    );
  }

  // mini-game choice entry — แสดงเฉพาะเมื่อยังไม่ได้เล่นที่หน้านี้
  const miniGameChoice = lastScreenPlayedMiniGame === screen ? null : {
    label: 'มินิเกมแก้เบื่อ (ไม่เกี่ยวกับเนื้อเรื่องหลัก)',
    color: 'yellow' as const,
    onClick: launchRandomMiniGame,
  };

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

  // ─────────────────────────────────────────────────────────────────────────
  //  SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">
      <Stars />

      {/* ── ① คำบรรยาย ── */}
      {screen === 'dialog' && (
        <Box label="ข้อความ">
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {displayedText}
            <span className="inline-block w-[2px] h-[1.1em] bg-blue-400 align-middle ml-0.5 animate-blink" />
          </p>
          <div className="mt-3 text-right">
            <button onClick={handleDialogNext} className="btn-primary">
              {step === DIALOGS.length - 1 && !isTyping ? 'เริ่มตั้งชื่อ ▶' : 'ถัดไป ▶'}
            </button>
          </div>
        </Box>
      )}

      {/* ── ② ตั้งชื่อ ── */}
      {screen === 'name' && (
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
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              placeholder="ชื่อตัวละคร..."
              autoFocus
              className="flex-1 bg-white/5 border border-blue-600 focus:border-blue-400 rounded-lg text-slate-100 text-base px-4 py-2.5 outline-none placeholder-blue-900 transition-colors"
            />
            <button onClick={handleConfirm} className="bg-blue-900 hover:bg-blue-700 border border-blue-500 text-yellow-300 font-medium px-6 py-2.5 rounded-lg text-base whitespace-nowrap transition-colors">
              ยืนยัน ✓
            </button>
          </div>
        </div>
      )}

      {/* ── ③ ทักทาย ── */}
      {screen === 'greeting' && (
        <Box showScore={showScoreCounter}>
          <p className="text-lg text-yellow-300">สวัสดี <span className="text-white font-semibold">{playerName}</span>!</p>
          <p className="text-sm text-blue-300 mt-2">ขอให้สนุกกับการผจญภัยนะครับ</p>
          <div className="mt-4 text-right">
            <button onClick={() => setScreen('intro_story')} className="btn-primary">ถัดไป ▶</button>
          </div>
        </Box>
      )}

      {/* ── ④ เนื้อเรื่องเปิดเรื่อง ── */}
      {screen === 'intro_story' && (
        <StoryBox textKey="intro_story" label="เรื่องราว" next={() => setScreen('first_choice')} />
      )}

      {/* ════════════════════════════════════
          ทางเลือกที่ 1 (first_choice)
          ════════════════════════════════════ */}
      {screen === 'first_choice' && (
        <ChoiceBox label="เลือกเส้นทาง" choices={[
          { label: 'ทางเลือกที่ 1', color: 'green', onClick: () => setScreen('ch1_story_a') },
          { label: 'ทางเลือกที่ 2', color: 'purple', onClick: () => setScreen('ch2_story_a') },
          ...(miniGameChoice ? [miniGameChoice] : []),
        ]} />
      )}

      {/* ─── สาย 1 ─── */}
      {screen === 'ch1_story_a' && (
        <StoryBox textKey="ch1_story_a" next={() => setScreen('ch1_story_b')}
          backTo={() => setScreen('first_choice')} />
      )}
      {screen === 'ch1_story_b' && (
        <StoryBox textKey="ch1_story_b" next={() => setScreen('second_choice_ch1')} />
      )}

      {/* ─── สาย 2 ─── */}
      {screen === 'ch2_story_a' && (
        <StoryBox textKey="ch2_story_a" next={() => setScreen('ch2_story_b')}
          backTo={() => setScreen('first_choice')} />
      )}
      {screen === 'ch2_story_b' && (
        <StoryBox textKey="ch2_story_b" next={() => setScreen('second_choice_ch2')} />
      )}

      {/* ════════════════════════════════════
          ทางเลือกที่ 1.1  (จากสาย 1)
          ════════════════════════════════════ */}
      {screen === 'second_choice_ch1' && (
        <ChoiceBox label="ทางเลือก 1.1" choices={[
          { label: 'ทางเลือก 1.1 – A', color: 'green', onClick: () => setScreen('ch1_1_story') },
          { label: 'ทางเลือก 1.1 – B (รวมกับ 2.1)', color: 'yellow', onClick: () => setScreen('shared_1_story') },
          ...(miniGameChoice ? [miniGameChoice] : []),
        ]} />
      )}

      {/* ─── สาย 1.1 A ─── */}
      {screen === 'ch1_1_story' && (
        <StoryBox textKey="ch1_1_story" next={() => setScreen('ch1_1_story_b')} />
      )}
      {screen === 'ch1_1_story_b' && (
        <StoryBox textKey="ch1_1_story_b" next={() => setScreen('third_choice_1')} />
      )}

      {/* ─── สาย รวม 1.1+2.1 ─── */}
      {screen === 'shared_1_story' && (
        <StoryBox textKey="shared_1_story" next={() => setScreen('shared_1_story_b')} />
      )}
      {screen === 'shared_1_story_b' && (
        <StoryBox textKey="shared_1_story_b" next={() => setScreen('third_choice_0')} />
      )}

      {/* ════════════════════════════════════
          ทางเลือกที่ 2.1  (จากสาย 2)
          ════════════════════════════════════ */}
      {screen === 'second_choice_ch2' && (
        <ChoiceBox label="ทางเลือก 2.1" choices={[
          { label: 'ทางเลือก 2.1 – A (รวมกับ 1.1)', color: 'yellow', onClick: () => setScreen('shared_1_story') },
          { label: 'ทางเลือก 2.1 – B', color: 'purple', onClick: () => setScreen('ch2_1_story') },
          ...(miniGameChoice ? [miniGameChoice] : []),
        ]} />
      )}

      {/* ─── สาย 2.1 B ─── */}
      {screen === 'ch2_1_story' && (
        <StoryBox textKey="ch2_1_story" next={() => setScreen('ch2_1_story_b')} />
      )}
      {screen === 'ch2_1_story_b' && (
        <StoryBox textKey="ch2_1_story_b" next={() => setScreen('third_choice_2')} />
      )}

      {/* ════════════════════════════════════
          ทางเลือก 1.2  (สาย 1.1 A)
          ════════════════════════════════════ */}
      {screen === 'third_choice_1' && (
        <ChoiceBox label="ทางเลือก 1.2" choices={[
          { label: 'ทางเลือก 1.2 – ดำเนินต่อ', color: 'green', onClick: () => setScreen('shared_2_story') },
          ...(miniGameChoice ? [miniGameChoice] : []),
          { label: 'ยอมแพ้', color: 'red', onClick: () => setScreen('bad_ending') },
        ]} />
      )}

      {/* ════════════════════════════════════
          ทางเลือก 0  (สายรวม)
          ════════════════════════════════════ */}
      {screen === 'third_choice_0' && (
        <ChoiceBox label="ทางเลือก 0" choices={[
          { label: 'ดำเนินต่อ – สาย A', color: 'green', onClick: () => setScreen('shared_2_story') },
          { label: 'ดำเนินต่อ – สาย B', color: 'purple', onClick: () => setScreen('shared_3_story') },
          ...(miniGameChoice ? [miniGameChoice] : []),
          { label: 'ยอมแพ้', color: 'red', onClick: () => setScreen('bad_ending') },
        ]} />
      )}

      {/* ════════════════════════════════════
          ทางเลือก 2.2  (สาย 2.1 B)
          ════════════════════════════════════ */}
      {screen === 'third_choice_2' && (
        <ChoiceBox label="ทางเลือก 2.2" choices={[
          { label: 'ทางเลือก 2.2 – ดำเนินต่อ', color: 'purple', onClick: () => setScreen('shared_3_story') },
          ...(miniGameChoice ? [miniGameChoice] : []),
          { label: 'ยอมแพ้', color: 'red', onClick: () => setScreen('bad_ending') },
        ]} />
      )}

      {/* ─── เนื้อเรื่องรวมก่อนสาย final ─── */}
      {screen === 'shared_2_story' && (
        <StoryBox textKey="shared_2_story" next={() => setScreen('fourth_choice_1')} />
      )}
      {screen === 'shared_3_story' && (
        <StoryBox textKey="shared_3_story" next={() => setScreen('fourth_choice_2')} />
      )}

      {/* ════════════════════════════════════
          ทางเลือกสุดท้าย  (final)
          ════════════════════════════════════ */}
      {screen === 'fourth_choice_1' && (
        <ChoiceBox label="ทางเลือกสุดท้าย" choices={[
          { label: 'ไปต่อ', color: 'green', onClick: () => setScreen('reflect_1') },
          { label: 'เลือกใหม่', color: 'yellow', onClick: () => setScreen('final_choice_1') },
          ...(miniGameChoice ? [miniGameChoice] : []),
          { label: 'ยอมแพ้', color: 'red', onClick: () => setScreen('bad_ending') },
        ]} />
      )}
      {screen === 'fourth_choice_2' && (
        <ChoiceBox label="ทางเลือกสุดท้าย" choices={[
          { label: 'ไปต่อ', color: 'purple', onClick: () => setScreen('reflect_2') },
          { label: 'เลือกใหม่', color: 'yellow', onClick: () => setScreen('final_choice_2') },
          ...(miniGameChoice ? [miniGameChoice] : []),
          { label: 'ยอมแพ้', color: 'red', onClick: () => setScreen('bad_ending') },
        ]} />
      )}

      {/* เลือกใหม่ → วนกลับไปทางเลือกสุดท้ายอีกครั้ง */}
      {screen === 'final_choice_1' && (
        <StoryBox textKey="reflect_1" label="คิดทบทวน" next={() => setScreen('fourth_choice_1')} />
      )}
      {screen === 'final_choice_2' && (
        <StoryBox textKey="reflect_2" label="คิดทบทวน" next={() => setScreen('fourth_choice_2')} />
      )}

      {/* ─── reflect → pre_ending ─── */}
      {screen === 'reflect_1' && (
        <StoryBox textKey="reflect_1" label="ไตร่ตรอง" next={() => setScreen('pre_ending_story')} />
      )}
      {screen === 'reflect_2' && (
        <StoryBox textKey="reflect_2" label="ไตร่ตรอง" next={() => setScreen('pre_ending_story')} />
      )}

      {/* ── เนื้อเรื่องก่อนจบ ── */}
      {screen === 'pre_ending_story' && (
        <StoryBox textKey="pre_ending_story" label="ก่อนจบเกม" next={() => setScreen('good_ending')} />
      )}

      {/* ── จบเกมแบบดี ── */}
      {screen === 'good_ending' && (
        <Box label="จบเกม">
          <p className="text-[17px] leading-relaxed text-slate-100">{TEXT['good_ending']}</p>
          <p className="text-sm text-blue-300 mt-3">ขอบคุณที่เล่นเกมนี้ 🌟</p>
          <div className="mt-4 text-right">
            <button onClick={() => {
              setScore(0);
              setLastScreenPlayedMiniGame(null);
              setInputName('');
              setStep(0);
              router.push('/');
            }} className="btn-secondary">
              เริ่มเกมใหม่ ↺
            </button>
          </div>
        </Box>
      )}

      {/* ── ยอมแพ้จบ ── */}
      {screen === 'bad_ending' && (
        <Box label="จบเกม">
          <p className="text-[17px] leading-relaxed text-slate-100">{TEXT['bad_ending']}</p>
          <div className="mt-4 text-right">
            <button onClick={() => {
              setScore(0);
              setLastScreenPlayedMiniGame(null);
              setInputName('');
              setStep(0);
              router.push('/');
            }} className="btn-secondary">
              เริ่มใหม่อีกครั้ง ↺
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