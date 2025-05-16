export type Crossguard = {
  "version": "0.1.0",
  "name": "crossguard",
  "instructions": [
    {
      "name": "registerIntent",
      "accounts": [
        {
          "name": "intent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sourceChain",
          "type": "string"
        },
        {
          "name": "sourceToken",
          "type": "string"
        },
        {
          "name": "targetChain",
          "type": "string"
        },
        {
          "name": "targetToken",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "stopLoss",
          "type": "u64"
        },
        {
          "name": "takeProfit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelIntent",
      "accounts": [
        {
          "name": "intent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Intent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "sourceChain",
            "type": "string"
          },
          {
            "name": "sourceToken",
            "type": "string"
          },
          {
            "name": "targetChain",
            "type": "string"
          },
          {
            "name": "targetToken",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "stopLoss",
            "type": "u64"
          },
          {
            "name": "takeProfit",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6001,
      "name": "InvalidPrice",
      "msg": "Price must be greater than 0"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized to perform this action"
    }
  ]
};

export const IDL: Crossguard = {
  "version": "0.1.0",
  "name": "crossguard",
  "instructions": [
    {
      "name": "registerIntent",
      "accounts": [
        {
          "name": "intent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sourceChain",
          "type": "string"
        },
        {
          "name": "sourceToken",
          "type": "string"
        },
        {
          "name": "targetChain",
          "type": "string"
        },
        {
          "name": "targetToken",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "stopLoss",
          "type": "u64"
        },
        {
          "name": "takeProfit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelIntent",
      "accounts": [
        {
          "name": "intent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Intent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "sourceChain",
            "type": "string"
          },
          {
            "name": "sourceToken",
            "type": "string"
          },
          {
            "name": "targetChain",
            "type": "string"
          },
          {
            "name": "targetToken",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "stopLoss",
            "type": "u64"
          },
          {
            "name": "takeProfit",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6001,
      "name": "InvalidPrice",
      "msg": "Price must be greater than 0"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized to perform this action"
    }
  ]
}; 