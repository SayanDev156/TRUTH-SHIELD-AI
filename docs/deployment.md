# Deployment Guide

## Backend

1. Set `DATABASE_URL`, `SECRET_KEY`, and `CORS_ORIGINS`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Run `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Frontend

1. Set `BACKEND_URL` to your backend URL for the Vercel rewrite proxy.
2. `NEXT_PUBLIC_API_URL` is still supported for compatibility, but `BACKEND_URL` is preferred.
3. Install dependencies with `npm install`.
4. Run `npm run build` and deploy the `.next` output to your host.

## Production Notes

- Use PostgreSQL for persistent deployments.
- Put model weights under `models/` and load them from the detector services.
- Enable HTTPS, strong JWT secrets, and object storage for uploads.
