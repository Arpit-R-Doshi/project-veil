import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-neutral-900 text-white">
      
      {/* Title */}
      <h1 className="text-6xl font-extrabold text-red-600 mb-4 tracking-widest">
        PROJECT VEIL
      </h1>
      <p className="text-xl mb-12 text-gray-400">
        Speak the truth. Stay in the shadows.
      </p>

      {/* THE MAGIC BUTTON */}
      <ConnectButton />

    </main>
  );
}