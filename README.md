# Access Submit — A Disabled-Friendly Hackathon Submission Assistant

An AI-powered video-to-submission pipeline built with **universal accessibility at its core**. AccessSubmit transforms your demo video into a complete hackathon submission with comprehensive documentation—all designed for people with disabilities.

<img width="1800" height="1081" alt="Landing page" src="https://github.com/user-attachments/assets/5a827f58-210d-48c4-9539-95a8c0097ed9" />


## 📽️ Project Overview

Access Submit ingests demo videos and produces data ready for hackathon submission:
1. Video Upload
   ↓
2. Create Project Record (status: pending)
   ↓
3. Background Processing Starts (status: processing)
   ↓
4. Extract Audio → Transcribe (Whisper/Mock)
   ↓
5. Analyze Video Frames (Gemini Vision)
   ↓
6. Identify Tech Stack & Features
   ↓
7. Generate README.md (Gemini)
   ↓
8. Create Subtitles (SRT + VTT)
   ↓
9. Generate Audio Description (ElevenLabs)
   ↓
10. Update Status (status: completed)

## 🌍 Built For Everyone

AccessSubmit removes barriers to participation in hackathons for people with disabilities. Whether you use:
- Screen readers (blind/low vision)
- Voice control (motor disabilities)
- Dyslexia-friendly fonts (dyslexia/ADHD)
- Color blindness modes (color blindness)
- Keyboard-only navigation (any disability)



This project is intended as a reference/demo for generating accessible documentation from multimedia submissions.

## ⛲ Features
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
```
API Endpoints
Health Check

GET /health - Basic health check
GET /health/db - Database connectivity check

Project Management

POST /api/project/create - Upload video and create project
GET /api/project/{job_id} - Get project details
GET /api/project/{job_id}/status - Check processing status
POST /api/project/{job_id}/update - Update submission info
DELETE /api/project/{job_id} - Delete project

Content Retrieval

GET /api/project/{job_id}/readme - Get README content
GET /api/project/{job_id}/subtitles/{format} - Download subtitles (srt/vtt)
GET /api/project/{job_id}/audio-description - Download audio description

Export

GET /api/project/{job_id}/export - Get export metadata
GET /api/project/{job_id}/download-package - Download complete ZIP package

API Documentation
Once the server is running, visit:

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

Sample Project Submission Response:
```json
{
    "job_id": "f0bba9aa-db87-4f87-b052-2756ed58ba1f",
    "status": "completed",
    "created_at": "2026-01-04T09:45:27.015000",
    "updated_at": "2026-01-04T09:46:23.435000",
    "video": {
        "file_id": "695a36b3f3169714202c7b4c",
        "filename": "LHD-Build-Day-1.mp4",
        "size": 4793128,
        "duration": 80.16,
        "format": "mp4"
    },
    "content": {
        "readme": {
            "markdown": "# Lhd Build Day 1: Countdown to 2023\n\n## Overview\n\nThis project is a simple countdown timer web application, designed as a challenge for Local Hack Day. It displays the time remaining until the year 2023, showing the days, hours, minutes, and seconds left. The application is built with a dynamic interface, ensuring the countdown is always accurate and up-to-date. \n\nThe project consists of a basic HTML structure, styled with CSS, and functionality is added using JavaScript. It includes a README file and various assets, all of which are locally hosted. The goal is to provide a straightforward yet engaging way to visualize the time left until the next year.\n\n## Features\n\n- **Dynamic Countdown**: The main feature is a live countdown timer, which updates in real-time, providing an accurate representation of the time left until 2023.\n\n- **Visual Representation**: The countdown is displayed in a clear and concise manner, breaking down the time into days, hours, minutes, and seconds for easy readability.\n\n## Tech Stack\n\n- **HTML**: The structure and content of the web page are defined using HTML.\n- **CSS**: Styling and layout are managed through CSS, ensuring a visually appealing and responsive design.\n- **JavaScript**: This project uses JavaScript to handle the dynamic countdown functionality, updating the timer in real-time.\n\n## Installation & Setup\n\n1. Clone the repository:\n\n```bash\ngit clone https://github.com/your-username/lhd-build-day-1.git\n```\n\n2. Navigate to the project directory:\n\n```bash\ncd lhd-build-day-1\n```\n\n3. Open the `index.html` file in your preferred web browser.\n\n## Usage\n\n1. Open the `index.html` file in your browser.\n2. The page will display the current countdown to 2023.\n3. Refresh the page to ensure the countdown is up-to-date.\n\n## Accessibility\n\nThe project is designed with a simple and clean interface, ensuring ease of use for all users. The countdown is presented in a clear and concise manner, with a focus on readability.\n\n## Future Improvements\n\n- Implement a user-friendly interface to allow users to set custom countdown dates.\n- Add audio alerts or notifications for when the countdown reaches zero.\n- Integrate a sharing feature to allow users to share their countdown on social media.\n\n## Contributing\n\nContributions are welcome! Please read the [contribution guidelines](CONTRIBUTING.md) first.\n\n## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.",
            "metadata": {
                "title": "Lhd Build Day 1: Countdown to 2023",
                "tagline": "This project is a simple countdown timer web application, designed as a challenge for Local Hack Day. It displays the time remaining until the year 2023, showing the days, hours, minutes, and seconds left. The application is built with a dynamic interface, ensuring the countdown is always accurate and up-to-date.",
                "tech_stack": [
                    "To be added"
                ],
                "features": [
                    "To be added"
                ]
            }
        },
        "subtitles": {
            "transcript": " Hello, this is one of the challenges of local hack day, build day one. So I've actually been to time of fact, so without directly going to the office, let me just give you an off of the works. You could see over here, you can count on. So this is the new account on which shows how many days, how many hours, how many minutes and how many seconds are left and what's the next year that's 2003 or no, it's actually then I got from this your systems, a big time and everything and it's dynamic. So it will be for further. So this is the basic HTML and this is a CSS file. The JavaScript does a different set of things as well as I've got the read me and I've got a few as it's and this is from the local side, but the thing could be acted. So I'm going to do it. So it's going to be a new account. So yeah, I need to be able to get it. So you could get the same thing from here. Thank you.",
            "srt_file_id": "695a36edf3169714202c7b6b",
            "vtt_file_id": "695a36eef3169714202c7b6d"
        },
        "audio_description": null,
        "screenshots": [
            {
                "file_id": "695a36c0f3169714202c7b61",
                "timestamp": 0.0,
                "description": "Analysis unavailable"
            },
            {
                "file_id": "695a36c0f3169714202c7b63",
                "timestamp": 20.0,
                "description": "Analysis unavailable"
            },
            {
                "file_id": "695a36c1f3169714202c7b65",
                "timestamp": 40.04,
                "description": "Analysis unavailable"
            },
            {
                "file_id": "695a36c1f3169714202c7b67",
                "timestamp": 60.08,
                "description": "Analysis unavailable"
            },
            {
                "file_id": "695a36c1f3169714202c7b69",
                "timestamp": 80.12,
                "description": "Analysis unavailable"
            }
        ]
    },
    "submission": {
        "title": "Lhd Build Day 1: Countdown to 2023",
        "tagline": "This project is a simple countdown timer web application, designed as a challenge for Local Hack Day. It displays the time remaining until the year 2023, showing the days, hours, minutes, and seconds left. The application is built with a dynamic interface, ensuring the countdown is always accurate and up-to-date.",
        "problem_statement": "Many hackathon projects lack comprehensive documentation and accessibility features, making it difficult for judges and users to understand and evaluate the projects.",
        "solution": "This project provides an automated solution that generates professional documentation, subtitles, and audio descriptions from demo videos, making projects more accessible and easier to evaluate.",
        "tech_stack": [
            "To be added"
        ],
        "challenges": "Integrating multiple AI services (Gemini Vision, Whisper, ElevenLabs)\nOptimizing video processing performance for real-time generation\nEnsuring WCAG 2.1 AA compliance across all generated content",
        "whats_next": "Add support for multiple languages in transcription and generation\nImplement real-time streaming for faster feedback\nIntegrate with popular hackathon platforms (Devpost, HackerEarth)",
        "team": [],
        "features": [
            "To be added"
        ]
    },
    "processing": {
        "started_at": "2026-01-04T09:45:27.202000",
        "completed_at": "2026-01-04T09:46:23.435000",
        "error": null,
        "steps": {
            "video_upload": "completed",
            "audio_extraction": "completed",
            "transcription": "completed",
            "vision_analysis": "completed",
            "readme_generation": "completed",
            "subtitle_generation": "completed",
            "audio_description": "failed"
        }
    },
    "download_links": {
        "readme": "/api/project/f0bba9aa-db87-4f87-b052-2756ed58ba1f/readme",
        "srt_subtitles": "/api/project/f0bba9aa-db87-4f87-b052-2756ed58ba1f/subtitles/srt",
        "vtt_subtitles": "/api/project/f0bba9aa-db87-4f87-b052-2756ed58ba1f/subtitles/vtt",
        "audio_description": "/api/project/f0bba9aa-db87-4f87-b052-2756ed58ba1f/audio-description",
        "complete_package": "/api/project/f0bba9aa-db87-4f87-b052-2756ed58ba1f/download-package"
    }
}
```

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


## 🎨 Design System

### Color Tokens (Semantic)
- **High Contrast Foundation**: Black/white text on white/black backgrounds
- **Gray Scale**: Five semantic gray levels for UI hierarchy
- **Status Colors**: 
  - Red (#C50000) for destructive/errors
  - Yellow/Orange for warnings
  - Green for success states
- **Custom Radius**: 0.75rem default for rounded corners

### Typography
- **Geist Sans**: Default body font (modern, accessible)
- **Geist Mono**: Code/monospace content
- **OpenDyslexic**: Dyslexia-friendly alternative
- **Lexend**: Geometric dyslexic-friendly font
- **Comic Sans**: User preference for neurodiverse users

### Spacing & Layout
- **1.6x line height**: Improved readability
- **0.05em letter spacing**: Distinct character recognition
- **Flexbox-first**: Responsive layouts that work at any zoom level
- **Mobile-first responsive**: Scales from mobile to 4K displays

---

## 🛠️ Accessibility Features by Component

### Hot Key Support
  - `Cmd+Shift+/Alt+H` - Navigate to Help
  - `Cmd+Shift+/Alt+S` - Go to Submit
  - `Cmd+Shift+/Alt+A` - Focus Assistant
  - `Cmd+Shift+/Alt+?` - Show all hotkeys

### Cognitive Accessibility
- **Dyslexia settings panel**: Toggle fonts, spacing, letter size in Help page
- **Live preview**: See typography changes in real-time
- **Apply & Reset buttons**: Test settings before permanent changes
- **Persistent storage**: Preferences saved across sessions

### Motor Accessibility
- **Large touch targets**: 44px minimum for all buttons
- **Skip links**: Jump to main content, submit page, help
- **Sticky navigation**: Always accessible on desktop
- **Voice commands**: Complete app control without mouse
- **Keyboard shortcuts**: Global hotkeys for power users

### Visual Accessibility
- **High contrast mode**: AAA 7:1+ contrast ratios
- **Color blindness modes**: Three complete palette remaps
- **Dark/light themes**: Reduces eye strain, improves visibility
- **Focus indicators**: Clear 4px outline with 4px offset
- **Large text scaling**: Supports up to 200% browser zoom
- **Animations**: Zero to very minimal animations

### Hearing Accessibility
- **Video transcription**: Every video gets full auto-transcript
- **A/V feedback**: Ensured most of the feedback/reponses have Audio/Vide Supports

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

## Challenges ran into

- `Quota exceeded` from LLM/TTS providers — check billing and usage limits for Gemini/Cohere/ElevenLabs.
- MongoDB connection failures — verify `mongodb_uri` and network access (Atlas IP whitelist/VPC).
- Large uploads failing — ensure `max_file_size_mb` is configured and reverse-proxy limits (nginx) accept large bodies.
- Failed to deploy with Vultr, have lost of constraints with respect to Credits/Credit card usage.

## License
MIT
