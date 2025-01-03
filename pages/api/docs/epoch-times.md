# API Documentation: `/api/v1/epochs/times/`

## Endpoint Description

This endpoint provides detailed time and block information for a specified epoch, including timestamps for the start of voting, the end of voting, and the end of distribution. It also identifies the nearest blockchain blocks to these events, using an iterative binary search method.

markdown
Copy code

# API Documentation: `/api/v1/epochs/times/`

## Endpoint Description

This endpoint provides detailed time and block information for a specified epoch, including timestamps for the start of voting, the end of voting, and the end of distribution. It also identifies the nearest blockchain blocks to these events, using an iterative binary search method.

---

## HTTP Method

- `GET`

---

## Request Parameters

| **Parameter** | **Type** | **Required** | **Description**                                                                      |
| ------------- | -------- | ------------ | ------------------------------------------------------------------------------------ |
| `epoch`       | `string` | Yes          | The epoch number to query. Epochs are two-week periods starting from the Unix epoch. |

---

## Response

### Success Response:

- **Status Code:** `200 OK`
- **Response Body Schema:**
  ```json
  {
    "data": {
      "epoch": "string",
      "state": "string",
      "fetchedAt": "number",
      "epochTimestamps": {
        "voteStart": "number",
        "voteEnd": "number",
        "distributionEnd": "number"
      },
      "nearestBlocks": {
        "iterations": "number",
        "voteStart": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        },
        "voteEnd": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        },
        "distributionEnd": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        }
      }
    }
  }
  Example Response:
  json
  Copy code
  {
  "data": {
    "epoch": "1434",
    "state": "ended",
    "fetchedAt": 1735912766,
    "epochTimestamps": {
      "voteStart": 1734566400,
      "voteEnd": 1735171200,
      "distributionEnd": 1735776000
    },
    "nearestBlocks": {
      "iterations": 15,
      "voteStart": {
        "blockNumber": 17198984,
        "timestamp": 1734565551,
        "exact": false
      },
      "voteEnd": {
        "blockNumber": 17502242,
        "timestamp": 1735172067,
        "exact": false
      },
      "distributionEnd": {
        "blockNumber": 17804410,
        "timestamp": 1735776403,
        "exact": false
      }
    }
  }
  }
  ```

## Notes

- Block Search Iterations: The nearest block is found using an iterative binary search with a maximum of 15 iterations to balance accuracy and performance.

- State Calculation: Epochs are divided into three states based on the current timestamp: voting, distribution, and ended.

---

## HTTP Method

- `GET`

---

## Request Parameters

| **Parameter** | **Type** | **Required** | **Description**                                                                      |
| ------------- | -------- | ------------ | ------------------------------------------------------------------------------------ |
| `epoch`       | `string` | Yes          | The epoch number to query. Epochs are two-week periods starting from the Unix epoch. |

---

## Response

### Success Response:

- **Status Code:** `200 OK`
- **Response Body Schema:**
  ```json
  {
    "data": {
      "epoch": "string",
      "state": "string",
      "fetchedAt": "number",
      "epochTimestamps": {
        "voteStart": "number",
        "voteEnd": "number",
        "distributionEnd": "number"
      },
      "nearestBlocks": {
        "iterations": "number",
        "voteStart": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        },
        "voteEnd": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        },
        "distributionEnd": {
          "blockNumber": "number",
          "timestamp": "number",
          "exact": "boolean"
        }
      }
    }
  }
  ```
