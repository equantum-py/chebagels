from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/che"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
@lru_cache
def get_settings() -> Settings:
    return Settings()
