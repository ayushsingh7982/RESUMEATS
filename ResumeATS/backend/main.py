from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from openai import OpenAI
import json
import os
import logging
from datetime import datetime

# Configure logging with date-based log files
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

# Create log filename based on current date
log_filename = os.path.join(log_dir, f"app_{datetime.now().strftime('%Y-%m-%d')}.log")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"Logging to file: {log_filename}")

# Load environment variables from .env file in the same directory as this script
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)
logger.info(f"Loading .env from: {env_path}")
logger.info("Application starting up...")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware configured")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "Resume ATS Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "POST /analyze - Upload PDF resume for analysis"
        }
    }

# Initialize OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    logger.info("OpenAI API key found, configuring client...")
    client = OpenAI(api_key=api_key)
    logger.info("OpenAI client initialized successfully")
else:
    logger.warning("OpenAI API key not found in environment variables")
    client = None

def analyze_with_openai(resume_text: str) -> dict:
    """Use OpenAI to analyze resume and provide suggestions"""
    logger.info("Starting OpenAI analysis...")
    logger.debug(f"Resume text length: {len(resume_text)} characters")
    
    prompt = f"""You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Analyze the following resume comprehensively and provide a detailed analysis in JSON format.

IMPORTANT: Provide an ATS score between 1-100 based on:
- Keyword optimization and relevance
- Formatting and structure
- Content quality and completeness
- Industry standards compliance
- Quantifiable achievements
- Professional presentation

Return JSON with these exact keys:

{{
  "ats_score": 75,
  "ats_score_breakdown": {{
    "keyword_optimization": 80,
    "formatting": 70,
    "content_quality": 75,
    "achievements": 65,
    "overall_presentation": 85
  }},
  "pros": [
    "Specific strength with detailed explanation",
    "Another strength with context",
    "Third strength highlighting what works well",
    "Fourth positive aspect",
    "Fifth advantage of this resume"
  ],
  "cons": [
    "Specific weakness with detailed explanation",
    "Another area needing improvement",
    "Third concern or gap",
    "Fourth issue to address",
    "Fifth limitation"
  ],
  "suggestions": [
    "Actionable suggestion #1 with specific steps",
    "Actionable suggestion #2 with clear guidance",
    "Actionable suggestion #3 for improvement",
    "Actionable suggestion #4 to enhance resume",
    "Actionable suggestion #5 for better results",
    "Actionable suggestion #6 (optional)",
    "Actionable suggestion #7 (optional)"
  ],
  "summary": "2-3 sentence overall assessment of the resume",
  "candidate_level": "Entry-Level/Junior/Mid-Level/Senior/Executive",
  "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "industry_match": "Industry or role this resume best fits"
}}

Resume Text:
{resume_text}

Be specific, actionable, and honest in your analysis. Return ONLY valid JSON, no markdown formatting."""

    try:
        logger.info("Sending request to OpenAI API...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume analyzer. Provide detailed, actionable feedback in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        logger.info("Received response from OpenAI API")
        
        # Parse the response
        response_text = response.choices[0].message.content
        logger.debug(f"Raw response length: {len(response_text)} characters")
        
        logger.info("Parsing JSON response...")
        parsed_response = json.loads(response_text)
        logger.info("Successfully parsed OpenAI response")
        return parsed_response
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        logger.error(f"Response text: {response_text[:500]}...")
        raise HTTPException(status_code=500, detail=f"Failed to parse OpenAI response: {str(e)}")
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    request_id = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    logger.info(f"[{request_id}] New resume analysis request received")
    logger.info(f"[{request_id}] Filename: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        logger.warning(f"[{request_id}] Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        logger.error(f"[{request_id}] OpenAI API key not configured")
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    logger.info(f"[{request_id}] Reading file contents...")
    contents = await file.read()
    logger.info(f"[{request_id}] File size: {len(contents)} bytes")

    # Save PDF temporarily
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    logger.info(f"[{request_id}] Saving file to: {path}")
    
    with open(path, "wb") as f:
        f.write(contents)
    logger.info(f"[{request_id}] File saved successfully")

    try:
        # Read text from PDF
        logger.info(f"[{request_id}] Extracting text from PDF...")
        reader = PdfReader(path)
        logger.info(f"[{request_id}] PDF has {len(reader.pages)} pages")
        
        text = ""
        for i, page in enumerate(reader.pages):
            logger.debug(f"[{request_id}] Extracting text from page {i+1}")
            text += page.extract_text()
        
        logger.info(f"[{request_id}] Text extraction complete. Total characters: {len(text)}")

        if not text.strip():
            logger.error(f"[{request_id}] No text could be extracted from PDF")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Get AI-powered analysis
        logger.info(f"[{request_id}] Starting AI analysis...")
        ai_analysis = analyze_with_openai(text)
        logger.info(f"[{request_id}] AI analysis completed successfully")

        # Basic metrics
        basic_metrics = {
            "word_count": len(text.split()),
            "page_count": len(reader.pages),
            "character_count": len(text)
        }
        logger.info(f"[{request_id}] Basic metrics calculated: {basic_metrics}")

        response_data = {
            "filename": file.filename,
            "basic_metrics": basic_metrics,
            "ai_analysis": ai_analysis,
            "text_preview": text[:500]
        }
        
        logger.info(f"[{request_id}] Response data keys: {list(response_data.keys())}")
        logger.info(f"[{request_id}] AI analysis keys: {list(ai_analysis.keys())}")
        logger.info(f"[{request_id}] ATS Score: {ai_analysis.get('ats_score', 'N/A')}")
        logger.info(f"[{request_id}] Request completed successfully")
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    # Note: Files are NOT automatically deleted. Run cleanup.py to remove old uploads.
