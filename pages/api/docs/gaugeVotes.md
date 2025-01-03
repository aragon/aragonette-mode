# API Documentation: `/api/v1/votes/gaugeVotes`

## Endpoint Description

This endpoint provides summarized voting data for one or more gauges associated with a specific voting contract. The data includes details about individual voters, total votes for gauges, and associated metadata. **Note**: Fetching data for many gauges or across multiple epochs can be resource-intensive and may result in long response times. It is recommended to split requests by gauge to improve performance.

---

## HTTP Method

- `GET`

---

## Request Parameters

| **Parameter**    | **Type** | **Required** | **Description**                                                                                                                                                                 |
| ---------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `votingContract` | `string` | Yes          | Address of the voting contract.                                                                                                                                                 |
| `epoch`          | `string` | Yes          | Epoch number or `"all"` to specify the voting period.                                                                                                                           |
| `gauge`          | `string` | Yes          | Specific gauge address or `"all"` to fetch data for all gauges.                                                                                                                 |
| `fromBlock`      | `string` | No           | Block number from which to start fetching data (default is `"0"`).                                                                                                              |
| `toBlock`        | `string` | No           | Block number to fetch data until. Best practice is to fetch the latest voting window end block using the epoch time endpoint to ensure current voting doesn't pollute your data |

---

## Response

### Success Response:

- **Status Code:** `200 OK`
- **Response Body Schema:**
  ```json
  {
    "data": [
      {
        "gauge": "string",
        "votingContract": "string",
        "epoch": "string",
        "title": "string",
        "totalVotes": "string",
        "votes": [
          {
            "voter": "string",
            "votes": "string"
          }
        ]
      }
    ]
  }
  ```
