'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationPage() {
  const [characterName, setCharacterName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!characterName.trim()) {
      setError("กรุณากรอกชื่อตัวละคร");
      return;
    }

    if (password.length < 6 || password.length > 12) {
      setError("รหัสผ่านต้องมี 6-12 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // เก็บข้อมูลการสมัครไว้ใน localStorage
    localStorage.setItem("registeredUser", JSON.stringify({ characterName, password }));

    setSuccess("สมัครสมาชิกสำเร็จ!");
    setCharacterName("");
    setPassword("");
    setConfirmPassword("");

    // ไปหน้าเกมหลังสมัครสำเร็จ
    setTimeout(() => {
      router.push("/each-page-of-the-main-game");
    }, 1000);
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
            สมัครสมาชิก
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
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
                รหัสผ่าน (6-12 ตัวอักษร)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-gray-100 text-gray-800 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-gray-100 text-gray-800 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-80 text-white p-3 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500 bg-opacity-80 text-white p-3 rounded-lg text-center font-semibold">
                {success}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition transform hover:scale-105 shadow-lg drop-shadow-md mt-8"
            >
              สมัครสมาชิก
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/Registration_and_login_page/Login">
              <button className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition transform hover:scale-105 shadow-lg drop-shadow-md">
                ล็อกอิน
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
