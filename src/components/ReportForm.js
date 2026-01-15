"use client";
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import CryptoJS from 'crypto-js'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export default function ReportForm() {
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null); // Store the selected file
  const [isUploading, setIsUploading] = useState(false); // Loading state for IPFS

  // Wagmi hooks
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash, 
  });

  // --- 1. Helper Function to Upload to Pinata ---
  const uploadToPinata = async (fileToUpload) => {
    try {
      const data = new FormData();
      data.append("file", fileToUpload);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: data,
      });

      const resData = await res.json();
      return resData.IpfsHash; // Returns "Qm..."
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image to IPFS");
      return null;
    }
  };

  // --- 2. Main Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // A. Upload Image First (If one exists)
    let mediaHash = "No Media";
    
    if (file) {
      setIsUploading(true);
      const ipfsHash = await uploadToPinata(file);
      setIsUploading(false);
      
      if (!ipfsHash) return; // Stop if upload failed
      mediaHash = ipfsHash;
    }

    // B. Encrypt Text
    const SECRET_KEY = "HACKATHON_DEMO_KEY"; 
    const encryptedText = CryptoJS.AES.encrypt(details, SECRET_KEY).toString();

    // C. Send to Blockchain
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitReport',
      args: [encryptedText, mediaHash], 
      gas: BigInt(5000000),
      // Note: We removed the hardcoded gas limit as per your fix
    });
  };

  return (
    <div className="w-full max-w-2xl mt-8 p-6 bg-neutral-800 rounded-xl border border-neutral-700">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Submit Anonymous Report</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Text Area */}
        <textarea
          className="w-full p-4 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-red-500 outline-none h-32"
          placeholder="Describe the incident... (Encrypted)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />

        {/* File Input */}
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Attach Evidence (Optional)</label>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-900 file:text-red-100 hover:file:bg-red-800"
            />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isPending || isConfirming || isUploading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
        >
          {isUploading ? 'Uploading to IPFS...' : 
           isPending ? 'Confirm in Wallet...' : 
           isConfirming ? 'Processing on Chain...' : 
           'Submit Report'}
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