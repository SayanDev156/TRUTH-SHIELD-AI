from fastapi import APIRouter, Depends

from app import schemas
from app.core.dependencies import get_current_admin, get_store
from app.services.store import TruthShieldStore

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.AdminStatsResponse)
def get_stats(_: dict = Depends(get_current_admin), repository: TruthShieldStore = Depends(get_store)):
    stats = repository.get_stats()
    return schemas.AdminStatsResponse(
        total_users=stats["total_users"],
        total_scans=stats["total_scans"],
        fake_news_scans=stats["fake_news_scans"],
        deepfake_scans=stats["deepfake_scans"],
        average_accuracy=stats["average_accuracy"],
        recent_activity=[schemas.ScanRecordPublic(**item) for item in stats["recent_activity"]],
        model_metrics=stats["model_metrics"],
    )


@router.get("/users", response_model=schemas.AdminUsersResponse)
def list_users(_: dict = Depends(get_current_admin), repository: TruthShieldStore = Depends(get_store)):
    users = repository.list_users()
    return schemas.AdminUsersResponse(items=[schemas.AdminUserPublic(**u) for u in users])
