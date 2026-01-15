export const CONTRACT_ADDRESS = "0xd2AB1e24b6FA5d80f68DE321a65CdA0FF723F53D";

export const CONTRACT_ABI = [
	{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
			{ "indexed": true, "internalType": "address", "name": "reporter", "type": "address" },
			{ "indexed": false, "internalType": "string", "name": "reportCID", "type": "string" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "NewReportSubmitted",
		"type": "event"
	},
	{
		"inputs": [{ "internalType": "string", "name": "_reportCID", "type": "string" }],
		"name": "submitReport",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "authority",
		"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllReports",
		"outputs": [
			{
				"components": [
					{ "internalType": "uint256", "name": "id", "type": "uint256" },
					{ "internalType": "address", "name": "reporter", "type": "address" },
					{ "internalType": "string", "name": "reportCID", "type": "string" },
					{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }
				],
				"internalType": "struct ProjectVeil.Report[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getReportsCount",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	}
];