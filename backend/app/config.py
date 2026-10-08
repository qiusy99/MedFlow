from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url: str
    secret_key: str

    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    frontend_origin: str = "http://localhost:5173"
    s3_bucket_name: str = "medflow-servicereport-02-sq"
    model_config = SettingsConfigDict(env_file=".env")
settings = Settings()