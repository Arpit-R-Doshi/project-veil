"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ReportForm from "../components/ReportForm";
import ReportFeed from "../components/ReportFeed";
import { CONTRACT_ADDRESS } from "../constants"; 

// 🔐 Credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "veil2024"; 

// ⚠️ Replace with your Wallet Address if you are not the deployer
const AUTHORITY_WALLET_ADDRESS = "0x75199c1aa8F21Eb583027BbB6763B7c79CC180D6"; 

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState("landing"); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoginError("");
      setView("admin-dashboard");
    } else {
      setLoginError("Invalid credentials.");
    }
  };

  const isAuthorityWallet = address?.toLowerCase() === AUTHORITY_WALLET_ADDRESS.toLowerCase();

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-red-900 selection:text-white">
      
      {/* Navbar */}
      <nav className="border-b border-neutral-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div onClick={() => setView("landing")} className="text-2xl font-black tracking-tighter text-red-600 cursor-pointer hover:opacity-80 transition">
            PROJECT VEIL
          </div>
          <div className="flex items-center gap-4">
            {view !== "admin-login" && <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />}
            {view === "admin-dashboard" && (
              <button onClick={() => { setView("landing"); setUsername(""); }} className="text-sm text-gray-500 hover:text-white transition">Logout</button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
        
        {/* VIEW 1: LANDING PAGE */}
        {view === "landing" && (
          <div className="flex flex-col items-center text-center max-w-4xl animate-in fade-in zoom-in duration-700">
            
            {/* 👇 UPDATED HEADLINE HERE */}
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-800 mb-8 tracking-tighter leading-tight">
              SILENCE BREAKS <br /> THE CHAINS.
            </h1>

            <p className="text-xl text-neutral-400 mb-12 max-w-2xl tracking-wide">
              Decentralized, anonymous crime reporting powered by Polygon. 
              <br/>Your identity is protected by mathematics.
            </p>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
              <button onClick={() => setView("reporter")} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-red-900/20">
                Report a Crime
              </button>
              <button onClick={() => setView("admin-login")} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-4 px-8 rounded-xl border border-neutral-700 transition-all">
                Authority Login
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: REPORTER FORM */}
        {view === "reporter" && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-right duration-500">
             <div className="mb-6 text-center">
               <h2 className="text-3xl font-bold text-white">Secure Submission Channel</h2>
               {!isConnected && <p className="text-red-400 text-sm mt-2">⚠️ Please connect your wallet to submit</p>}
            </div>
            <ReportForm />
            <button onClick={() => setView("landing")} className="mt-8 text-neutral-500 hover:text-white underline text-sm">&larr; Return Home</button>
          </div>
        )}

        {/* VIEW 3: ADMIN LOGIN */}
        {view === "admin-login" && (
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">🔐 Authority Access</h2>
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-500 outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-500 outline-none mt-1" />
              </div>
              {loginError && <div className="text-red-500 text-sm bg-red-950/30 p-2 rounded">{loginError}</div>}
              <button type="submit" className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 mt-2 transition-colors">Authenticate</button>
            </form>
            <button onClick={() => setView("landing")} className="w-full text-center mt-6 text-neutral-600 hover:text-neutral-400 text-sm">Cancel</button>
          </div>
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {view === "admin-dashboard" && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
            {!isConnected ? (
               <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg mb-8 text-center">
                 <h3 className="text-yellow-500 font-bold">⚠️ Wallet Connection Required</h3>
               </div>
            ) : !isAuthorityWallet ? (
                <div className="bg-red-900/30 border border-red-700/50 p-4 rounded-lg mb-8 text-center">
                 <h3 className="text-red-500 font-bold">⛔ Access Restricted</h3>
                 <p className="text-sm text-red-200/70">Connected wallet is not the Authority.</p>
               </div>
            ) : (
                <ReportFeed />
            )}
          </div>
        )}

      </div>
    </main>
  );
}