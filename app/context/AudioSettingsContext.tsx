"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

type AudioSettingsContextType = {
  volume: number;
  isMuted: boolean;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  toggleMute: () => void;
  playAudio: () => void;
};

const AudioSettingsContext = createContext<AudioSettingsContextType | null>(
  null
);

export function AudioSettingsProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const increaseVolume = () => {
    setIsMuted(false);
    setVolume((v) => Math.min(1, +(v + 0.1).toFixed(1)));
  };

  const decreaseVolume = () => {
    setVolume((v) => Math.max(0, +(v - 0.1).toFixed(1)));
  };

  const toggleMute = () => {
    setIsMuted((m) => !m);
  };

  const playAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.muted = isMuted;
    void audioRef.current.play().catch(() => {
      // Autoplay may be blocked until user interaction, but the click handler
      // on the Start Game button will trigger this function.
    });
  };

  return (
    <AudioSettingsContext.Provider
      value={{
        volume,
        isMuted,
        increaseVolume,
        decreaseVolume,
        toggleMute,
        playAudio,
      }}
    >
      {/* เพลงพื้นหลัง เล่นต่อเนื่องทุกหน้าเพราะอยู่ใน layout */}
      <audio
        ref={audioRef}
        src="/audio/【弾いてみた】八十八鍵の宇宙 Orangestar【Piano cover】.mp3"
        loop
        autoPlay
        playsInline
      />
      {children}
    </AudioSettingsContext.Provider>
  );
}

export function useAudioSettings() {
  const ctx = useContext(AudioSettingsContext);
  if (!ctx) {
    throw new Error(
      "useAudioSettings ต้องถูกใช้ภายใน AudioSettingsProvider เท่านั้น"
    );
  }
  return ctx;
}