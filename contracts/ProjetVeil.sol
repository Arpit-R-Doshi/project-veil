// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectVeil {
    
    // --- STRUCTURES ---
    struct Report {
        uint256 id;
        address reporter;       // Who submitted it (Wallet Address)
        string encryptedDetails; // The text report (Encrypted string)
        string mediaHash;       // IPFS Hash for images/video
        uint256 timestamp;      // When it happened
    }

    // --- STATE VARIABLES ---
    Report[] public reports;    // A list of all reports
    address public authority;   // The Admin (Police) address

    // --- EVENTS (For the frontend to listen to) ---
    event NewReportSubmitted(uint256 indexed id, address indexed reporter, uint256 timestamp);

    // --- CONSTRUCTOR ---
    // This runs once when we deploy the contract.
    constructor() {
        authority = msg.sender; // The person who deploys this is the Authority
    }

    // --- FUNCTIONS ---

    // 1. Submit a new Crime Report
    function submitReport(string memory _encryptedDetails, string memory _mediaHash) public {
        
        // Create the report object
        Report memory newReport = Report({
            id: reports.length,
            reporter: msg.sender,
            encryptedDetails: _encryptedDetails,
            mediaHash: _mediaHash,
            timestamp: block.timestamp
        });

        // Add to the list
        reports.push(newReport);

        // Trigger an alert (Event)
        emit NewReportSubmitted(newReport.id, msg.sender, block.timestamp);
    }

    // 2. Fetch all reports (For the Dashboard)
    function getAllReports() public view returns (Report[] memory) {
        return reports;
    }

    // 3. Get total count of reports
    function getReportsCount() public view returns (uint256) {
        return reports.length;
    }
}