import dotenv from 'dotenv'
dotenv.config()

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function parseNeedWithGemini(rawText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const result=await model.generateContent(`You are a disaster relief data analyst specialized in extracting structured information from emergency field reports.Your task is to return only a valid JSON object from the input received.Do not use markdown. Do not use code blocks. Do not use backticks. Return raw JSON only.Do not wrap the response in markdown code blocks. Do not add any explanation before or after the JSON. The exact format of JSON returned has fields: category(array), urgency(1-10), location(string), affected(number), summary(string). For example, the JSON will be like:{
   "category": ["food", "medical"],
   "urgency": 8,
   "location": "sector 4",
   "affected": 200,
   "summary": "Brief one sentence summary"
 } If any field has missing value in input, set the value to null. Like, if category is missing, set it to null; if location is missing, set it to null. Never guess or put any value by your own. The field report to analyze is: ${rawText}.`);
  const text=result.response.text();
  const cleanedText = text.replace(/^```json\s*|```$/g, '').trim();
  return JSON.parse(cleanedText)
}

async function explainUrgencyWithGemini(rawText,urgency){
  const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    })

    // ✅ AI Prompt
    const prompt = `
You are an experienced disaster relief coordinator.

Based on the NGO request below, explain WHY this situation is urgent.

Rules:
- Write in plain, human language.
- 2 to 3 concise sentences only.
- Focus on humanitarian impact.
- Do NOT repeat the request verbatim.
- Explain consequences if help is delayed.

Urgency Score: ${urgency ?? "Not specified"}

Request Description:
${rawText}
`

    const result = await model.generateContent(prompt);

    return result.response.text().trim();
}

export{parseNeedWithGemini,explainUrgencyWithGemini}
