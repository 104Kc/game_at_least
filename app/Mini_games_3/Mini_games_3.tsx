"use client";

import { useEffect, useState } from "react";

interface LeafItem {
  id: number;
  left: number;
  top: number;
  collected: boolean;
}

const BACKGROUND_IMAGE = "/images/Gemini_Generated_Image_sq3nscsq3nscsq3n.png";
const LEAF_IMAGE = "/images/%E2%80%94Pngtree%E2%80%94dried%20leaves_8662278.png";
const LEAF_COUNT = 10;

const isInGreenZone = (left: number, top: number) => {
  if (top < 62 || top > 92) return false;
  if (left < 16) return top >= 72;
  if (left < 30) return top >= 68;
  if (left < 45) return top >= 70;
  if (left < 58) return top >= 76;
  if (left < 72) return top >= 70;
  if (left < 86) return top >= 66;
  return top >= 63;
};

const createLeaves = (): LeafItem[] =>
  Array.from({ length: LEAF_COUNT }, (_, index) => {
    let left: number;
    let top: number;

    do {
      left = 8 + Math.random() * 84;
      top = 62 + Math.random() * 30;
    } while (!isInGreenZone(left, top));

    return {
      id: index + 1,
      left,
      top,
      collected: false,
    };
  });

export default function MiniGames3() {
  const [leaves, setLeaves] = useState<LeafItem[]>([]);

  useEffect(() => {
    setLeaves(createLeaves());
  }, []);

  const collectedCount = leaves.filter((leaf) => leaf.collected).length;
  const hasWon = collectedCount === LEAF_COUNT;

  const collectLeaf = (id: number) => {
    setLeaves((current) =>
      current.map((leaf) =>
        leaf.id === id ? { ...leaf, collected: true } : leaf
      )
    );
  };

  const restartGame = () => {
    setLeaves(createLeaves());
  };

  return (
    <main className="mini-game-page">
      <div className="game-area" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <div className="score-panel">
          <div className="score-icon">
            <img src={LEAF_IMAGE} alt="ไอคอนใบไม้" />
          </div>
          <div className="score-text">
            <span>เก็บได้</span>
            <strong>{collectedCount}</strong>
            <span>/ {LEAF_COUNT}</span>
          </div>
        </div>

        {leaves.map((leaf) =>
          !leaf.collected ? (
            <button
              key={leaf.id}
              type="button"
              className="leaf-button"
              onClick={() => collectLeaf(leaf.id)}
              style={{ left: `${leaf.left}%`, top: `${leaf.top}%` }}
              aria-label={`ใบไม้ ${leaf.id}`}
            >
              <img src={LEAF_IMAGE} alt="ใบไม้" />
            </button>
          ) : null
        )}

        {hasWon && (
          <div className="win-overlay">
            <div className="win-card">
              <h2>สำเร็จแล้ว!</h2>
              <p>คุณเก็บใบไม้ครบ 10 ใบแล้ว 🎉</p>
              <button type="button" onClick={restartGame}>
                เล่นใหม่
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .mini-game-page {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .game-area {
          position: relative;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .score-panel {
          position: absolute;
          right: 24px;
          top: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 18px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .score-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ecfdf5;
          display: grid;
          place-items: center;
          box-shadow: inset 0 1px 3px rgba(15, 23, 42, 0.08);
        }

        .score-icon img {
          width: 28px;
          height: 28px;
          display: block;
        }

        .score-text {
          display: flex;
          align-items: baseline;
          gap: 6px;
          color: #0f172a;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .score-text span {
          color: #334155;
        }

        .score-text strong {
          color: #15803d;
          font-size: 1.1rem;
        }

        .leaf-button {
          position: absolute;
          border: none;
          background: transparent;
          cursor: pointer;
          transform: translate(-50%, -50%);
          padding: 0;
          transition: transform 0.18s ease, filter 0.18s ease;
          z-index: 5;
        }

        .leaf-button img {
          width: 56px;
          height: auto;
          display: block;
          filter: drop-shadow(0 10px 20px rgba(15, 23, 42, 0.25));
        }

        .leaf-button:hover {
          transform: translate(-50%, -50%) scale(1.1);
        }

        .win-overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.56);
          padding: 24px;
          z-index: 20;
        }

        .win-card {
          max-width: 420px;
          width: 100%;
          text-align: center;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 28px;
          padding: 34px 28px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
        }

        .win-card h2 {
          margin: 0 0 14px;
          font-size: 2rem;
          color: #111827;
        }

        .win-card p {
          margin: 0 0 20px;
          color: #334155;
          font-size: 1rem;
          line-height: 1.65;
        }

        .win-card button {
          border: none;
          border-radius: 999px;
          background: #16a34a;
          color: white;
          font-size: 1rem;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .win-card button:hover {
          background: #15803d;
        }
      `}</style>
    </main>
  );
}
