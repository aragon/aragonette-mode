# API Documentation: `/api/v1/voters/[voter]`

## Endpoint Description

This endpoint retrieves detailed voting data for a specific voter address, including voting records for individual gauges and associated metadata.

---

## HTTP Method

- `GET`

---

## Request Parameters

| **Parameter**    | **Type** | **Required** | **Description**                                                    |
| ---------------- | -------- | ------------ | ------------------------------------------------------------------ |
| `voter`          | `string` | Yes          | Address of the voter whose data is being requested.                |
| `votingContract` | `string` | Yes          | Address of the voting contract.                                    |
| `gauge`          | `string` | No           | Specific gauge address or `"all"` to fetch data for all gauges.    |
| `epoch`          | `string` | No           | Epoch number or `"all"` to specify the voting period.              |
| `fromBlock`      | `string` | No           | Block number from which to start fetching data (default is `"0"`). |

---

## Response

### Success Response:

- **Status Code:** `200 OK`
- **Response Body Schema:**
  ```json
  {
    "data": {
      "address": "string",
      "votingContract": "string",
      "gaugeVotes": [
        {
          "gauge": "string",
          "totalVotes": "string",
          "latestVotes": [
            {
              "tokenId": "string",
              "votes": "string",
              "timestamp": "string",
              "logIndex": "number",
              "epoch": "string",
              "transactionHash": "string",
              "blockNumber": "number"
            }
          ]
        }
      ]
    }
  }
  ```
