from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:0622@127.0.0.1:5432/medflow_dev_02"
    secret_key: str = '5ec81cb2d24ce516f2199d92bb0984f85870e0ec2db4479c85c2c21322a8f73d'

    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    frontend_origin: str = "http://localhost:5173"
    s3_bucket_name: str = "medflow-servicereport-02-sq"
    model_config = SettingsConfigDict(env_file=".env")
settings = Settings()