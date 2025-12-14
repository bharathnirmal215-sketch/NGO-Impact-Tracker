# Project Approach & Architecture

## Overview

Built a scalable NGO impact tracking system using Django REST Framework (backend) and Next.js (frontend). The architecture prioritizes reliability, scalability, and developer experience.

## Key Decisions

**Backend**: Django chosen for robust ORM and admin panel. Idempotency enforced via database unique constraints on `(ngo_id, month)`. Celery handles async CSV processing with graceful fallback to synchronous mode when Redis unavailable, ensuring it works out-of-the-box.

**Frontend**: Next.js provides SSR and excellent DX. Material-UI delivers professional UI. Real-time job status polling gives immediate feedback on bulk uploads.

**Database**: PostgreSQL for production, SQLite for local dev. Composite unique constraints prevent duplicates and ensure data integrity.

**Error Handling**: Validation at both layers. CSV processing reports partial failures, allowing users to identify and fix issues.

**Deployment**: Configured for Railway (auto-detection) and Render, with Docker support. Auto-detects `DATABASE_URL` for seamless cloud deployment.

## AI Tools

Cursor AI used extensively for code generation, debugging, and architecture. GitHub Copilot assisted with boilerplate.

## Future Enhancements

Authentication, test coverage, rate limiting, structured logging (Sentry), and Redis caching for dashboard queries.

