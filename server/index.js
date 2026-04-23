
console.log('API KEY:', process.env.GEMINI_API_KEY)

import express from 'express'
import cors from 'cors'
import { parseNeedWithGemini } from './geminiService.js'
//import { data } from 'react-router-dom'

const app=express()
app.use(cors())
app.use(express.json())

app.post('/api/parse-need',async(req,res)=>{
    try{
        const { rawText }=req.body;    

        if(!rawText){
            return res.status(400).json({
                success:false,
                message:"rawText is missing",
            });
        }
        const parsedResult=await parseNeedWithGemini(rawText);
        res.json({
        success:true,
        data:parsedResult,
    });
    }catch(error){
        console.error("Parse need error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to parse need",
            error:error.message,
        });
    }
    });

app.listen(5000,()=>{
    console.log("Server running on port 5000");
})