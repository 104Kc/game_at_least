import Image from "next/image";
import Link from "next/link";
import AudioSettingsButton from "./components/AudioSettingsButton";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src="/images/ChatGPT Image 6 ม.ค. 2569 14_02_35.png"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />

      {/* ปุ่มตั้งค่าเสียง ลอยมุมขวาบน */}
      <div className="fixed top-4 right-4 z-50">
        <AudioSettingsButton />
      </div>

      <main className="text-center text-white relative">
        <Image
          src="/images/ChatGPT Image 6 ม.ค. 2569 14_43_39.png"
          alt="At Least"
          width={600}
          height={200}
          className="mb-8 drop-shadow-lg"
          priority
        />

        <Link href="/Each_page_of_the_main_game">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition transform hover:scale-105">
            Start Game
          </button>
        </Link>
      </main>
    </div>
  );
}