"use client";
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import CryptoJS from 'crypto-js'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export default function ReportForm() {
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [crimeType, setCrimeType] = useState("");
  const [incidentDate, setIncidentDate] = useState("");

  const [incidentDateTime, setIncidentDateTime] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
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
  const uploadJSONToPinata = async (jsonData) => {
  try {
    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: JSON.stringify(jsonData),
      }
    );
    console.log("PINATA JWT:", process.env.NEXT_PUBLIC_PINATA_JWT);


    const resData = await res.json();
    return resData.IpfsHash; // Returns CID
  } catch (error) {
    console.error("JSON upload failed:", error);
    alert("Failed to upload report to IPFS");
    return null;
  }
};



  // --- 2. Main Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // A. Upload Image First (If one exists)
    let mediaHash = null;
    
    if (file) {
      setIsUploading(true);
      const ipfsHash = await uploadToPinata(file);
      setIsUploading(false);
      
      if (!ipfsHash) return; // Stop if upload failed
      mediaHash = ipfsHash;
    }

    // B. Create Report Payload
    const reportPayload = {
  category,
  description,
  location,
  incidentDate,
  urgency,
  mediaHash,
};
const SECRET_KEY = "HACKATHON_DEMO_KEY";

const encryptedReport = CryptoJS.AES.encrypt(
  JSON.stringify(reportPayload),
  SECRET_KEY
).toString();
console.log("Encrypted report:", encryptedReport);
const reportCID = await uploadJSONToPinata({
  encryptedReport,
});

console.log("Report CID:", reportCID);



    // C. Send to Blockchain
     writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitReport',
       args: [JSON.stringify(reportPayload), mediaHash], 
       gas: BigInt(5000000),
       // Note: We removed the hardcoded gas limit as per your fix
     });
  };

  return (
    <div className="w-full max-w-2xl mt-8 p-6 bg-neutral-800 rounded-xl border border-neutral-700">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Submit Anonymous Report</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Crime Type Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Crime Type *</label>
          <select
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            required
            className="w-full p-3 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-red-500 outline-none"
          >
            <option value="">Select a crime type</option>
            <option value="Bribery / Corruption">Bribery / Corruption</option>
            <option value="Harassment / Threat">Harassment / Threat</option>
            <option value="Cybercrime">Cybercrime</option>
            <option value="Theft">Theft</option>
            <option value="Violence">Violence</option>
            <option value="Workplace Misconduct">Workplace Misconduct</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Incident Date & Time */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Incident Date & Time *</label>
          <input
            type="datetime-local"
            value={incidentDateTime}
            onChange={(e) => setIncidentDateTime(e.target.value)}
            required
            className="w-full p-3 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-red-500 outline-none"
          />
          <p className="text-xs text-gray-500">Approximate values are acceptable</p>
        </div>

        {/* Urgency Level */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Urgency Level *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="radio"
                name="urgency"
                value="Low"
                checked={urgency === 'Low'}
                onChange={(e) => setUrgency(e.target.value)}
                required
                className="w-4 h-4"
              />
              Low
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="radio"
                name="urgency"
                value="Medium"
                checked={urgency === 'Medium'}
                onChange={(e) => setUrgency(e.target.value)}
                required
                className="w-4 h-4"
              />
              Medium
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="radio"
                name="urgency"
                value="High"
                checked={urgency === 'High'}
                onChange={(e) => setUrgency(e.target.value)}
                required
                className="w-4 h-4"
              />
              High
            </label>
          </div>
        </div>

        {/* Approximate Location */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Approximate Location *</label>
          <input
            type="text"
            placeholder="e.g., Near Sector 7 traffic signal or Online / Digital"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full p-3 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-red-500 outline-none placeholder-gray-500"
          />
          <p className="text-xs text-gray-500">Do not provide exact address (approximate location only)</p>
        </div>

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