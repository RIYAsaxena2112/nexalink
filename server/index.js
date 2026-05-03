
console.log('API KEY:', process.env.GEMINI_API_KEY)

import express from 'express'
import cors from 'cors'
import { parseNeedWithGemini } from './geminiService.js'
import axios from 'axios'

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

app.post('/api/geocode', async (req, res) => {
 
  try{
    const { locationName }= req.body;
    if(!locationName){
            return res.status(400).json({
                success:false,
                message:"Location Name is missing",
            });
        }
        const response = await axios.get(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
)
console.log('Geocoding status:', response.data.status)
console.log('Geocoding error:', response.data.error_message)
console.log('API KEY loaded:', process.env.GOOGLE_MAPS_API_KEY ? 'YES' : 'NO')
const { lat, lng } = response.data.results[0].geometry.location
res.json({
    success:true,
    data:{ lat, lng}
  })
  }catch(error){
        console.error("Location gives error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to retreive location",
            error:error.message,
        });
  }
})

app.listen(5000,()=>{
    console.log("Server running on port 5000");
})