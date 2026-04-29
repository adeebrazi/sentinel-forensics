from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import FileResponse, StreamingResponse
import psutil, socket, os, hashlib, shutil, random, tempfile, httpx
from datetime import datetime
from pydantic import BaseModel

try:
    from config import settings
except ImportError:
    class Settings:
        MONGO_URI = "mongodb://localhost:27017"
        DB_NAME = "sentinel_forensics"
    settings = Settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = "storage"
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    print("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

SECRET_MARKER = b"---SENTINEL-SIG---"
DEBUG_MODE = False 

def get_device_fingerprint():
    if DEBUG_MODE:
        return hashlib.sha256(b"debug_id").hexdigest()[:16]
    hardware = f"{psutil.cpu_count()}{socket.gethostname()}"
    return hashlib.sha256(hardware.encode()).hexdigest()[:16]

async def log_leak(extracted_id, source, filename="Unknown"):
    await db.leaks.insert_one({
        "leaker_id": extracted_id,
        "source": source,
        "filename": filename,
        "detected_at": datetime.utcnow()
    })

def process_audit_content(content: bytes, current_id: str):
    extracted_id = "No ID Found"
    status = "unknown"
    marker_pos = content.rfind(SECRET_MARKER)
    
    if marker_pos != -1:
        start_pos = marker_pos + len(SECRET_MARKER)
        extracted_id = content[start_pos:start_pos+16].decode('utf-8', errors='ignore').strip()
        if extracted_id == current_id:
            status = "authorized"
        else:
            status = "leaked"
    return extracted_id, status

@app.get("/")
async def root():
    return {"status": "online", "system": "Sentinel Forensics Backend"}

class GoogleAuthRequest(BaseModel):
    access_token: str

# Server-Side Source of Truth for Authorized Users
AUTHORIZED_USERS = {
    "admin@sentinel.gov": "admin",
    "employee@sentinel.gov": "employee",
    "adeebrazi22@gmail.com": "admin",
    "officialmerchlab@gmail.com": "employee",
}

@app.post("/auth/verify-google")
async def verify_google_token(request: GoogleAuthRequest):
    # 1. Ask Google who this token belongs to
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {request.access_token}'}
        )
        
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
        
    user_info = response.json()
    email = user_info.get("email", "").lower()
    
    # 2. Check the Backend Whitelist (Secure from Client-Side Injection)
    role = AUTHORIZED_USERS.get(email)
    
    if not role:
        raise HTTPException(status_code=403, detail=f"ACCESS_DENIED: '{email}' not in registry")
        
    # 3. Return the clearance role securely
    return {"status": "success", "email": email, "role": role}

@app.post("/video/upload")
async def handle_offline_securing(video: UploadFile = File(...)):
    device_id = get_device_fingerprint()
    file_path = os.path.join(STORAGE_DIR, video.filename)
    
    with open(file_path, "wb") as f: 
        while True:
            chunk = await video.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
        f.write(SECRET_MARKER)
        f.write(device_id.encode())
        f.flush()
        os.fsync(f.fileno())
        
    await db.videos.insert_one({"device_id": device_id, "filename": video.filename, "path": file_path, "ts": datetime.utcnow()})
    return {"status": "success", "filename": video.filename}

@app.get("/stream/{video_name}")
async def stream_online_video(video_name: str, viewer_id: str):
    file_path = os.path.join(STORAGE_DIR, video_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    def file_iterator():
        with open(file_path, "rb") as f: 
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                yield chunk
        yield SECRET_MARKER + viewer_id.encode()
        
    return StreamingResponse(file_iterator(), media_type="video/mp4")

@app.get("/download/{video_name}")
async def download_offline_video(video_name: str, viewer_id: str):
    file_path = os.path.join(STORAGE_DIR, video_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    def file_iterator():
        with open(file_path, "rb") as f: 
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                yield chunk
        yield SECRET_MARKER + viewer_id.encode()
        
    return StreamingResponse(file_iterator(), media_type="video/mp4", headers={
        "Content-Disposition": f"attachment; filename=\"{video_name}\""
    })

@app.post("/video/audit")
async def audit_file(video: UploadFile = File(...)):
    last_chunk = b""
    while True:
        chunk = await video.read(1024 * 1024)
        if not chunk:
            break
        last_chunk = (last_chunk + chunk)[-(len(SECRET_MARKER) + 16):]
        
    extracted_id = "No ID Found"
    status = "unknown"
    
    marker_pos = last_chunk.rfind(SECRET_MARKER)
    if marker_pos != -1:
        start_pos = marker_pos + len(SECRET_MARKER)
        extracted_id = last_chunk[start_pos:start_pos+16].decode('utf-8', errors='ignore').strip()
        status = "leaked"
        
    if status == "leaked": 
        await log_leak(extracted_id, "Physical Media", video.filename)
    return {"extracted_id": extracted_id, "status": status, "source": "Physical Media"}

class UrlAuditRequest(BaseModel):
    url: str

@app.post("/video/audit-url")
async def audit_url(request: UrlAuditRequest):
    is_original_stream = "127.0.0.1:8000/stream" in request.url or "localhost:8000/stream" in request.url
    
    try:
        last_chunk = b""
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", request.url) as resp:
                resp.raise_for_status()
                async for chunk in resp.aiter_bytes(chunk_size=1024 * 1024):
                    if chunk:
                        last_chunk = (last_chunk + chunk)[-(len(SECRET_MARKER) + 16):]
                
        extracted_id = "No ID Found"
        status = "unknown"
        
        marker_pos = last_chunk.rfind(SECRET_MARKER)
        if marker_pos != -1:
            start_pos = marker_pos + len(SECRET_MARKER)
            extracted_id = last_chunk[start_pos:start_pos+16].decode('utf-8', errors='ignore').strip()
            
            if is_original_stream:
                status = "authorized"
            else:
                status = "leaked"
            
        if status == "leaked":
            await log_leak(extracted_id, "External URL Extraction", request.url)
            
        return {"extracted_id": extracted_id, "status": status, "source": "External URL Extraction"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/dashboard")
async def get_dashboard_stats():
    total_secured = await db.videos.count_documents({})
    total_leaks = await db.leaks.count_documents({})
    cursor = db.leaks.find().sort("detected_at", -1).limit(5)
    recent_leaks = await cursor.to_list(length=5)
    for leak in recent_leaks:
        leak["_id"] = str(leak["_id"])
    return {"total_secured": total_secured, "total_leaks": total_leaks, "recent_leaks": recent_leaks}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)