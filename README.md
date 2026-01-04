# Access Submit — Accessible Demo Generator

>A tool to generate accessible documentation (readmes, subtitles, audio descriptions) from demo videos. This repository contains a FastAPI backend that processes media and a Next.js frontend for submitting demos and viewing generated assets.

--

## Table of Contents
- Project Overview
- Features
- Architecture
- Quick Start
	- Prerequisites
	- Backend
	- Frontend
- Environment Variables
- API Overview
- Development & Testing
- Deployment
- Troubleshooting
- Contributing
- License

## Project Overview

Access Submit ingests demo videos and produces accessible assets such as:
- A generated README summarizing the demo and accessibility guidance
- Subtitles / captions in multiple formats
- Audio descriptions (using TTS)
- Downloadable export packages

This project is intended as a reference/demo for generating accessible documentation from multimedia submissions.

## Features
- Upload a demo video and start automated analysis
- Speech-to-text and subtitle generation
- Readme generation using LLMs (integrations available for Gemini / Cohere)
- Audio description generation via TTS (ElevenLabs integration)
- Storage and retrieval via MongoDB/GridFS

## Architecture

- Frontend: Next.js (app router), TypeScript, Tailwind CSS
- Backend: FastAPI, Python 3.11+, runs with Uvicorn
- Database: MongoDB (GridFS for media blobs)
- Third-party integrations: Google Gemini, Cohere, ElevenLabs, OpenAI Whisper, etc.

Key directories:
- `backend/` — FastAPI service, API routes, services, DB handlers
- `frontend/` — Next.js app and components

## Quick Start

Prerequisites
- Node.js (v18+ recommended) and pnpm or npm/yarn
- Python 3.11+
- MongoDB instance (Atlas or self-hosted)
- API keys for services you plan to use (Gemini/Cohere/ElevenLabs)

Backend (local)

1. Create a Python virtual environment and install dependencies:

```bash
cd backend
uv sync
source .venv/bin/activate
```

2. Create a `.env` file in `backend/` with required environment variables (see below).

3. Run the FastAPI app:

```bash
cd backend
uvicorn main:app --reload
```

The API docs will be available at `http://localhost:8000/docs`.

Frontend (local)

1. Install dependencies and run dev server (pnpm preferred):

```bash
cd frontend
pnpm install
pnpm dev
# or with npm:
# npm install
# npm run dev
```

2. Open `http://localhost:3000` to use the UI. The frontend expects the backend API base URL to be set via `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

## Environment Variables

Backend (loaded via `backend/config.py`):
- `mongodb_uri` — MongoDB connection string (example: `mongodb+srv://...`)
- `mongodb_db_name` — (optional) default `access_submit`
- `google_gemini_api_key` — API key for Google Gemini / GenAI
- `elevenlabs_api_key` — API key for ElevenLabs TTS
- `cohere_api_key` — API key for Cohere
- `max_file_size_mb` — max upload size (default 100)
- `allowed_video_formats` — CSV list (default `mp4,avi,mov,mkv,webm`)
- `host` — app host (default `0.0.0.0`)
- `port` — app port (default `8000`)
- `debug` — enable reload and verbose errors

Frontend environment (in `frontend/.env` or hosting provider):
- `NEXT_PUBLIC_API_BASE_URL` — base URL for the backend API (e.g. `http://localhost:8000`)
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` — optional agent id used by ElevenLabs client

Security note: never commit secrets or API keys to version control. Use a secure secret manager or environment-level variables in your deployment.

## API Overview

The backend exposes REST endpoints. You can view full interactive docs at `/docs` once the backend is running. Key endpoints (root lists these):

- `POST /api/project/create` — Upload a video and create a processing job
- `GET /api/project/{job_id}/status` — Get processing status
- `GET /api/project/{job_id}` — Retrieve project metadata
- `GET /api/project/{job_id}/readme` — Get generated README content
- `GET /api/project/{job_id}/subtitles/{format}` — Download subtitles (`vtt`, `srt`, etc.)
- `GET /api/project/{job_id}/audio-description` — Get TTS audio description
- `POST /api/project/{job_id}/update` — Update job/submission fields
- `GET /api/project/{job_id}/export` — Export package
- `DELETE /api/project/{job_id}` — Delete project and associated files

Refer to the route implementations in `backend/api/routes/` for details.


## Deployment

- This repo is structured to support containerized deployment but the provided `docker-compose.yml` is currently empty — you can add services for frontend, backend, and MongoDB.
- For production, set `debug=false`, secure CORS origins, and use managed secrets for API keys and DB credentials.

## Troubleshooting

- Common errors:
	- `Quota exceeded` from LLM/TTS providers — check billing and usage limits for Gemini/Cohere/ElevenLabs.
	- MongoDB connection failures — verify `mongodb_uri` and network access (Atlas IP whitelist/VPC).
	- Large uploads failing — ensure `max_file_size_mb` is configured and reverse-proxy limits (nginx) accept large bodies.

## License

MIT
