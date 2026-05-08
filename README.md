# TruthShield AI – Fake News + Deepfake Detector

TruthShield AI is a demo-ready full-stack web application for detecting fake news and synthetic media. It ships with a premium dark SaaS UI, FastAPI backend, JWT auth, dashboard pages, scan history, and admin analytics.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, SQLAlchemy, JWT, SlowAPI rate limiting
- Storage: SQLite by default, PostgreSQL-ready via `DATABASE_URL`
- AI layer: Pluggable heuristic models that can be replaced with BERT, CNN, MediaPipe, and audio spectrogram pipelines

## Folder Structure

- `frontend/` - Next.js app
- `backend/` - FastAPI API
- `models/` - model artifacts and notes
- `datasets/` - sample CSV data
- `docs/` - deployment and demo notes

## Local Run

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` unless `NEXT_PUBLIC_API_URL` is set.

## Demo Credentials

- Email: `demo@truthshield.ai`
- Password: `Demo@12345`

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/fakenews/analyze`
- `POST /api/deepfake/image`
- `POST /api/deepfake/video`
- `POST /api/deepfake/audio`
- `GET /api/history`
- `GET /api/admin/stats`

## Notes

- The backend currently uses heuristic scoring as a demo-safe stand-in for trained ML models.
- Replace the services in `backend/app/services/detectors.py` with real model inference pipelines when weights are available.
- Upload validation, JWT auth, CORS, and rate limiting are included as the security baseline.
