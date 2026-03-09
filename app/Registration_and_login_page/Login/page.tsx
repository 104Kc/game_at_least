'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [characterName, setCharacterName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    // โหลดข้อมูลการสมัครจาก localStorage
    const registeredUser = localStorage.getItem("registeredUser");
    if (registeredUser) {
      const { characterName: savedName, password: savedPassword } = JSON.parse(registeredUser);
      setCharacterName(savedName);
      setPassword(savedPassword);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!characterName.trim()) {
      setError("กรุณากรอกชื่อตัวละคร");
      return;
    }

    if (password.length < 6 || password.length > 12) {
      setError("รหัสผ่านต้องมี 6-12 ตัวอักษร");
      return;
    }

    // สำหรับ demo สมมติว่าล็อกอินสำเร็จ
    router.push("/each-page-of-the-main-game");
  };

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
        <div className="bg-blue-900 bg-opacity-90 rounded-lg shadow-2xl p-8 border-4 border-blue-500">
          <h1 className="text-4xl font-bold text-center text-yellow-300 mb-2 drop-shadow-lg">
            At Least
          </h1>
          <h2 className="text-2xl font-bold text-center text-white mb-8 drop-shadow-md">
            ล็อกอิน
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Character Name Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                ชื่อตัวละคร
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-gray-100 text-gray-800 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="กรอกชื่อตัวละครของคุณ"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-gray-100 text-gray-800 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-80 text-white p-3 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition transform hover:scale-105 shadow-lg drop-shadow-md mt-8"
            >
              ล็อกอิน
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
