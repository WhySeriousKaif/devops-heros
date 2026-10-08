from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DevOps Revision Tracker API"
    database_url: str = (
        "postgresql+psycopg://revision:revision@localhost:5432/revision_tracker"
    )
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

