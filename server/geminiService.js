import dotenv from 'dotenv'
dotenv.config()

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function parseNeedWithGemini(rawText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  //const result = await model.generateContent(`You are an AI assistant that extracts structured data from the input given. Your task is to take ${rawText} as iput and Return ONLY a JSON object with these fields:category(array), urgency(1-10), location(string), affected(number), summary(string). If any field is missing from the text leave it blank.`)

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

export{parseNeedWithGemini}
