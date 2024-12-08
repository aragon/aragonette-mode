# API Documentation: `/api/v1/gauges/`

## Endpoint Description

This endpoint provides details about all gauges associated with a specific voting contract. It retrieves metadata, including addresses, descriptions, and resources, for each gauge.

---

## HTTP Method

- `GET`

---

## Request Parameters

| **Parameter**    | **Type** | **Required** | **Description**                                                                                   |
| ---------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `votingContract` | `string` | No           | The address of the voting contract. If not provided, the default voting contract address is used. |

---

## Response

### Success Response:

- **Status Code:** `200 OK`
- **Response Body Schema:**
  ```json
  {
    "data": [
      {
        "address": "string",
        "ipfsURI": "string",
        "metadata": {
          "name": "string",
          "description": "string",
          "logo": "string",
          "resources": [
            {
              "field": "string",
              "value": "string",
              "url": "string"
            }
          ]
        }
      }
    ]
  }
  ```
