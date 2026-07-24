import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

TenantBase = declarative_base()

class Article(TenantBase):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True) # Pode ser Markdown ou Rich Text
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    documents = relationship("Document", back_populates="article", cascade="all, delete-orphan")

class Document(TenantBase):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False) # Caminho no MinIO
    allow_ai_consumption = Column(Boolean, default=True)
    status = Column(String(50), default="pending") # pending, indexing, indexed, error
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("Article", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(TenantBase):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    
    # Embedding do Gemini 1.5 tem 768 dimensões
    embedding = Column(Vector(768), nullable=True)
    document = relationship("Document", back_populates="chunks")

class AISession(TenantBase):
    __tablename__ = "ai_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_token = Column(String(64), unique=True, nullable=False)
    status = Column(String(30), default="active") # active, deflected_chat, deflected_ticket, resolved, abandoned
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    
    # Handoff tracking
    was_deflected = Column(Boolean, nullable=True)
    deflection_type = Column(String(20), nullable=True)
    
    messages = relationship("AISessionMessage", back_populates="session", cascade="all, delete-orphan")

class AISessionMessage(TenantBase):
    __tablename__ = "ai_session_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("ai_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(10), nullable=False) # 'user' ou 'assistant'
    content = Column(Text, nullable=False)
    
    # Metadados de recuperação (para auditoria)
    retrieved_chunks = Column(JSONB, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AISession", back_populates="messages")
