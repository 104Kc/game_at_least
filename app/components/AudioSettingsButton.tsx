"use client";

import { useState } from "react";
import { useAudioSettings } from "../context/AudioSettingsContext";

export default function AudioSettingsButton() {
  const { volume, isMuted, increaseVolume, decreaseVolume, toggleMute } =
    useAudioSettings();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings((s) => !s)}
        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-lg transition transform hover:scale-105"
        aria-label="ตั้งค่าเสียง"
      >
        ⚙️
      </button>

      {showSettings && (
        <div className="absolute top-full mt-2 right-0 left-auto bg-black/80 backdrop-blur-sm rounded-lg p-4 w-56 shadow-lg z-10">
          <p className="text-sm mb-3 font-semibold">ตั้งค่าเสียงเพลง</p>

          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={decreaseVolume}
              className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
            >
              -
            </button>
            <span className="text-sm">
              {isMuted ? "ปิดเสียง" : `${Math.round(volume * 100)}%`}
            </span>
            <button
              onClick={increaseVolume}
              className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
            >
              +
            </button>
          </div>

          <button
            onClick={toggleMute}
            className={`w-full py-1 rounded font-semibold transition ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {isMuted ? "🔇 เปิดเสียง" : "🔊 ปิดเสียง"}
          </button>
        </div>
      )}
    </div>
  );
}