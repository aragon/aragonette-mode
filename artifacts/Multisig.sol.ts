export const MultisigAbi = [
  {
    name: "AddresslistLengthOutOfBounds",
    inputs: [
      {
        internalType: "uint16",
        name: "limit",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "ApprovalCastForbidden",
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "ConfirmationCastForbidden",
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "DaoUnauthorized",
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "where",
        type: "address",
      },
      {
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "permissionId",
        type: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "DateOutOfBounds",
    inputs: [
      {
        internalType: "uint64",
        name: "limit",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "actual",
        type: "uint64",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "DelayAlreadyStarted",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "EmergencyProposalCantBeDelayed",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "InsuficientApprovals",
    inputs: [
      {
        internalType: "uint16",
        name: "approvals",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "minApprovals",
        type: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "InvalidAddresslistUpdate",
    inputs: [
      {
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "MinApprovalsOutOfBounds",
    inputs: [
      {
        internalType: "uint16",
        name: "limit",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "actual",
        type: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "NotInMemberList",
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "ProposalCreationForbidden",
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "ProposalExecutionForbidden",
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "SecondaryMetadataAlreadySet",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
    type: "error",
  },
  {
    name: "addAddresses",
    inputs: [
      {
        internalType: "address[]",
        name: "_members",
        type: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "approve",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "confirm",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "createProposal",
    inputs: [
      {
        internalType: "bytes",
        name: "_metadata",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct IDAO.Action[]",
        name: "_actions",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "_allowFailureMap",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_approveProposal",
        type: "bool",
      },
      {
        internalType: "uint64",
        name: "_startDate",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "_endDate",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "_emergency",
        type: "bool",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "execute",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "initialize",
    inputs: [
      {
        internalType: "contract IDAO",
        name: "_dao",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_members",
        type: "address[]",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "onlyListed",
            type: "bool",
          },
          {
            internalType: "uint16",
            name: "minApprovals",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "emergencyMinApprovals",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "delayDuration",
            type: "uint64",
          },
        ],
        internalType: "struct PolygonMultisig.MultisigSettings",
        name: "_multisigSettings",
        type: "tuple",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "removeAddresses",
    inputs: [
      {
        internalType: "address[]",
        name: "_members",
        type: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "startProposalDelay",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_secondaryMetadata",
        type: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "updateMultisigSettings",
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "onlyListed",
            type: "bool",
          },
          {
            internalType: "uint16",
            name: "minApprovals",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "emergencyMinApprovals",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "delayDuration",
            type: "uint64",
          },
        ],
        internalType: "struct PolygonMultisig.MultisigSettings",
        name: "_multisigSettings",
        type: "tuple",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "upgradeTo",
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "upgradeToAndCall",
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    name: "UPDATE_MULTISIG_SETTINGS_PERMISSION_ID",
    inputs: [],
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "UPGRADE_PLUGIN_PERMISSION_ID",
    inputs: [],
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "addresslistLength",
    inputs: [],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "addresslistLengthAtBlock",
    inputs: [
      {
        internalType: "uint256",
        name: "_blockNumber",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "canApprove",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "canConfirm",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "canExecute",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "dao",
    inputs: [],
    outputs: [
      {
        internalType: "contract IDAO",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "getProposal",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "executed",
        type: "bool",
      },
      {
        internalType: "uint16",
        name: "approvals",
        type: "uint16",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "minApprovals",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "snapshotBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "startDate",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "endDate",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "delayDuration",
            type: "uint64",
          },
          {
            internalType: "bool",
            name: "emergency",
            type: "bool",
          },
          {
            internalType: "uint16",
            name: "emergencyMinApprovals",
            type: "uint16",
          },
        ],
        internalType: "struct PolygonMultisig.ProposalParameters",
        name: "parameters",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct IDAO.Action[]",
        name: "actions",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "allowFailureMap",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "confirmations",
        type: "uint16",
      },
      {
        internalType: "bytes",
        name: "metadata",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "secondaryMetadata",
        type: "bytes",
      },
      {
        internalType: "uint64",
        name: "firstDelayStartTimestamp",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "hasApproved",
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "implementation",
    inputs: [],
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "isListed",
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "isListedAtBlock",
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_blockNumber",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "isMember",
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "lastMultisigSettingsChange",
    inputs: [],
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "multisigSettings",
    inputs: [],
    outputs: [
      {
        internalType: "bool",
        name: "onlyListed",
        type: "bool",
      },
      {
        internalType: "uint16",
        name: "minApprovals",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "emergencyMinApprovals",
        type: "uint16",
      },
      {
        internalType: "uint64",
        name: "delayDuration",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "pluginType",
    inputs: [],
    outputs: [
      {
        internalType: "enum IPlugin.PluginType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    name: "proposalCount",
    inputs: [],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "protocolVersion",
    inputs: [],
    outputs: [
      {
        internalType: "uint8[3]",
        name: "",
        type: "uint8[3]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    name: "proxiableUUID",
    inputs: [],
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "supportsInterface",
    inputs: [
      {
        internalType: "bytes4",
        name: "_interfaceId",
        type: "bytes4",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
