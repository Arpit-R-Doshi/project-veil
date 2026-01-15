// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectVeil {

    // --------------------
    // DATA STRUCTURES
    // --------------------

    struct Report {
        uint256 id;            // Auto-incremented report ID
        address reporter;      // Wallet that submitted (can be anonymized later)
        string reportCID;      // IPFS CID of encrypted JSON
        uint256 timestamp;     // Block timestamp
    }

    // --------------------
    // STATE VARIABLES
    // --------------------

    Report[] private reports;     // Stored reports (private for gas + safety)
    address public authority;     // Admin / Authority address

    // --------------------
    // EVENTS
    // --------------------

    event NewReportSubmitted(
        uint256 indexed id,
        address indexed reporter,
        string reportCID,
        uint256 timestamp
    );

    // --------------------
    // MODIFIERS
    // --------------------

    modifier onlyAuthority() {
        require(msg.sender == authority, "Not authorized");
        _;
    }

    // --------------------
    // CONSTRUCTOR
    // --------------------

    constructor() {
        authority = msg.sender;
    }

    // --------------------
    // CORE FUNCTION
    // --------------------

    /**
     * @notice Submit a crime report by storing its IPFS CID
     * @param _reportCID IPFS CID pointing to encrypted report JSON
     */
    function submitReport(string calldata _reportCID) external {
        require(bytes(_reportCID).length > 0, "CID cannot be empty");

        uint256 reportId = reports.length;

        reports.push(
            Report({
                id: reportId,
                reporter: msg.sender,
                reportCID: _reportCID,
                timestamp: block.timestamp
            })
        );

        emit NewReportSubmitted(
            reportId,
            msg.sender,
            _reportCID,
            block.timestamp
        );
    }

    // --------------------
    // VIEW FUNCTIONS
    // --------------------

    /// @notice Returns total number of reports
    function getReportsCount() external view returns (uint256) {
        return reports.length;
    }

    /// @notice Returns a report by index (for dashboards)
    function getReport(uint256 index) external view returns (Report memory) {
        require(index < reports.length, "Invalid report index");
        return reports[index];
    }

    /// @notice Returns all reports (authority only)
    function getAllReports() external view onlyAuthority returns (Report[] memory) {
        return reports;
    }
}
