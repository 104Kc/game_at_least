'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const ROWS = 10;
const COLS = 10;
const GEM_TYPES = 4;
const GEM_IMAGES = [
  '/images/25 ธ.ค. 2568 05_48_10.png',
  '/images/ChatGPT Image 25 ธ.ค. 2568 05_52_31.png',
  '/images/ChatGPT Image 25 ธ.ค. 2568 05_57_06.png',
  '/images/ChatGPT Image 25 ธ.ค. 2568 05_59_08.png',
];

type Position = [number, number];

export default function Home() {
  const [grid, setGrid] = useState<number[][]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  // สร้าง grid หลังจาก component mount แล้ว
  useEffect(() => {
    setGrid(createInitialGrid());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  function createInitialGrid(): number[][] {
    let newGrid: number[][];
    let attempts = 0;
    do {
      newGrid = [];
      for (let r = 0; r < ROWS; r++) {
        const row: number[] = [];
        for (let c = 0; c < COLS; c++) {
          row.push(Math.floor(Math.random() * GEM_TYPES));
        }
        newGrid.push(row);
      }
      attempts++;
    } while (findMatches(newGrid).size > 0 && attempts < 100);
    return newGrid;
  }

  function findMatches(grid: number[][]): Set<string> {
    const matches = new Set<string>();

    // Check rows
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        if (grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2]) {
          matches.add(`${r},${c}`);
          matches.add(`${r},${c + 1}`);
          matches.add(`${r},${c + 2}`);
          let cc = c + 3;
          while (cc < COLS && grid[r][cc] === grid[r][c]) {
            matches.add(`${r},${cc}`);
            cc++;
          }
        }
      }
    }

    // Check columns
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 2; r++) {
        if (grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c]) {
          matches.add(`${r},${c}`);
          matches.add(`${r + 1},${c}`);
          matches.add(`${r + 2},${c}`);
          let rr = r + 3;
          while (rr < ROWS && grid[rr][c] === grid[r][c]) {
            matches.add(`${rr},${c}`);
            rr++;
          }
        }
      }
    }

    return matches;
  }

  function removeMatches(grid: number[][], matches: Set<string>): number[][] {
    const newGrid = grid.map(row => [...row]);
    let removed = 0;
    matches.forEach(pos => {
      const [r, c] = pos.split(',').map(Number);
      if (newGrid[r][c] !== -1) {
        newGrid[r][c] = -1;
        removed++;
      }
    });
    setScore(prev => prev + removed);
    return newGrid;
  }

  function isInvalid(gem: number, r: number, c: number, grid: number[][]): boolean {
    if (r > 0 && grid[r - 1][c] === gem) return true;
    if (c > 0 && grid[r][c - 1] === gem) return true;
    if (c < COLS - 1 && grid[r][c + 1] === gem) return true;
    return false;
  }

  function dropGems(grid: number[][]): number[][] {
    const newGrid = grid.map(row => [...row]);
    for (let c = 0; c < COLS; c++) {
      const column = [];
      for (let r = ROWS - 1; r >= 0; r--) {
        if (newGrid[r][c] !== -1) {
          column.push(newGrid[r][c]);
        }
      }
      while (column.length < ROWS) {
        let r = ROWS - column.length - 1;
        let attempts = 0;
        let newGem;
        do {
          newGem = Math.floor(Math.random() * GEM_TYPES);
          attempts++;
        } while (attempts < 100 && isInvalid(newGem, r, c, newGrid));
        column.push(newGem);
      }
      for (let r = 0; r < ROWS; r++) {
        newGrid[r][c] = column[ROWS - 1 - r];
      }
    }
    return newGrid;
  }

  function processMatches(grid: number[][]): number[][] {
    let currentGrid = [...grid];
    let hasMatches = true;
    while (hasMatches) {
      const matches = findMatches(currentGrid);
      if (matches.size === 0) {
        hasMatches = false;
      } else {
        currentGrid = removeMatches(currentGrid, matches);
        currentGrid = dropGems(currentGrid);
      }
    }
    return currentGrid;
  }

  function handleClick(r: number, c: number) {
    if (selected === null) {
      setSelected([r, c]);
    } else {
      const [sr, sc] = selected;
      if (sr === r && sc === c) {
        setSelected(null);
        return;
      }
      const isAdjacent = (Math.abs(r - sr) === 1 && c === sc) || (Math.abs(c - sc) === 1 && r === sr);
      if (!isAdjacent) {
        setSelected([r, c]);
        return;
      }
      // Swap
      const newGrid = grid.map(row => [...row]);
      [newGrid[sr][sc], newGrid[r][c]] = [newGrid[r][c], newGrid[sr][sc]];
      const matches = findMatches(newGrid);
      if (matches.size > 0) {
        const finalGrid = processMatches(newGrid);
        setGrid(finalGrid);
      } else {
        // Swap back
        [newGrid[sr][sc], newGrid[r][c]] = [newGrid[r][c], newGrid[sr][sc]];
        setGrid(newGrid);
      }
      setSelected(null);
    }
  }

  // แสดง loading ขณะรอ grid ถูกสร้าง
  if (!mounted || grid.length === 0) {
    return (
      <div 
        className="relative min-h-screen flex items-center justify-center" 
        style={{ 
          backgroundImage: 'url(/images/ChatGPT%20Image%2025%20ธ.ค.%202568%2006_30_03.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-4 rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen" 
      style={{ 
        backgroundImage: 'url(/images/ChatGPT%20Image%2025%20ธ.ค.%202568%2006_30_03.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >
      <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
        Score: {score}
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Match Gems Game</h1>
          <div className="flex gap-4 text-white">
            <div>Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        <div 
          className="grid gap-1 bg-black bg-opacity-50 p-2 rounded" 
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((gem, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-8 h-8 cursor-pointer border-2 ${
                  selected && selected[0] === r && selected[1] === c 
                    ? 'border-red-500' 
                    : 'border-gray-400'
                }`}
                onClick={() => handleClick(r, c)}
              >
                {gem !== -1 && (
                  <Image
                    src={GEM_IMAGES[gem]}
                    alt={`Gem ${gem}`}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    priority={r < 3 && c < 3}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}