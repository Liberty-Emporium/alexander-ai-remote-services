const OpenAI = require('openai');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are an expert computer repair technician specializing exclusively in desktop and laptop computers. You have 20+ years of hands-on experience diagnosing hardware failures, software issues, overheating problems, power supply failures, GPU/CPU faults, storage failures, RAM issues, motherboard problems, OS corruption, driver conflicts, and malware infections.

When a user describes a computer problem (with or without an image), you analyze it and return a structured JSON diagnosis with the top 3 most likely causes. You ONLY diagnose desktop and laptop computers — if asked about phones, tablets, or other devices, politely decline.

You MUST respond with ONLY valid JSON in the following exact format — no markdown, no explanation, no extra text:

{
  "summary": "Brief 1-2 sentence overview of what you're seeing",
  "device_assessment": "Short assessment of the device type and condition",
  "top_causes": [
    {
      "rank": 1,
      "cause": "Name of the issue",
      "confidence": 85,
      "difficulty": "Easy|Moderate|Advanced|Professional",
      "estimated_cost": "$0–50",
      "description": "Detailed explanation of why this is likely the cause",
      "fix_guide": [
        "Step 1: ...",
        "Step 2: ...",
        "Step 3: ...",
        "Step 4: ...",
        "Step 5: ..."
      ],
      "parts_needed": ["Part 1", "Part 2"],
      "tools_needed": ["Tool 1", "Tool 2"],
      "warning": "Any safety warning or when to stop and call a pro (null if none)"
    }
  ],
  "urgent": false,
  "urgent_reason": null,
  "professional_recommended": false,
  "professional_reason": null,
  "data_loss_risk": false,
  "data_loss_reason": null
}

Rules:
- confidence must be an integer 1–100
- difficulty must be exactly one of: Easy, Moderate, Advanced, Professional
- estimated_cost should be a price range string
- fix_guide should have 4–8 steps
- parts_needed and tools_needed are arrays (empty array if none needed)
- urgent, professional_recommended, data_loss_risk are booleans
- Return null for warning/urgent_reason/professional_reason/data_loss_reason if not applicable
- Always include exactly 3 items in top_causes, ranked by confidence descending`;

/**
 * Diagnose a computer problem using OpenAI Vision (or text-only if no image).
 *
 * @param {Object} params
 * @param {string} params.description - User's description of the problem
 * @param {string|null} params.imageBase64 - Base64-encoded image data
 * @param {string|null} params.imageMimeType - MIME type of the image
 * @param {string} params.deviceType - "desktop", "laptop", or "unknown"
 * @param {string} params.deviceBrand - Brand name or "unknown"
 * @param {string[]} params.symptoms - Array of symptom strings
 * @returns {Promise<Object>} Parsed diagnosis object
 */
async function diagnoseProblem({ description, imageBase64, imageMimeType, deviceType, deviceBrand, symptoms }) {
  const client = getOpenAIClient();

  const userTextContent = buildUserPrompt({ description, deviceType, deviceBrand, symptoms });

  const messageContent = [];

  // Add image if provided
  if (imageBase64 && imageMimeType) {
    messageContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${imageMimeType};base64,${imageBase64}`,
        detail: 'high',
      },
    });
  }

  messageContent.push({
    type: 'text',
    text: userTextContent,
  });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: messageContent },
    ],
    max_tokens: 2000,
    temperature: 0.3, // Lower temperature for more consistent, reliable diagnoses
  });

  const rawContent = response.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error('OpenAI returned an empty response');
  }

  // Strip any accidental markdown code fences
  const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let diagnosis;
  try {
    diagnosis = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[OpenAI] Failed to parse response as JSON:', rawContent);
    throw new Error('AI returned an invalid response format. Please try again.');
  }

  // Validate required structure
  if (!diagnosis.top_causes || !Array.isArray(diagnosis.top_causes) || diagnosis.top_causes.length === 0) {
    throw new Error('AI diagnosis is missing required fields. Please try again.');
  }

  return diagnosis;
}

function buildUserPrompt({ description, deviceType, deviceBrand, symptoms }) {
  const lines = [];

  lines.push('Please diagnose the following computer problem:');
  lines.push('');
  lines.push(`Device Type: ${deviceType}`);
  lines.push(`Brand: ${deviceBrand}`);
  lines.push(`Problem Description: ${description}`);

  if (symptoms && symptoms.length > 0) {
    lines.push(`Observed Symptoms: ${symptoms.join(', ')}`);
  }

  lines.push('');
  lines.push('Provide your diagnosis in the exact JSON format specified. Be thorough and practical.');

  return lines.join('\n');
}

module.exports = { diagnoseProblem, getOpenAIClient };
