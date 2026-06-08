import Image from "next/image";
import Link from "next/link";

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
      <main className="text-center text-white">
        <Image
          src="/images/ChatGPT Image 6 ม.ค. 2569 14_43_39.png"
          alt="At Least"
          width={600}
          height={200}
          className="mb-8 drop-shadow-lg"
          priority
        />
        {/* welcome message removed as requested */}
        <Link href="/Registration_and_login_page/Login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition transform hover:scale-105">
            Start Game
          </button>
        </Link>
      </main>
    </div>
  );
}
