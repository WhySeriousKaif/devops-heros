from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Priority = Literal["LOW", "MEDIUM", "HIGH"]
RevisionStatus = Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]


class TopicCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=80)
    priority: Priority = "MEDIUM"
    status: RevisionStatus = "NOT_STARTED"
    notes: str = ""


class TopicUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    priority: Priority | None = None
    status: RevisionStatus | None = None
    notes: str | None = None


class TopicOut(TopicCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StatsOut(BaseModel):
    total: int
    not_started: int
    in_progress: int
    completed: int

