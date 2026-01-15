"use client";
import CryptoJS from 'crypto-js';
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export default function ReportForm() {
  const [details, setDetails] = useState('');
  
  // Wagmi hooks for writing to blockchain
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  // Wait for transaction to finish
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash, 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. The "Secret Key" (In a real app, this is the Authority's Public Key)
    // For the Hackathon, we hardcode a secret phrase.
    const SECRET_KEY = "HACKATHON_DEMO_KEY"; 

    // 2. Encrypt the text
    const encryptedText = CryptoJS.AES.encrypt(details, SECRET_KEY).toString();

    console.log("Original:", details);
    console.log("Encrypted:", encryptedText); // Check console to see the gibberish

    // 3. Send the ENCRYPTED text to the Blockchain
    const dummyImageHash = "QmTestHash123"; 

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitReport',
      args: [encryptedText, dummyImageHash], // <--- We send the gibberish now
      // gas: BigInt(600000), 
    });
  };

  return (
    <div className="w-full max-w-2xl mt-8 p-6 bg-neutral-800 rounded-xl border border-neutral-700">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Submit Anonymous Report</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <textarea
          className="w-full p-4 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-red-500 outline-none h-32"
          placeholder="Describe the incident... (This will be encrypted)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />

        <button 
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
        >
          {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Processing on Chain...' : 'Submit Report'}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="text-red-400 text-sm mt-2">Error: {error.message}</div>
        )}
        {isSuccess && (
          <div className="text-green-400 text-sm mt-2">
            ✅ Report Submitted! <br/>
            <a href={`https://amoy.polygonscan.com/tx/${hash}`} target="_blank" className="underline">View on Explorer</a>
          </div>
        )}
      </form>
    </div>
  );
}