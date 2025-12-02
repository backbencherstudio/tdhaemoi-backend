# Insoles Questionnaire API - Postman Test Examples

## Base URL
```
http://localhost:3001/api/v1/question/insoles
```

---

## 1. GET Insoles Questions

**Endpoint:** `GET /insoles/:customerId`

**Example:**
```
GET http://localhost:3001/api/v1/question/insoles/YOUR_CUSTOMER_ID_HERE
```

**Response:** Returns all questions with `current: true` marked on selected options

---

## 2. POST/PUT Insoles Answers

**Endpoint:** `POST /insoles/:customerId` or `PUT /insoles/:customerId`

**Headers:**
```
Content-Type: application/json
```

---

### Example 1: Complete Answer Format (All Questions)

```json
{
  "answer": {
    "1": {
      "id": [2],
      "ownText": {}
    },
    "2": {
      "id": [1],
      "ownText": {
        "1": "Diabetes Type 2"
      }
    },
    "3": {
      "id": [4],
      "ownText": {}
    },
    "4": {
      "1": {
        "id": 3,
        "ownText": ""
      },
      "2": {
        "id": [1, 2, 5],
        "ownText": {}
      },
      "3": {
        "id": [2, 4],
        "ownText": {}
      },
      "4": {
        "id": [3, 8],
        "ownText": {}
      }
    },
    "5": {
      "id": [2, 7],
      "ownText": {
        "7": "Chronic back pain"
      }
    },
    "6": {
      "id": [1],
      "ownText": {
        "1": "Schwindel beim Aufstehen"
      }
    },
    "7": {
      "id": [1, 2, 3],
      "ownText": {}
    },
    "8": {
      "id": [3],
      "ownText": {}
    }
  }
}
```

---

### Example 2: Minimal Answer Format

```json
{
  "answer": {
    "1": {
      "id": [1],
      "ownText": {}
    },
    "2": {
      "id": [2],
      "ownText": {}
    },
    "3": {
      "id": [3],
      "ownText": {}
    },
    "4": {
      "1": {
        "id": 1,
        "ownText": ""
      },
      "2": {
        "id": [1],
        "ownText": {}
      },
      "3": {
        "id": [1],
        "ownText": {}
      },
      "4": {
        "id": [1],
        "ownText": {}
      }
    },
    "5": {
      "id": [1],
      "ownText": {}
    },
    "6": {
      "id": [2],
      "ownText": {}
    },
    "7": {
      "id": [1],
      "ownText": {}
    },
    "8": {
      "id": [1],
      "ownText": {}
    }
  }
}
```

---

### Example 3: With Custom Text Fields

```json
{
  "answer": {
    "1": {
      "id": [2],
      "ownText": {}
    },
    "2": {
      "id": [1],
      "ownText": {
        "1": "Diabetes, High blood pressure"
      }
    },
    "3": {
      "id": [5],
      "ownText": {}
    },
    "4": {
      "1": {
        "id": 8,
        "ownText": "Started after running marathon"
      },
      "2": {
        "id": [1, 3, 13],
        "ownText": {}
      },
      "3": {
        "id": [1, 3],
        "ownText": {}
      },
      "4": {
        "id": [1, 4, 7],
        "ownText": {}
      }
    },
    "5": {
      "id": [2, 3, 7],
      "ownText": {
        "7": "Knee replacement surgery complications"
      }
    },
    "6": {
      "id": [1],
      "ownText": {
        "1": "Balance issues when standing up quickly"
      }
    },
    "7": {
      "id": [1, 2, 4],
      "ownText": {}
    },
    "8": {
      "id": [2],
      "ownText": {}
    }
  }
}
```

---

## Answer Format Explanation

### Question Structure:
- **Questions 1, 2, 3, 5, 6, 7, 8**: Simple questions
  - `id`: Array of selected option IDs `[1]` or single number `1`
  - `ownText`: Object with custom text for specific options `{ "optionId": "custom text" }`

- **Question 4**: Has nested sub-questions
  - Each sub-question (1, 2, 3, 4) has its own structure:
    - `id`: Selected option ID(s)
    - `ownText`: Custom text (string for sub-question 1, object for others)

### Key Points:
1. **Single selection**: Use `"id": [1]` or `"id": 1`
2. **Multiple selection**: Use `"id": [1, 2, 3]`
3. **Custom text**: Use `"ownText": { "optionId": "text" }` for options that allow custom input
4. **Question 4 sub-question 1**: Uses string for `ownText`: `"ownText": "text here"`
5. **Question 4 other sub-questions**: Use object for `ownText`: `"ownText": {}`

---

## Postman Setup

1. **Method**: POST or PUT
2. **URL**: `http://localhost:3001/api/v1/question/insoles/{customerId}`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body**: Select "raw" and "JSON", then paste one of the examples above
5. **Replace**: `{customerId}` with actual customer ID from your database

---

## Expected Response

**Success (200):**
```json
{
  "success": true,
  "message": "Answers saved successfully",
  "data": {
    "id": "uuid-here",
    "customerId": "customer-uuid",
    "answer": { /* your answer object */ }
  }
}
```

**Error (400/404/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

