"use client";
import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

// --- ICONS ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const UnlockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

const generateMockData = (id) => {
    const numId = Number(id);
    const types = ["Theft", "Violence", "Cybercrime", "Harassment"];
    const locs = ["Andheri East, Mumbai", "Connaught Place, Delhi", "Koramangala, Bangalore"];
    return {
        crimeType: types[numId % types.length],
        urgency: ["High", "Medium", "Low"][numId % 3],
        location: locs[numId % locs.length],
        incidentDateTime: new Date().toISOString(),
        description: `(DEMO DATA) Automated decrypted content for case #${id}. This confirms the integrity of the encryption pipeline.`,
        mediaHash: null 
    };
};

export default function ReportFeed() {
  const [decryptedData, setDecryptedData] = useState({});
  const [reportStatuses, setReportStatuses] = useState({}); 
  const [loadingId, setLoadingId] = useState(null);
  const [isDecryptingAll, setIsDecryptingAll] = useState(false);
  const [filter, setFilter] = useState('ALL'); 
  const [localReports, setLocalReports] = useState([]);

  // 1. Fetch Blockchain Reports
  const { data: blockchainReports } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllReports',
    watch: true,
  });

  // 2. Load Local & Statuses
  useEffect(() => {
    const savedStatus = localStorage.getItem('veil_admin_statuses');
    if (savedStatus) setReportStatuses(JSON.parse(savedStatus));

    const savedReports = localStorage.getItem('veil_local_reports');
    if (savedReports) setLocalReports(JSON.parse(savedReports));
  }, []);

  const updateStatus = (id, status) => {
    const newStatuses = { ...reportStatuses, [id]: status };
    setReportStatuses(newStatuses);
    localStorage.setItem('veil_admin_statuses', JSON.stringify(newStatuses));
  };

  // 3. Decrypt (Simulated)
  const handleDecrypt = async (id, reportCID) => {
    setLoadingId(id);
    
    // Check if we have LOCAL data for this ID first
    const localMatch = localReports.find(r => r.id.toString() === id.toString());

    setTimeout(() => {
        if (localMatch && localMatch.demoDetails) {
            setDecryptedData(prev => ({ ...prev, [id]: localMatch.demoDetails }));
        } else {
            setDecryptedData(prev => ({ ...prev, [id]: generateMockData(id) }));
        }
        setLoadingId(null);
    }, 1200);
  };

  const handleDecryptAll = () => {
    setIsDecryptingAll(true);
    setTimeout(() => {
        const newData = {};
        allReports.forEach(report => {
            const id = report.id.toString();
            // Check local match first
            const localMatch = localReports.find(r => r.id.toString() === id);
            if (!decryptedData[id]) {
                newData[id] = (localMatch && localMatch.demoDetails) ? localMatch.demoDetails : generateMockData(id);
            }
        });
        setDecryptedData(prev => ({ ...prev, ...newData }));
        setIsDecryptingAll(false);
    }, 2000);
  };

  // Merge Arrays (Blockchain + Local)
  const allReports = [...(localReports || []), ...(blockchainReports || [])];

  // Filtering
  const getFilteredReports = () => {
    let processed = [...allReports].reverse(); // Newest first
    if (filter === 'ALL') return processed;
    return processed.filter(report => {
        const id = report.id.toString();
        const data = decryptedData[id];
        const status = reportStatuses[id];

        if (filter === 'SOLVED') return status === 'SOLVED';
        if (filter === 'SPAM') return status === 'SPAM';
        
        if (!data) return false; 
        if (filter === 'HIGH') return data.urgency === 'High';
        if (filter === 'MEDIUM') return data.urgency === 'Medium';
        if (filter === 'LOW') return data.urgency === 'Low';
        return true;
    });
  };

  const displayReports = getFilteredReports();

  return (
    <div className="w-full max-w-5xl mt-8 mb-20">
      
      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Reports</p>
            <p className="text-2xl font-bold text-white">{allReports.length}</p>
        </div>
        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-orange-500 uppercase font-bold">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{allReports.length - Object.keys(reportStatuses).length}</p>
        </div>
        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-green-500 uppercase font-bold">Solved</p>
            <p className="text-2xl font-bold text-green-400">{Object.values(reportStatuses).filter(s => s === 'SOLVED').length}</p>
        </div>
        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-red-500 uppercase font-bold">Spam</p>
            <p className="text-2xl font-bold text-red-400">{Object.values(reportStatuses).filter(s => s === 'SPAM').length}</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-800 w-full md:w-auto">
            <div className="flex items-center px-3 text-gray-500"><FilterIcon /></div>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'SOLVED', 'SPAM'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-neutral-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                    {f}
                </button>
            ))}
          </div>
          <button onClick={handleDecryptAll} disabled={isDecryptingAll || allReports.length === 0}
            className="w-full md:w-auto px-6 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {isDecryptingAll ? 'Decrypting Ledger...' : <><UnlockIcon /> Decrypt All</>}
          </button>
      </div>

      {/* LIST */}
      <div className="grid gap-6">
        {displayReports.map((report, index) => {
          const reportId = report.id.toString();
          const data = decryptedData[reportId];
          const status = reportStatuses[reportId];
          const isSolved = status === 'SOLVED';
          const isSpam = status === 'SPAM';
          
          return (
            <div key={index} className={`relative p-6 rounded-xl border transition-all duration-300 ${isSolved ? 'bg-green-900/10 border-green-900/30' : isSpam ? 'bg-red-900/10 border-red-900/30 opacity-60' : 'bg-neutral-800 border-neutral-700 shadow-xl'}`}>
                {isSolved && <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-black px-2 py-1 rounded uppercase">SOLVED</div>}
                {isSpam && <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded uppercase">SPAM</div>}

                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-mono text-gray-500">CASE ID: #{reportId}</span>
                        <span className="text-[10px] text-gray-600 font-mono">{new Date(Number(report.timestamp) * 1000).toLocaleString()}</span>
                    </div>
                </div>

                {data ? (
                  <div className="animate-in fade-in">
                    <div className="flex gap-2 mb-4">
                        <span className="bg-neutral-700 text-white text-xs px-2 py-1 rounded font-bold">{data.crimeType}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold border ${data.urgency === 'High' ? 'text-red-400 border-red-900 bg-red-900/20' : data.urgency === 'Medium' ? 'text-orange-400 border-orange-900 bg-orange-900/20' : 'text-green-400 border-green-900 bg-green-900/20'}`}>{data.urgency} Priority</span>
                    </div>
                    <p className="text-gray-200 mb-4 leading-relaxed">{data.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                         <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800"><p className="text-[10px] text-gray-500 uppercase font-bold">Location</p><p className="text-sm text-gray-300">{data.location}</p></div>
                         <div className="bg-neutral-900/50 p-3 rounded border border-neutral-800"><p className="text-[10px] text-gray-500 uppercase font-bold">Time</p><p className="text-sm text-gray-300">{new Date(data.incidentDateTime).toLocaleString()}</p></div>
                    </div>
                    <div className="w-full h-40 bg-neutral-900 rounded overflow-hidden border border-neutral-700 mb-4 relative">
                        <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(data.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} style={{ filter: "invert(90%) hue-rotate(180deg) contrast(90%)" }}></iframe>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-neutral-700">
                        <button onClick={() => updateStatus(reportId, 'SOLVED')} disabled={isSolved} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${isSolved ? 'bg-green-600 text-white' : 'bg-neutral-700 hover:bg-green-600 text-white'}`}><CheckIcon /> Approve</button>
                        <button onClick={() => updateStatus(reportId, 'SPAM')} disabled={isSpam} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${isSpam ? 'bg-neutral-800 text-red-500 border border-red-900' : 'bg-neutral-900 border border-neutral-700 hover:border-red-500 hover:text-red-500'}`}><XIcon /> Spam</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleDecrypt(reportId, report.reportCID)} disabled={loadingId === reportId || isDecryptingAll} className="w-full h-40 bg-neutral-900/50 border border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-neutral-900 transition-all group">
                    {loadingId === reportId || isDecryptingAll ? <span className="text-red-500 font-mono animate-pulse">Decrypting...</span> : <><span className="text-3xl grayscale group-hover:grayscale-0">🔐</span><div className="text-center"><p className="text-gray-400 font-mono text-sm">Encrypted Data</p><p className="text-red-500 text-xs mt-1 opacity-0 group-hover:opacity-100">Click to Decrypt</p></div></>}
                  </button>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}