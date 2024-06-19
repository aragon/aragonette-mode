export const MultisigAbi = [
  {
    inputs: [],
    name: "EmptyMessage",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "candidate",
        type: "address",
      },
      { indexed: false, internalType: "bytes", name: "message", type: "bytes" },
      {
        indexed: false,
        internalType: "bytes",
        name: "socialUrl",
        type: "bytes",
      },
    ],
    name: "CandidateRegistered",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "candidateAddresses",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "candidateCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "candidates",
    outputs: [
      { internalType: "bytes", name: "message", type: "bytes" },
      { internalType: "bytes", name: "socialUrl", type: "bytes" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCandidateAddresses",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "_message", type: "bytes" },
      { internalType: "bytes", name: "_socialUrl", type: "bytes" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
