'use client';

import Image from "next/image";

export default function MainGamePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src="/images/ChatGPT Image 6 ม.ค. 2569 14_02_35.png"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />

      <main className="w-full max-w-md mx-auto px-4">
        <div className="bg-blue-900 bg-opacity-90 rounded-lg shadow-2xl p-8 border-4 border-blue-500 text-center">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2 drop-shadow-lg">
            At Least
          </h1>
          <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">
            เกมหลัก
          </h2>
          <p className="text-white text-lg">
            ยินดีต้อนรับเข้าสู่เกม! เล่นให้สนุกนะครับ
          </p>
        </div>
      </main>
    </div>
  );
}
