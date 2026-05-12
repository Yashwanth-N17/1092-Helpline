from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "1092 Helpline AI Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Model Configurations
    DEBERTA_MODEL_NAME: str = "cross-encoder/nli-deberta-v3-small"
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"

    class Config:
        env_file = ".env"

settings = Settings()
