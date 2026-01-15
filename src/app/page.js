"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { polygonAmoy } from "wagmi/chains"; // Import chain for balance
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ReportForm from "../components/ReportForm";
import ReportFeed from "../components/ReportFeed";
import { CONTRACT_ADDRESS } from "../constants"; 
import { FallingPattern } from "../components/FallingPattern"; // Import the shader

// Credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "veil2024"; 
const AUTHORITY_WALLET_ADDRESS = "0x75199c1aa8F21Eb583027BbB6763B7c79CC180D6"; 

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  // 💰 NEW: Fetch Balance
  const { data: balanceData } = useBalance({
    address: address,
    chainId: polygonAmoy.id,
  });

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
    <main className="relative min-h-screen bg-black text-white font-sans selection:bg-red-900 selection:text-white overflow-hidden">
      
      {/* 🌌 BACKGROUND SHADER */}
      <FallingPattern color="#ff3333" duration={80} />

      {/* Z-Index wrapper to keep content above background */}
      <div className="relative z-10">
        
        {/* Navbar */}
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            
            <div onClick={() => setView("landing")} className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 cursor-pointer font-[family-name:var(--font-space)]">
              VEIL
            </div>

            <div className="flex items-center gap-4">
               {/* 💰 CUSTOM WALLET INFO DISPLAY */}
               {isConnected && view !== "landing" && (
                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Connected</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-[family-name:var(--font-space)]">
                            {balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '...'}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                 </div>
               )}

              {view !== "admin-login" && (
                  <ConnectButton 
                    accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'full',
                    }} 
                    chainStatus="icon" 
                    showBalance={false} // We show custom balance above
                  />
              )}
              
              {view === "admin-dashboard" && (
                <button onClick={() => { setView("landing"); setUsername(""); }} className="text-sm text-gray-500 hover:text-white transition font-[family-name:var(--font-space)]">Logout</button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
            
            {/* LANDING PAGE */}
            {view === "landing" && (
            <div className="flex flex-col items-center text-center max-w-4xl animate-in fade-in zoom-in duration-700">
                <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-8 tracking-tighter leading-[0.85] font-[family-name:var(--font-space)]">
                SILENCE <br /> BREAKS <br /> CHAINS
                </h1>

                <p className="text-xl text-neutral-400 mb-12 max-w-2xl tracking-wide font-light">
                Immutable. Anonymous. Decentralized.<br/>
                <span className="text-red-500 font-bold">Polygon Amoy Network</span>
                </p>

                <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
                <button onClick={() => setView("reporter")} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] font-[family-name:var(--font-space)] tracking-widest uppercase">
                    Report Incident
                </button>
                <button onClick={() => setView("admin-login")} className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold py-4 px-8 rounded-xl border border-white/10 transition-all backdrop-blur-sm font-[family-name:var(--font-space)] tracking-widest uppercase">
                    Authority
                </button>
                </div>
            </div>
            )}

            {/* REPORTER FORM WRAPPER */}
            {view === "reporter" && (
            <div className="w-full flex flex-col items-center animate-in slide-in-from-right duration-500">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-space)]">Secure Channel</h2>
                    {!isConnected && <p className="text-red-400 text-sm mt-2 font-mono">⚠️ Wallet Connection Required</p>}
                </div>
                
                {/* Display Address & Balance for Reporter */}
                {isConnected && (
                    <div className="mb-8 p-4 bg-red-900/10 border border-red-500/30 rounded-xl flex items-center gap-4 backdrop-blur-md">
                        <div>
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Your Identity Hash</p>
                            <p className="text-sm font-mono text-white">{address}</p>
                        </div>
                        <div className="h-8 w-[1px] bg-red-500/30"></div>
                        <div>
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Gas Balance</p>
                            <p className="text-sm font-mono text-white">
                                {balanceData ? `${Number(balanceData.formatted).toFixed(4)} MATIC` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                )}

                <ReportForm />
                
                <button onClick={() => setView("landing")} className="mt-8 text-neutral-500 hover:text-white underline text-sm font-mono">
                    [ TERMINATE SESSION ]
                </button>
            </div>
            )}

            {/* ADMIN LOGIN */}
            {view === "admin-login" && (
            <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-bold text-white mb-6 font-[family-name:var(--font-space)]">🔐 Authority Access</h2>
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase font-[family-name:var(--font-space)]">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none mt-1 transition-all" />
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase font-[family-name:var(--font-space)]">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none mt-1 transition-all" />
                </div>
                {loginError && <div className="text-red-500 text-sm bg-red-950/30 p-2 rounded border border-red-900/50">{loginError}</div>}
                <button type="submit" className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 mt-2 transition-colors font-[family-name:var(--font-space)] uppercase tracking-wider">Authenticate</button>
                </form>
                <button onClick={() => setView("landing")} className="w-full text-center mt-6 text-neutral-600 hover:text-neutral-400 text-sm font-mono">Cancel</button>
            </div>
            )}

            {/* ADMIN DASHBOARD */}
            {view === "admin-dashboard" && (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                {!isConnected ? (
                <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg mb-8 text-center backdrop-blur-sm">
                    <h3 className="text-yellow-500 font-bold font-mono">⚠️ Wallet Connection Required</h3>
                </div>
                ) : !isAuthorityWallet ? (
                    <div className="bg-red-900/30 border border-red-700/50 p-4 rounded-lg mb-8 text-center backdrop-blur-sm">
                    <h3 className="text-red-500 font-bold font-mono">⛔ Access Restricted</h3>
                    <p className="text-sm text-red-200/70">Connected wallet is not the Authority.</p>
                </div>
                ) : (
                    <ReportFeed />
                )}
            </div>
            )}

        </div>
      </div>
    </main>
  );
}