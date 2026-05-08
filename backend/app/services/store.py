from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.errors import PyMongoError

from app.core.config import get_settings
from app.core.security import hash_password, verify_password

settings = get_settings()


class TruthShieldStore:
    def __init__(self) -> None:
        self.mongo_available = False
        self._client: MongoClient | None = None
        self._db = None
        self._memory = {
            "users": [],
            "scans": [],
            "metrics": [],
        }
        self._connect()
        self.seed()

    def _connect(self) -> None:
        if not settings.mongodb_uri:
            return

        try:
            self._client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=4000)
            self._client.admin.command("ping")
            self._db = self._client[settings.mongodb_database]
            self._db.users.create_index([("email", ASCENDING)], unique=True)
            self._db.scans.create_index([("created_at", DESCENDING)])
            self._db.metrics.create_index([("name", ASCENDING)], unique=True)
            self.mongo_available = True
        except Exception:
            self.mongo_available = False
            self._client = None
            self._db = None

    def seed(self) -> None:
        admin_payload = {
            "id": "user_admin_demo",
            "full_name": "TruthShield Admin",
            "email": "demo@truthshield.ai",
            "hashed_password": hash_password("Demo@12345"),
            "is_admin": True,
            "locale": "en",
            "created_at": self._now(),
        }
        user_payload = {
            "id": "user_demo",
            "full_name": "TruthShield User",
            "email": "user@truthshield.ai",
            "hashed_password": hash_password("User@12345"),
            "is_admin": False,
            "locale": "en",
            "created_at": self._now(),
        }
        metrics_payload = [
            {"id": "metric_fake_news", "name": "DistilBERT Fake News Classifier", "accuracy": 0.94, "precision": 0.93, "recall": 0.92, "f1": 0.925, "updated_at": self._now()},
            {"id": "metric_deepfake", "name": "CNN Face Forensics Model", "accuracy": 0.91, "precision": 0.9, "recall": 0.89, "f1": 0.895, "updated_at": self._now()},
            {"id": "metric_audio", "name": "Audio Spectrogram Detector", "accuracy": 0.88, "precision": 0.87, "recall": 0.86, "f1": 0.865, "updated_at": self._now()},
        ]
        scans_payload = [
            {
                "id": "scan_seed_1",
                "user_email": "demo@truthshield.ai",
                "scan_type": "fake_news",
                "input_type": "text",
                "title": "BREAKING: miracle cure hidden from the public",
                "summary": "Clickbait-heavy article with weak source credibility.",
                "risk_score": 0.91,
                "confidence": 0.96,
                "label": "Fake",
                "metadata": {"source_url": "https://unknown-source.example.com/article", "explanation": ["Urgent wording", "Weak source"]},
                "created_at": self._now(),
            },
            {
                "id": "scan_seed_2",
                "user_email": "demo@truthshield.ai",
                "scan_type": "deepfake",
                "input_type": "video",
                "title": "candidate_speech.mp4",
                "summary": "Frame coherence and region anomalies indicate manipulation.",
                "risk_score": 0.77,
                "confidence": 0.88,
                "label": "Fake",
                "metadata": {"frame_scores": [0.68, 0.71, 0.76, 0.8, 0.84]},
                "created_at": self._now(),
            },
        ]

        if self.mongo_available and self._db is not None:
            self._db.users.update_one({"email": admin_payload["email"]}, {"$set": admin_payload}, upsert=True)
            self._db.users.update_one({"email": user_payload["email"]}, {"$set": user_payload}, upsert=True)
            if self._db.metrics.count_documents({}) == 0:
                self._db.metrics.insert_many(metrics_payload)
            if self._db.scans.count_documents({}) == 0:
                self._db.scans.insert_many(scans_payload)
            return

        if not self._memory["users"]:
            self._memory["users"].extend([admin_payload, user_payload])
        if not self._memory["metrics"]:
            self._memory["metrics"].extend(metrics_payload)
        if not self._memory["scans"]:
            self._memory["scans"].extend(scans_payload)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _serialize(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        payload = deepcopy(doc)
        if isinstance(payload.get("created_at"), datetime):
            payload["created_at"] = payload["created_at"]
        if isinstance(payload.get("updated_at"), datetime):
            payload["updated_at"] = payload["updated_at"]
        return payload

    def _collection(self, name: str):
        if not self.mongo_available or self._db is None:
            return None
        return getattr(self._db, name)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        normalized_email = email.lower()
        if self.mongo_available and self._db is not None:
            user = self._db.users.find_one({"email": normalized_email}, {"_id": 0})
            return self._serialize(user) if user else None

        for user in self._memory["users"]:
            if user["email"] == normalized_email:
                return self._serialize(user)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.mongo_available and self._db is not None:
            user = self._db.users.find_one({"id": user_id}, {"_id": 0})
            return self._serialize(user) if user else None

        for user in self._memory["users"]:
            if user["id"] == user_id:
                return self._serialize(user)
        return None

    def register_user(self, full_name: str, email: str, password: str, locale: str = "en", is_admin: bool = False) -> Dict[str, Any]:
        normalized_email = email.lower()
        if self.get_user_by_email(normalized_email):
            raise ValueError("Email already registered")

        user_doc = {
            "id": f"user_{uuid4().hex}",
            "full_name": full_name,
            "email": normalized_email,
            "hashed_password": hash_password(password),
            "is_admin": is_admin,
            "locale": locale,
            "created_at": self._now(),
        }

        if self.mongo_available and self._db is not None:
            self._db.users.insert_one(user_doc)
        else:
            self._memory["users"].append(user_doc)
        return self._serialize(user_doc)

    def get_or_create_oauth_user(self, *, email: str, full_name: str, provider: str, provider_id: str, locale: str = "en") -> Dict[str, Any]:
        normalized_email = email.lower()
        existing = self.get_user_by_email(normalized_email)
        oauth_fields = {
            "oauth_provider": provider,
            "oauth_provider_id": provider_id,
        }
        if existing:
            if self.mongo_available and self._db is not None:
                self._db.users.update_one({"email": normalized_email}, {"$set": oauth_fields})
                user = self._db.users.find_one({"email": normalized_email}, {"_id": 0})
                return self._serialize(user)
            for user in self._memory["users"]:
                if user["email"] == normalized_email:
                    user.update(oauth_fields)
                    return self._serialize(user)
            return existing

        user_doc = {
            "id": f"user_{uuid4().hex}",
            "full_name": full_name,
            "email": normalized_email,
            "hashed_password": "",
            "is_admin": False,
            "locale": locale,
            "created_at": self._now(),
            **oauth_fields,
        }

        if self.mongo_available and self._db is not None:
            self._db.users.insert_one(user_doc)
        else:
            self._memory["users"].append(user_doc)
        return self._serialize(user_doc)

    def verify_login(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user

    def list_scans(
        self,
        *,
        search: str | None = None,
        scan_type: str | None = None,
        user_email: str | None = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {}
        if search:
            query["title"] = {"$regex": search, "$options": "i"}
        if scan_type:
            query["scan_type"] = scan_type
        if user_email:
            query["user_email"] = user_email.lower()

        if self.mongo_available and self._db is not None:
            cursor = self._db.scans.find(query, {"_id": 0}).sort("created_at", DESCENDING).limit(limit)
            return [self._serialize(doc) for doc in cursor]

        records = [doc for doc in self._memory["scans"] if self._matches_scan(doc, search, scan_type, user_email)]
        records.sort(key=lambda item: item["created_at"], reverse=True)
        return [self._serialize(item) for item in records[:limit]]

    def _matches_scan(self, doc: Dict[str, Any], search: str | None, scan_type: str | None, user_email: str | None) -> bool:
        if search and search.lower() not in doc["title"].lower():
            return False
        if scan_type and doc["scan_type"] != scan_type:
            return False
        if user_email and doc["user_email"].lower() != user_email.lower():
            return False
        return True

    def record_scan(
        self,
        *,
        user_email: str,
        scan_type: str,
        input_type: str,
        title: str,
        summary: str,
        risk_score: float,
        confidence: float,
        label: str,
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        scan_doc = {
            "id": f"scan_{uuid4().hex}",
            "user_email": user_email.lower(),
            "scan_type": scan_type,
            "input_type": input_type,
            "title": title,
            "summary": summary,
            "risk_score": risk_score,
            "confidence": confidence,
            "label": label,
            "metadata": metadata,
            "created_at": self._now(),
        }

        if self.mongo_available and self._db is not None:
            self._db.scans.insert_one(scan_doc)
        else:
            self._memory["scans"].append(scan_doc)
        return self._serialize(scan_doc)

    def update_profile(self, email: str, full_name: str, locale: str) -> Dict[str, Any]:
        normalized = email.lower()
        if self.mongo_available and self._db is not None:
            self._db.users.update_one({"email": normalized}, {"$set": {"full_name": full_name, "locale": locale}})
            user = self._db.users.find_one({"email": normalized}, {"_id": 0})
            return self._serialize(user)
        for user in self._memory["users"]:
            if user["email"] == normalized:
                user["full_name"] = full_name
                user["locale"] = locale
                return self._serialize(user)
        raise ValueError("User not found")

    def change_password(self, email: str, current_password: str, new_password: str) -> None:
        user = self.get_user_by_email(email)
        if not user:
            raise ValueError("User not found")
        if not verify_password(current_password, user["hashed_password"]):
            raise ValueError("Current password is incorrect")
        new_hash = hash_password(new_password)
        normalized = email.lower()
        if self.mongo_available and self._db is not None:
            self._db.users.update_one({"email": normalized}, {"$set": {"hashed_password": new_hash}})
            return
        for u in self._memory["users"]:
            if u["email"] == normalized:
                u["hashed_password"] = new_hash
                return

    def list_users(self, limit: int = 200) -> List[Dict[str, Any]]:
        if self.mongo_available and self._db is not None:
            cursor = self._db.users.find({}, {"_id": 0, "hashed_password": 0}).sort("created_at", DESCENDING).limit(limit)
            return [self._serialize(doc) for doc in cursor]
        users = sorted(self._memory["users"], key=lambda u: u["created_at"], reverse=True)
        return [{k: v for k, v in self._serialize(u).items() if k != "hashed_password"} for u in users[:limit]]

    def get_metrics(self) -> List[Dict[str, Any]]:
        if self.mongo_available and self._db is not None:
            return [self._serialize(doc) for doc in self._db.metrics.find({}, {"_id": 0}).sort("updated_at", DESCENDING)]
        metrics = list(self._memory["metrics"])
        metrics.sort(key=lambda item: item["updated_at"], reverse=True)
        return [self._serialize(item) for item in metrics]

    def get_stats(self) -> Dict[str, Any]:
        if self.mongo_available and self._db is not None:
            total_users = self._db.users.count_documents({})
            total_scans = self._db.scans.count_documents({})
            fake_news_scans = self._db.scans.count_documents({"scan_type": "fake_news"})
            deepfake_scans = self._db.scans.count_documents({"scan_type": "deepfake"})
            recent_activity = [self._serialize(doc) for doc in self._db.scans.find({}, {"_id": 0}).sort("created_at", DESCENDING).limit(8)]
            model_metrics = self.get_metrics()
            return {
                "total_users": total_users,
                "total_scans": total_scans,
                "fake_news_scans": fake_news_scans,
                "deepfake_scans": deepfake_scans,
                "average_accuracy": round(sum(metric["accuracy"] for metric in model_metrics) / max(len(model_metrics), 1), 2),
                "recent_activity": recent_activity,
                "model_metrics": model_metrics,
            }

        total_users = len(self._memory["users"])
        total_scans = len(self._memory["scans"])
        fake_news_scans = len([scan for scan in self._memory["scans"] if scan["scan_type"] == "fake_news"])
        deepfake_scans = len([scan for scan in self._memory["scans"] if scan["scan_type"] == "deepfake"])
        model_metrics = self.get_metrics()
        recent_activity = sorted(self._memory["scans"], key=lambda item: item["created_at"], reverse=True)[:8]
        return {
            "total_users": total_users,
            "total_scans": total_scans,
            "fake_news_scans": fake_news_scans,
            "deepfake_scans": deepfake_scans,
            "average_accuracy": round(sum(metric["accuracy"] for metric in model_metrics) / max(len(model_metrics), 1), 2),
            "recent_activity": [self._serialize(item) for item in recent_activity],
            "model_metrics": model_metrics,
        }


_store: TruthShieldStore | None = None


def get_truthshield_store() -> TruthShieldStore:
    global _store
    if _store is None:
        _store = TruthShieldStore()
    return _store
