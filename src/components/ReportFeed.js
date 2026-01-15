"use client";
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import CryptoJS from 'crypto-js'; // Import crypto
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export default function ReportFeed() {
  const [decryptedReports, setDecryptedReports] = useState({}); // Store decrypted texts

  const { data: reports, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllReports',
    watch: true,
  });

  // Function to decrypt a specific report
  const decryptReport = (id, encryptedText) => {
    try {
      const SECRET_KEY = "HACKATHON_DEMO_KEY"; // Must match the Form key
      const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      
      // Save the result to state
      setDecryptedReports(prev => ({ ...prev, [id]: originalText }));
    } catch (e) {
      alert("Failed to decrypt! Key might be wrong.");
    }
  };

  if (isLoading) return <div className="text-white mt-10">Loading reports...</div>;
  if (!reports || reports.length === 0) return <div className="text-gray-500 mt-10">No reports yet.</div>;

  return (
    <div className="w-full max-w-4xl mt-12 mb-20">
      <h2 className="text-3xl font-bold mb-6 text-red-500 border-b border-red-800 pb-2">
        Incoming Reports (Encrypted)
      </h2>

      <div className="grid gap-6">
        {[...reports].reverse().map((report, index) => {
          const reportId = report.id.toString();
          const isDecrypted = decryptedReports[reportId];

          return (
            <div key={index} className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 shadow-lg">
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-400 bg-neutral-900 px-2 py-1 rounded">
                  ID: {reportId}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(Number(report.timestamp) * 1000).toLocaleString()}
                </span>
              </div>

              <div className="mb-2 text-sm text-red-400 font-mono">
                Reporter: {report.reporter.slice(0,6)}...{report.reporter.slice(-4)}
              </div>

              {/* The Content Box */}
              <div className="bg-neutral-900 p-4 rounded mb-4">
                {isDecrypted ? (
                  // If decrypted, show the real text in Green
                  <p className="text-green-400 font-bold">{isDecrypted}</p>
                ) : (
                  // If not, show the Encrypted Gibberish
                  <p className="text-gray-500 text-xs break-all font-mono opacity-50">
                    🔒 {report.encryptedDetails.substring(0, 50)}...
                  </p>
                )}
              </div>

              {/* Decrypt Button (Simulating Admin Action) */}
              {!isDecrypted && (
                <button 
                  onClick={() => decryptReport(reportId, report.encryptedDetails)}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1 rounded text-sm border border-neutral-600"
                >
                  🔐 Decrypt Data (Authority Only)
                </button>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}