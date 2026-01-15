import { ConnectButton } from '@rainbow-me/rainbowkit';
import ReportForm from '../components/ReportForm'; 
import ReportFeed from '../components/ReportFeed'; // <--- Import this

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-neutral-900 text-white">
      
      <h1 className="text-6xl font-extrabold text-red-600 mb-4 tracking-widest">
        PROJECT VEIL
      </h1>
      <p className="text-xl mb-12 text-gray-400">
        Speak the truth. Stay in the shadows.
      </p>

      <div className="mb-8">
        <ConnectButton />
      </div>

      <ReportForm /> 
      
      {/* The List of Reports */}
      <ReportFeed />

    </main>
  );
}