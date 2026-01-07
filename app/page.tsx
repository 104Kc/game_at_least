import Image from "next/image";

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
        <p className="text-xl mb-8 drop-shadow-md">
          Welcome to the game!
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Start Game
        </button>
      </main>
    </div>
  );
}
