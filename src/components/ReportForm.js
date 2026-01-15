"use client";
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import CryptoJS from 'crypto-js'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

// --- ICONS ---
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const GpsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/></svg>
);

export default function ReportForm() {
  const [details, setDetails] = useState("");
  const [crimeType, setCrimeType] = useState(""); 
  const [incidentDateTime, setIncidentDateTime] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null); 
  
  // Loading States
  const [isUploading, setIsUploading] = useState(false); 
  const [isLocating, setIsLocating] = useState(false);

  // Wagmi Hooks
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const CRIME_TYPES = ["Theft", "Violence", "Harassment", "Corruption", "Cybercrime", "Other"];

  // --- NEW: AUTO-LOCATE FUNCTION ---
  const handleAutoLocate = async () => {
    setIsLocating(true);
    try {
        // Use ipapi.co (Free, no key needed for low volume)
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Location fetch failed");
        
        const data = await res.json();
        // Format: "City, Region, Country"
        const locationString = `${data.city}, ${data.region}, ${data.country_name}`;
        
        setLocation(locationString);
    } catch (error) {
        console.error("Locate Error:", error);
        alert("Could not detect location automatically. Please enter it manually.");
    } finally {
        setIsLocating(false);
    }
  };

  const uploadToPinata = async (content, type = 'file') => {
    const url = type === 'json' ? "https://api.pinata.cloud/pinning/pinJSONToIPFS" : "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let body;
    let headers = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` };
    if (type === 'json') { body = JSON.stringify(content); headers["Content-Type"] = "application/json"; } 
    else { const data = new FormData(); data.append("file", content); body = data; }
    try { const res = await fetch(url, { method: "POST", headers, body }); return (await res.json()).IpfsHash; } 
    catch (e) { console.error(e); return null; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!crimeType || !urgency) { alert("Please complete all fields."); return; }
    
    let mediaHash = null;
    if (file) { setIsUploading(true); mediaHash = await uploadToPinata(file, 'file'); setIsUploading(false); }

    const reportPayload = { crimeType, description: details, location, incidentDateTime, urgency, mediaHash };
    const SECRET_KEY = "HACKATHON_DEMO_KEY";
    const encryptedReport = CryptoJS.AES.encrypt(JSON.stringify(reportPayload), SECRET_KEY).toString();

    const reportCID = await uploadToPinata({ encryptedReport }, 'json');
    if (!reportCID) return;

    writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'submitReport', args: [reportCID] });
  };

  return (
    <div className="w-full max-w-3xl mt-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-900 to-black rounded-2xl blur opacity-30"></div>
        <div className="relative bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Submit Anonymously</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* 1. CRIME TYPE */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type of Incident</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {CRIME_TYPES.map((type) => (
                            <button key={type} type="button" onClick={() => setCrimeType(type)}
                                className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all duration-200 ${crimeType === type ? 'bg-red-900/40 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:border-neutral-600 hover:text-white'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. DESCRIPTION */}
                <div className="space-y-3">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">What Happened?</label>
                    <textarea className="w-full p-4 bg-neutral-950 text-white rounded-xl border border-neutral-800 focus:border-red-500 outline-none h-40 resize-none transition-colors placeholder-gray-600"
                        placeholder="Describe the incident in detail..." value={details} onChange={(e) => setDetails(e.target.value)} required />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* 3. DATE & TIME (Improved Styling) */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                <CalendarIcon />
                            </div>
                            <input type="datetime-local" value={incidentDateTime} onChange={(e) => setIncidentDateTime(e.target.value)} required 
                                className="w-full pl-12 pr-4 py-3 bg-neutral-950 text-white rounded-xl border border-neutral-800 focus:border-red-500 outline-none transition-colors [color-scheme:dark] cursor-pointer" />
                        </div>
                    </div>

                    {/* 4. LOCATION (With Detect Button) */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500">
                                <MapIcon />
                            </div>
                            <input type="text" placeholder="Approximate Area" value={location} onChange={(e) => setLocation(e.target.value)} required 
                                className="w-full pl-12 pr-32 py-3 bg-neutral-950 text-white rounded-xl border border-neutral-800 focus:border-red-500 outline-none transition-colors" />
                            
                            {/* THE NEW BUTTON */}
                            <button 
                                type="button"
                                onClick={handleAutoLocate}
                                disabled={isLocating}
                                className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-xs text-gray-300 rounded-lg border border-neutral-700 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLocating ? <span className="animate-spin">⌛</span> : <GpsIcon />}
                                {isLocating ? "Locating..." : "Auto-Detect"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5. URGENCY */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Urgency Level</label>
                    <div className="flex bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                        {['Low', 'Medium', 'High'].map((level) => {
                            const activeColor = level === 'Low' ? 'bg-green-900/50 text-green-300 border-green-700' : level === 'Medium' ? 'bg-orange-900/50 text-orange-300 border-orange-700' : 'bg-red-900/50 text-red-300 border-red-700';
                            return (
                                <button key={level} type="button" onClick={() => setUrgency(level)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${urgency === level ? activeColor : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 6. UPLOAD */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Evidence (Optional)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-800 border-dashed rounded-xl cursor-pointer hover:bg-neutral-800/50 hover:border-neutral-600 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {file ? (
                                <><div className="bg-red-900/20 p-2 rounded-full mb-2"><UploadIcon /></div><p className="text-sm text-green-400 font-semibold">{file.name}</p></>
                            ) : (
                                <><div className="mb-2 text-gray-500 group-hover:text-red-500"><UploadIcon /></div><p className="text-sm text-gray-400">Click to upload image</p></>
                            )}
                        </div>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                </div>

                {/* SUBMIT */}
                <button type="submit" disabled={isPending || isUploading} className="w-full py-4 mt-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50">
                    {isUploading ? 'Encrypting & Uploading...' : isPending ? 'Waiting for Wallet...' : 'Submit Encrypted Report'}
                </button>
                {isSuccess && <div className="p-4 bg-green-900/20 border border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-green-400 text-sm font-medium">Report verified on Blockchain!</span></div>}
            </form>
        </div>
    </div>
  );
}