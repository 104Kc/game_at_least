'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const DIALOGS = [
  'สวัสดีทุกคนที่มีความเครียด เกมนี้มีแนวคิดเป็นเกมเนื้อเรื่องที่จะช่วยให้ทุกคนคลายเครียด',
  'และยังมีมินิเกมเล็กๆ น้อยๆ ให้เล่นด้วย',
  'เอาละ ตอนนี้มาตั้งชื่อตัวละครของคุณกัน',
];

type Screen = 'dialog' | 'name' | 'done';

export default function MainGamePage() {
  const [screen, setScreen] = useState<Screen>('dialog');
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');

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
