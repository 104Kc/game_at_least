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

  return (
    <AudioSettingsContext.Provider
      value={{ volume, isMuted, increaseVolume, decreaseVolume, toggleMute }}
    >
      {/* เพลงพื้นหลัง เล่นต่อเนื่องทุกหน้าเพราะอยู่ใน layout */}
      <audio ref={audioRef} src="/audio/bg-music.mp3" loop autoPlay />
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