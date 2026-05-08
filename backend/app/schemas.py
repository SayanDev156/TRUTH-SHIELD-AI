from datetime import datetime
from typing import Any, Dict, List, Optional, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(Token):
    user: "UserPublic"


class UserBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    locale: str = "en"


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    is_admin: bool = False
    admin_secret: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(UserBase):
    id: str
    is_admin: bool
    created_at: datetime


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    locale: str = "en"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class ScanRequest(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    text: str = Field(min_length=3, max_length=10000)
    source_url: Optional[str] = None
    language: str = "en"


class DeepfakeAnalysisRequest(BaseModel):
    source_hint: Optional[str] = None
    language: str = "en"


class ScanResult(BaseModel):
    label: str
    confidence: float
    risk_score: float
    summary: str
    explanation: List[str]
    similar_links: List[str] = []
    frame_scores: List[float] = []
    regions: List[Dict[str, Any]] = []
    audio_insights: Dict[str, Any] = {}


class ScanRecordPublic(BaseModel):
    id: str
    user_email: str
    scan_type: str
    input_type: str
    title: str
    summary: str
    risk_score: float
    confidence: float
    label: str
    metadata: Dict[str, Any]
    created_at: datetime


class HistoryResponse(BaseModel):
    items: List[ScanRecordPublic]


class AdminUserPublic(BaseModel):
    id: str
    full_name: str
    email: str
    is_admin: bool
    locale: str
    created_at: datetime


class AdminUsersResponse(BaseModel):
    items: List[AdminUserPublic]


class AdminStatsResponse(BaseModel):
    total_users: int
    total_scans: int
    fake_news_scans: int
    deepfake_scans: int
    average_accuracy: float
    recent_activity: List[ScanRecordPublic]
    model_metrics: List[Dict[str, Any]]


AuthResponse.model_rebuild()
