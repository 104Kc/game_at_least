"use client";

import { useEffect, useState } from "react";

const PUZZLE_IMAGES = [
  "/images/Gemini_Generated_Image_sq3nscsq3nscsq3n.png",
  "/images/ChatGPT Image 25 ธ.ค. 2568 06_30_03.png",
  "/images/ChatGPT Image 3 พ.ค. 2569 11_24_10.png",
  "/images/ChatGPT Image 6 ม.ค. 2569 14_02_35.png",
];
const GRID_SIZE = 3;
const PIECE_COUNT = GRID_SIZE * GRID_SIZE;

const createShuffledPieces = (): number[] => {
  const order = Array.from({ length: PIECE_COUNT }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((value, index) => value === index)) {
    return createShuffledPieces();
  }
  return order;
};

const getRandomImage = () => PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];

export default function MiniGames4() {
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [puzzleImage, setPuzzleImage] = useState<string>("");

  useEffect(() => {
    setPieces(createShuffledPieces());
    setPuzzleImage(getRandomImage());
  }, []);

  const hasSolved = pieces.length === PIECE_COUNT && pieces.every((value, index) => value === index);

  const selectPiece = (index: number) => {
    if (hasSolved) return;
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }
    setPieces((current) => {
      const next = [...current];
      [next[selectedIndex], next[index]] = [next[index], next[selectedIndex]];
      return next;
    });
    setSelectedIndex(null);
  };

  return (
    <main className="puzzle-page">
      <div className="puzzle-frame">
        {hasSolved ? (
          <div className="solved-image" />
        ) : (
          <div className="puzzle-grid" role="grid" aria-label="เกมต่อภาพ">
            {pieces.map((pieceIndex, index) => {
              const row = Math.floor(pieceIndex / GRID_SIZE);
              const col = pieceIndex % GRID_SIZE;
              return (
                <button
                  key={index}
                  type="button"
                  className={`puzzle-piece ${selectedIndex === index ? "selected" : ""}`}
                  onClick={() => selectPiece(index)}
                  style={{
                    backgroundImage: `url(${encodeURI(puzzleImage)})`,
                    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                    backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`,
                  }}
                  aria-label={`ชิ้นส่วนที่ ${index + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .puzzle-page {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: #000000;
        }

        .puzzle-frame {
          width: 100vw;
          height: 100vh;
          padding: 0;
          display: grid;
          place-items: center;
          background: transparent;
        }

        .puzzle-grid {
          width: calc(100vh * 0.9);
          max-width: 100vw;
          aspect-ratio: 1 / 1;
          display: grid;
          grid-template-columns: repeat(${GRID_SIZE}, minmax(0, 1fr));
          gap: 6px;
        }

        .puzzle-piece {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          border: 2px solid transparent;
          background-color: #f8fafc;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .puzzle-piece:hover,
        .puzzle-piece.selected {
          transform: translateY(-2px);
          border-color: rgba(34, 197, 94, 0.75);
          box-shadow: 0 14px 24px rgba(15, 23, 42, 0.14);
        }

        .solved-image {
          width: calc(100vh * 0.9);
          max-width: 100vw;
          aspect-ratio: 1 / 1;
          border: none;
          background-image: url(${encodeURI(puzzleImage)});
          background-size: cover;
          background-position: center;
          border-radius: 14px;
          cursor: default;
          padding: 0;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
