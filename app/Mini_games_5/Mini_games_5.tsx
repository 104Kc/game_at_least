'use client';

import { useEffect, useMemo, useState } from 'react';

type Card = {
  id: number;
  pairId: number;
  image: string;
  matched: boolean;
  flipped: boolean;
};

const CARD_IMAGES = [
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_07_37.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_09_05.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_12_24.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_13_52.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_16_31.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_18_41.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_22_41.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 13_55_03.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 16_43_30.png',
  '/images/card matching game picture/ChatGPT Image 29 พ.ค. 2569 16_48_38.png',
];

function shuffle<T>(array: T[]): T[] {
  const items = [...array];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export default function MiniGames5() {
  const [cards, setCards] = useState<Card[]>([]);
  const [firstIndex, setFirstIndex] = useState<number | null>(null);
  const [secondIndex, setSecondIndex] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const deck = useMemo(() => {
    const pairCards: Card[] = CARD_IMAGES.flatMap((image, index) => [
      { id: index * 2, pairId: index, image, matched: false, flipped: false },
      { id: index * 2 + 1, pairId: index, image, matched: false, flipped: false },
    ]);
    return shuffle(pairCards);
  }, []);

  useEffect(() => {
    setCards(deck);
  }, [deck]);

  useEffect(() => {
    if (firstIndex !== null && secondIndex !== null) {
      setIsChecking(true);
      const timeout = setTimeout(() => {
        setCards((currentCards) => {
          const firstCard = currentCards[firstIndex];
          const secondCard = currentCards[secondIndex];

          if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
            return currentCards.map((card, index) => {
              if (index === firstIndex || index === secondIndex) {
                return { ...card, matched: true, flipped: true };
              }
              return card;
            });
          }

          return currentCards.map((card, index) => {
            if (index === firstIndex || index === secondIndex) {
              return { ...card, flipped: false };
            }
            return card;
          });
        });

        setFirstIndex(null);
        setSecondIndex(null);
        setIsChecking(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [firstIndex, secondIndex]);

  const handleCardClick = (index: number) => {
    if (isChecking) return;
    setCards((currentCards) => {
      const card = currentCards[index];
      if (card.flipped || card.matched) return currentCards;

      const nextCards = currentCards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, flipped: true } : item
      );

      if (firstIndex === null) {
        setFirstIndex(index);
      } else if (secondIndex === null) {
        setSecondIndex(index);
        setAttempts((prev) => prev + 1);
      }

      return nextCards;
    });
  };

  const handleRestart = () => {
    const newDeck = shuffle(deck.map((card) => ({ ...card, matched: false, flipped: false })));
    setCards(newDeck);
    setFirstIndex(null);
    setSecondIndex(null);
    setAttempts(0);
    setIsChecking(false);
  };

  const matchedCount = cards.filter((card) => card.matched).length;
  const completed = matchedCount === cards.length && cards.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/95 px-5 py-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.9)]">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">เกมจับคู่การ์ด</h1>
            <p className="text-xs text-slate-500">เปิด 2 ใบ แล้วจับคู่</p>
          </div>

          <div className="flex gap-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">เปิด</div>
              <div className="mt-1 text-lg font-semibold text-white">{attempts}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">คู่</div>
              <div className="mt-1 text-lg font-semibold text-white">{matchedCount / 2} / {cards.length / 2}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            เริ่มใหม่
          </button>
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-5">
          {completed && (
            <div className="mb-4 rounded-3xl border border-emerald-500 bg-emerald-500/10 p-4 text-emerald-100 shadow-inner shadow-emerald-500/10">
              <h2 className="text-lg font-bold">ยินดีด้วย!</h2>
              <p className="mt-1 text-sm text-slate-200">คุณจับคู่ครบแล้ว</p>
            </div>
          )}

          <div className="h-full overflow-auto rounded-[2rem] border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/20">
            <div className="grid min-h-0 gap-4 auto-rows-fr sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(index)}
                  disabled={card.flipped || card.matched || isChecking}
                  className="group aspect-square w-full overflow-hidden rounded-[1.25rem] border border-slate-700 bg-slate-900 p-1.5 shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-1 hover:shadow-black/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1rem] bg-slate-950 p-1.5 text-center shadow-inner shadow-slate-900/30">
                    {card.flipped || card.matched ? (
                      <img
                        src={encodeURI(card.image)}
                        alt="การ์ด"
                        className="h-full w-full rounded-[0.9rem] object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-slate-200">
                        <span className="text-sm font-semibold">คลิกเปิด</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
 