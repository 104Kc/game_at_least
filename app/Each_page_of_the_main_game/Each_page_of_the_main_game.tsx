'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import MiniGames1 from '../Mini_games_1/Mini_games_1';
import MiniGames2 from '../Mini_games_2/Mini_games_2';
import MiniGames3 from '../Mini_games_3/Mini_games_3';
import MiniGames4 from '../Mini_games_4/Mini_games_4';
import MiniGames5 from '../Mini_games_5/Mini_games_5';

const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาตั้งชื่อตัวละครของคุณกัน',
];

const STORY_TEXT = '........................เนื้อเรื่องของเกมจะอยู่ตรงนี้........................';
const STORY_PATH_TEXTS = {
  forest: '..................เนื้อเรื่องทางเลือกที่ 1  .....................',
  mountain: '...................เนื้อเรื่องทางเลือกที่ 2  ...................',
};
const STORY_PATH_CONTINUE_TEXTS = {
  forest: 'เนื้อเรืองต่อจากทางเลือก 1: ..................เนื้อเรื่องต่อจากทางเลือก 1 .....................',
  mountain: 'เนื้อเรืองต่อจากทางเลือก 2: ...................เนื้อเรื่องต่อจากทางเลือก 2 ...................',
};
const STORY_PATH_CONTINUE_2_TEXTS = {
  forest: 'เนื้อเรื่องส่วนที่ 2 ทางเลือก 1: .................เนื้อเรื่องชั้นที่ 2 ของทางเลือก 1..................',
  mountain: 'เนื้อเรื่องส่วนที่ 2 ทางเลือก 2: .................เนื้อเรื่องชั้นที่ 2 ของทางเลือก 2..................',
};
const SECOND_CHOICE_RESULT_TEXTS = {
  first: 'ผลลัพธ์ของทางเลือกที่ 1.1: ......................เนื้อเรื่องหลังทางเลือกที่ 1.1......................',
  second: 'ผลลัพธ์ของทางเลือกที่ 2.1: ......................เนื้อเรื่องหลังทางเลือกที่ 2.1......................',
};
const MINI_GAMES = ['Mini_games_1', 'Mini_games_2', 'Mini_games_3', 'Mini_games_4', 'Mini_games_5'] as const;
type MiniGameKey = (typeof MINI_GAMES)[number];

type Screen = 'dialog' | 'name' | 'done' | 'story' | 'choice' | 'story-path' | 'story-path-continue' | 'story-path-continue-2' | 'story-path-continue-choice' | 'story-path-continue-choice-result';

export default function MainGamePage() {
  const [screen, setScreen] = useState<Screen>('dialog');
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [selectedMiniGame, setSelectedMiniGame] = useState<MiniGameKey | null>(null);
  const [hasFinishedMiniGame, setHasFinishedMiniGame] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'forest' | 'mountain' | null>(null);
  const [secondChoice, setSecondChoice] = useState<'first' | 'second' | null>(null);

  const miniGameComponents: Record<MiniGameKey, ComponentType> = {
    Mini_games_1: MiniGames1,
    Mini_games_2: MiniGames2,
    Mini_games_3: MiniGames3,
    Mini_games_4: MiniGames4,
    Mini_games_5: MiniGames5,
  };

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // const router = useRouter(); // uncomment to navigate after name entry

  // Start typing when step changes
  useEffect(() => {
    if (screen !== 'dialog') return;
    startTyping(DIALOGS[step]);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, screen]);

  // Focus input when name screen appears
  useEffect(() => {
    if (screen === 'name') inputRef.current?.focus();
  }, [screen]);

  function startTyping(text: string) {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current!);
        setIsTyping(false);
      }
    }, 40);
  }

  function handleNext() {
    // If still typing, skip to full text
    if (isTyping) {
      clearInterval(timerRef.current!);
      setDisplayedText(DIALOGS[step]);
      setIsTyping(false);
      return;
    }
    const nextStep = step + 1;
    if (nextStep < DIALOGS.length) {
      setStep(nextStep);
    } else {
      setScreen('name');
    }
  }

  function handleConfirm() {
    const name = inputName.trim();
    if (!name) { inputRef.current?.focus(); return; }
    setPlayerName(name);
    setScreen('done');
    // router.push(`/game?name=${encodeURIComponent(name)}`); // navigate to game
  }

  function handleProceedToStory() {
    setScreen('story');
  }

  function handleProceedToChoice() {
    setScreen('choice');
  }

  function handleProceedToStoryPathContinue() {
    setScreen('story-path-continue');
  }

  function handleProceedToStoryPathContinue2() {
    setScreen('story-path-continue-2');
  }

  function handleProceedToStoryPathContinueChoice() {
    setScreen('story-path-continue-choice');
  }

  function handleChooseSecondPath(option: 'first' | 'second') {
    setSecondChoice(option);
    setScreen('story-path-continue-choice-result');
  }

  function getRandomMiniGame() {
    const randomIndex = Math.floor(Math.random() * MINI_GAMES.length);
    return MINI_GAMES[randomIndex];
  }

  function handleChoosePath(path: string) {
    if (path === 'minigame') {
      const game = getRandomMiniGame();
      setSelectedMiniGame(game);
    } else if (path === 'mini4') {
      setSelectedMiniGame('Mini_games_4');
    } else if (path === 'forest' || path === 'mountain') {
      setSelectedPath(path as 'forest' | 'mountain');
      setScreen('story-path');
    }
  }

  function handleReturnFromMiniGame() {
    setSelectedMiniGame(null);
    setHasFinishedMiniGame(true);
    setScreen('story');
  }

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

  return (
    <div className="relative min-h-screen flex flex-col justify-end bg-black overflow-hidden">

      {/* Stars background */}
      <Stars />

      {/* ── Dialog box ── */}
      {screen === 'dialog' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-5 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">ข้อความ</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {displayedText}
            <span className="inline-block w-[2px] h-[1.1em] bg-blue-400 align-middle ml-0.5 animate-blink" />
          </p>
          <div className="mt-3 text-right">
            <button
              onClick={handleNext}
              disabled={false}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              {step === DIALOGS.length - 1 && !isTyping ? 'เริ่มตั้งชื่อ ▶' : 'ถัดไป ▶'}
            </button>
          </div>
        </div>
      )}

      {/* ── Name input ── */}
      {screen === 'name' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
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
              className="flex-1 bg-white/5 border border-blue-600 focus:border-blue-400 rounded-lg text-slate-100 text-base px-4 py-2.5 outline-none placeholder-blue-900 transition-colors"
            />
            <button
              onClick={handleConfirm}
              className="bg-blue-900 hover:bg-blue-700 border border-blue-500 text-yellow-300 font-medium px-6 py-2.5 rounded-lg text-base whitespace-nowrap transition-colors"
            >
              ยืนยัน ✓
            </button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {screen === 'done' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-lg text-yellow-300">
            สวัสดี <span className="text-white font-semibold">{playerName}</span>!
          </p>
          <p className="text-sm text-blue-300 mt-2">ขอให้สนุกกับการผจญภัยนะครับ</p>
          <div className="mt-4 text-right">
            <button
              onClick={handleProceedToStory}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              ถัดไป ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Story ── */}
      {screen === 'story' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">เรื่องราว</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {STORY_TEXT}
          </p>
          <div className="mt-4 text-right">
            <button
              onClick={handleProceedToChoice}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              เลือกเส้นทาง ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Choice ── */}
      {screen === 'choice' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-4">เลือกเส้นทาง</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleChoosePath('forest')}
              className="w-full border border-green-500 text-green-300 hover:bg-green-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
            >
              ทางเลือกที่ 1
            </button>
            <button
              onClick={() => handleChoosePath('mountain')}
              className="w-full border border-purple-500 text-purple-300 hover:bg-purple-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
            >
              ทางเลือกที่ 2
            </button>
            {!hasFinishedMiniGame && (
              <button
                onClick={() => handleChoosePath('minigame')}
                className="w-full border border-yellow-500 text-yellow-300 hover:bg-yellow-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
              >
                มินิเกมแก้เบื่อ(ไม่เกี่ยวกับเนื้อเรื่องหลัก)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Story Path ── */}
      {screen === 'story-path' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">เนื้อเรื่อง</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {selectedPath && STORY_PATH_TEXTS[selectedPath]}
          </p>
          <div className="mt-4 flex justify-between gap-3">
            <button
              onClick={() => {
                setSelectedPath(null);
                setScreen('choice');
              }}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              กลับไปเลือกใหม่ ◀
            </button>
            <button
              onClick={handleProceedToStoryPathContinue}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              ถัดไป ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Story Path Continue ── */}
      {screen === 'story-path-continue' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">เนื้อเรื่องต่อจากทางเลือก</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {selectedPath && STORY_PATH_CONTINUE_TEXTS[selectedPath]}
          </p>
          <div className="mt-4 text-right">
            <button
              onClick={handleProceedToStoryPathContinue2}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              ถัดไป ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Story Path Continue 2 ── */}
      {screen === 'story-path-continue-2' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">เนื้อเรื่องส่วนที่ 2</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {selectedPath && STORY_PATH_CONTINUE_2_TEXTS[selectedPath]}
          </p>
          <div className="mt-4 text-right">
            <button
              onClick={handleProceedToStoryPathContinueChoice}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              ถัดไป ▶
            </button>
          </div>
        </div>
      )}

      {/* ── Story Path Continue Choice ── */}
      {screen === 'story-path-continue-choice' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">ทางเลือกส่วนที่ 2</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleChooseSecondPath('first')}
              className="w-full border border-green-500 text-green-300 hover:bg-green-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
            >
              ...........ทางเลือกที่1.1...........
            </button>
            <button
              onClick={() => handleChooseSecondPath('second')}
              className="w-full border border-purple-500 text-purple-300 hover:bg-purple-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
            >
              ...........ทางเลือกที2.1..............
            </button>
            <button
              onClick={() => handleChoosePath('mini4')}
              className="w-full border border-yellow-500 text-yellow-300 hover:bg-yellow-900/40 hover:text-white px-5 py-3 rounded-lg text-base transition-colors font-medium"
            >
              มินิเกม Mini_games_4
            </button>
          </div>
        </div>
      )}

      {/* ── Story Path Continue Choice Result ── */}
      {screen === 'story-path-continue-choice-result' && (
        <div className="relative z-10 w-full bg-[rgba(8,12,50,0.97)] border-t-2 border-blue-600 px-7 py-6 animate-fadeUp">
          <p className="text-[11px] tracking-widest text-blue-400 uppercase mb-2">ผลลัพธ์ทางเลือก</p>
          <p className="text-[17px] leading-relaxed text-slate-100 min-h-[52px]">
            {secondChoice && SECOND_CHOICE_RESULT_TEXTS[secondChoice]}
          </p>
          <div className="mt-4 text-right">
            <button
              onClick={() => {
                setSelectedPath(null);
                setSecondChoice(null);
                setScreen('story');
              }}
              className="border border-blue-500 text-blue-300 hover:bg-blue-900/40 hover:text-white px-5 py-1.5 rounded-lg text-sm transition-colors"
            >
              ถัดไป ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tiny star field component ── */
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none"
         style={{ background: 'radial-gradient(ellipse at 20% 30%, #0a0a2e 0%, #000 70%)' }}>
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: s.size,
            height: s.size,
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
