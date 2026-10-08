from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .models import Topic
from .schemas import StatsOut, TopicCreate, TopicOut, TopicUpdate


app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.on_event("startup")
def startup():
    # Alembic handles production migrations. This keeps the SQLite tests simple.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"service": settings.app_name, "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "UP"}


@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "READY"}


@app.get("/api/topics", response_model=list[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return list(db.scalars(select(Topic).order_by(Topic.id.desc())))


@app.get("/api/topics/stats", response_model=StatsOut)
def topic_stats(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Topic.status, func.count(Topic.id)).group_by(Topic.status)
    ).all()
    counts = {topic_status: count for topic_status, count in rows}
    return StatsOut(
        total=sum(counts.values()),
        not_started=counts.get("NOT_STARTED", 0),
        in_progress=counts.get("IN_PROGRESS", 0),
        completed=counts.get("COMPLETED", 0),
    )


@app.get("/api/topics/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


@app.post(
    "/api/topics", response_model=TopicOut, status_code=status.HTTP_201_CREATED
)
def create_topic(payload: TopicCreate, db: Session = Depends(get_db)):
    topic = Topic(**payload.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@app.put("/api/topics/{topic_id}", response_model=TopicOut)
def update_topic(
    topic_id: int, payload: TopicUpdate, db: Session = Depends(get_db)
):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(topic, key, value)
    db.commit()
    db.refresh(topic)
    return topic


@app.delete("/api/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()

