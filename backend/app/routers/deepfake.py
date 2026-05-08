from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app import schemas
from app.core.config import get_settings
from app.core.dependencies import get_store, optional_current_user
from app.services.detectors import DeepfakeDetector
from app.services.store import TruthShieldStore

router = APIRouter(prefix="/deepfake", tags=["deepfake"])
settings = get_settings()


def _validate_upload(upload: UploadFile, expected_kind: str) -> None:
    if upload.content_type not in settings.allowed_upload_type_list:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported file type")

    expected_prefix = f"{expected_kind}/"
    actual_type = upload.content_type or ""
    if not actual_type.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Selected endpoint expects {expected_kind}/* file, got {actual_type or 'unknown'}",
        )


async def _read_upload(upload: UploadFile) -> tuple[str, int, bytes]:
    content = await upload.read()
    size_bytes = len(content)
    if size_bytes == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty upload")
    if size_bytes > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
    return upload.filename or "upload.bin", size_bytes, content


@router.post("/image", response_model=schemas.ScanResult)
async def analyze_image(
    file: UploadFile = File(...),
    current_user: dict | None = Depends(optional_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    _validate_upload(file, "image")
    filename, size_bytes, file_content = await _read_upload(file)

    detector = DeepfakeDetector()
    result = detector.analyze_file(filename, file.content_type, size_bytes, file_content)
    _store_scan(repository, filename, result, "image", current_user)

    result_dict = result.model_dump() if hasattr(result, "model_dump") else result.as_dict()
    return result_dict


@router.post("/video", response_model=schemas.ScanResult)
async def analyze_video(
    file: UploadFile = File(...),
    current_user: dict | None = Depends(optional_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    _validate_upload(file, "video")
    filename, size_bytes, file_content = await _read_upload(file)

    detector = DeepfakeDetector()
    result = detector.analyze_file(filename, file.content_type, size_bytes, file_content)
    _store_scan(repository, filename, result, "video", current_user)

    result_dict = result.model_dump() if hasattr(result, "model_dump") else result.as_dict()
    return result_dict


@router.post("/audio", response_model=schemas.ScanResult)
async def analyze_audio(
    file: UploadFile = File(...),
    current_user: dict | None = Depends(optional_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    _validate_upload(file, "audio")
    filename, size_bytes, file_content = await _read_upload(file)

    detector = DeepfakeDetector()
    result = detector.analyze_file(filename, file.content_type, size_bytes, file_content)
    _store_scan(repository, filename, result, "audio", current_user)

    result_dict = result.model_dump() if hasattr(result, "model_dump") else result.as_dict()
    return result_dict


def _store_scan(
    repository: TruthShieldStore,
    filename: str,
    result: schemas.ScanResult | object,
    input_type: str,
    current_user: dict | None,
) -> None:
    payload = result.model_dump() if hasattr(result, "model_dump") else result.as_dict()
    repository.record_scan(
        user_email=(current_user["email"] if current_user else "demo@truthshield.ai"),
        scan_type="deepfake",
        input_type=input_type,
        title=filename,
        summary=payload["summary"],
        risk_score=payload["risk_score"],
        confidence=payload["confidence"],
        label=payload["label"],
        metadata=payload,
    )
