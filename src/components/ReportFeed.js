"use client";
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import CryptoJS from 'crypto-js'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export default function ReportFeed() {
  const [decryptedData, setDecryptedData] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const { data: reports, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllReports',
    watch: true,
  });

  const handleDecrypt = async (id, reportCID) => {
    try {
      setLoadingId(id);
      
      // Fetch from IPFS (Public Gateway)
      const response = await fetch(`https://ipfs.io/ipfs/${reportCID}`);
      const json = await response.json();

      // Decrypt (Key must match Form)
      const SECRET_KEY = "HACKATHON_DEMO_KEY"; 
      const bytes = CryptoJS.AES.decrypt(json.encryptedReport, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) throw new Error("Decryption failed");

      setDecryptedData(prev => ({ ...prev, [id]: JSON.parse(originalText) }));

    } catch (e) {
      console.error(e);
      alert("Failed to decrypt. Ensure you are viewing a NEW report created with this version.");
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading reports (Check Admin Wallet).</div>;
  if (!reports || reports.length === 0) return <div>No reports.</div>;

  return (
    <div className="w-full max-w-4xl mt-12 mb-20 grid gap-6">
      {[...reports].reverse().map((report, index) => {
        const reportId = report.id.toString();
        const data = decryptedData[reportId];
        
        return (
          <div key={index} className="bg-neutral-800 p-6 rounded border border-neutral-700">
            <div className="text-gray-500 text-xs mb-2">ID: {reportId} | CID: {report.reportCID}</div>
            
            {data ? (
              <div className="bg-neutral-900 p-4 rounded">
                <p className="text-green-400 font-bold">{data.description}</p>
                <p className="text-gray-400 text-sm">📍 {data.location}</p>
                {data.mediaHash && (
                    <img src={`https://ipfs.io/ipfs/${data.mediaHash}`} className="mt-2 h-32 rounded" />
                )}
              </div>
            ) : (
              <button onClick={() => handleDecrypt(reportId, report.reportCID)} disabled={loadingId === reportId} className="bg-neutral-700 text-white px-4 py-2 rounded w-full">
                {loadingId === reportId ? "Decrypting..." : "🔐 Decrypt Data"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}