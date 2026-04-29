import os

class Settings:
    PROJECT_NAME: str = "Sentinel Forensics"
    # Replace with your MongoDB Atlas URI or local connection
    MONGO_URI: str = "mongodb+srv://asdfghjkl:MZMN0yLwSMNo5gKo@cluster0.pbymbyz.mongodb.net/?appName=Cluster0" 
    DB_NAME: str = "sentinel_forensics"
    SECRET_KEY: str = "admin123" # Used for JWT [cite: 120]
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480 

settings = Settings()