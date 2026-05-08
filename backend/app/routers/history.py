from fastapi import APIRouter, Depends, Query

from app import schemas
from app.core.dependencies import get_current_user, optional_current_user, get_store
from app.services.store import TruthShieldStore

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=schemas.HistoryResponse)
def list_history(
    search: str | None = Query(default=None),
    scan_type: str | None = Query(default=None),
    current_user: dict | None = Depends(optional_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    # Admins see all scans; regular users only see their own
    if current_user and current_user.get("is_admin"):
        user_email = None
    else:
        user_email = current_user["email"] if current_user else None
    items = repository.list_scans(search=search, scan_type=scan_type, user_email=user_email, limit=100)
    return schemas.HistoryResponse(items=[schemas.ScanRecordPublic(**item) for item in items])
