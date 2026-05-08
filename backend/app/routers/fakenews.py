from fastapi import APIRouter, Depends
import logging

from app import schemas
from app.core.dependencies import optional_current_user, get_store
from app.services.detectors import FakeNewsDetector, SimpleExplainability, SourceCredibilityChecker
from app.services.store import TruthShieldStore

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/fakenews", tags=["fake-news"])


def _current_user_email() -> str:
    return "demo@truthshield.ai"


@router.post("/analyze", response_model=schemas.ScanResult)
def analyze_scan(payload: schemas.ScanRequest, current_user: dict | None = Depends(optional_current_user), repository: TruthShieldStore = Depends(get_store)):
    try:
        detector = FakeNewsDetector()
        explainability = SimpleExplainability()
        credibility_checker = SourceCredibilityChecker()

        result = detector.analyze(payload.title, payload.text, payload.source_url, payload.language)
        logger.info(f"Detector result: {result}")
        
        result.explanation.extend(explainability.top_signals(payload.text))
        credibility_score, credibility_reason = credibility_checker.score(payload.source_url)
        result.explanation.append(f"Source check: {credibility_reason}")
        result.risk_score = round(min(result.risk_score + max(0.0, 0.55 - credibility_score) * 0.15, 0.99), 3)
        result.label = "Fake" if result.risk_score >= 0.5 else "Real"
        result.confidence = round(max(result.confidence, 0.6 + abs(result.risk_score - 0.5) * 0.35), 3)

        logger.info(f"Final result: label={result.label}, risk={result.risk_score}, conf={result.confidence}")
        
        # Convert to dict to ensure all fields are properly set
        result_dict = result.model_dump() if hasattr(result, 'model_dump') else result.as_dict()
        logger.info(f"Result dict: {result_dict}")

        repository.record_scan(
            user_email=(current_user["email"] if current_user else _current_user_email()),
            scan_type="fake_news",
            input_type="text",
            title=payload.title,
            summary=result.summary,
            risk_score=result.risk_score,
            confidence=result.confidence,
            label=result.label,
            metadata={"source_url": payload.source_url, "language": payload.language, "explanation": result.explanation},
        )

        return result_dict
    except Exception as e:
        logger.error(f"Error in fake-news analyzer: {e}", exc_info=True)
        raise
