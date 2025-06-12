# API Documentation

## Resume Generation API

### POST /api/generate

Generate an optimized resume based on a job description using AI.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "resume": "string", // Required: The original resume text
  "jobDescription": "string" // Required: The job description to optimize for
}
```

**Constraints:**
- `resume`: Maximum 10,000 characters
- `jobDescription`: Maximum 5,000 characters

#### Response

**Success Response (200 OK):**
```json
{
  "optimizedContent": "string", // The AI-optimized resume
  "analysis": {
    "keywords": ["string"], // Keywords extracted from job description
    "relevantSections": ["string"], // Resume sections that match keywords
    "relevanceScore": number, // Score 0-100 indicating match quality
    "skillRequirements": {
      "required": ["string"], // Required skills from job description
      "preferred": ["string"], // Preferred skills from job description
      "experience": ["string"] // Experience requirements
    },
    "suggestions": ["string"] // Improvement suggestions
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "error": "Resume is required and must be a string"
  }
  ```
  ```json
  {
    "error": "Job description is required and must be a string"
  }
  ```
  ```json
  {
    "error": "Resume is too long. Maximum 10,000 characters allowed."
  }
  ```
  ```json
  {
    "error": "Input too large. Please provide a shorter resume or job description."
  }
  ```

- **429 Too Many Requests**
  ```json
  {
    "error": "Rate limit exceeded. Please try again later."
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Failed to generate resume content. Please try again."
  }
  ```
  ```json
  {
    "error": "API configuration error. Please contact support."
  }
  ```

#### Rate Limiting

- **Limit:** 10 requests per minute per IP address
- **Window:** 60 seconds rolling window
- **Headers:** None (rate limit info not exposed)

#### Example Usage

**JavaScript/Fetch:**
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resume: 'John Doe\nSoftware Engineer...',
    jobDescription: 'Looking for a Senior React Developer...'
  })
});

const data = await response.json();
console.log(data.optimizedContent);
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "John Doe\nSoftware Engineer...",
    "jobDescription": "Looking for a Senior React Developer..."
  }'
```

#### Implementation Details

1. **Keyword Extraction:** 
   - Extracts up to 30 relevant keywords from job description
   - Filters out common stop words
   - Prioritizes technical terms and skills

2. **Resume Analysis:**
   - Identifies which keywords appear in the resume
   - Calculates relevance score based on keyword matches
   - Provides section-by-section analysis

3. **AI Optimization:**
   - Uses OpenAI GPT-3.5-turbo (configurable via OPENAI_MODEL env var)
   - Maintains factual accuracy while optimizing for keywords
   - Preserves original information while enhancing presentation

4. **Cost Management:**
   - Token counting before API calls
   - Cost estimation logging
   - Automatic fallback for large inputs

#### Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key

Optional:
- `OPENAI_MODEL`: Model to use (default: "gpt-3.5-turbo")

#### Security Considerations

1. **Input Validation:** All inputs are validated for type and size
2. **Rate Limiting:** Prevents abuse and controls costs
3. **Error Handling:** Sensitive error details are not exposed to clients
4. **API Key Security:** OpenAI API key is never exposed to client 