# Midnight Analytics | YouTube

A conversational AI dashboard for YouTube content analytics, featuring an Apple-inspired minimal design language.

## Prerequisites
- Node.js 18+
- Python 3.10+
- A Google Gemini API Key

## Setup & Running Locally

1. **Clone the repository**

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Generate mock dataset
python generate_mock_data.py
```

3. **Environment Variables**
Create a `.env` file in the `backend` directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the Backend server**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

5. **Start Frontend development server** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Docker Compose Setup

For a one-click deployment:
1. Ensure `.env` is created in root or passed to the backend.
2. Run:
```bash
docker-compose up --build
```
This will spin up both the Next.js frontend on port 3000 and the FastAPI backend on port 8000.

## Core Stack
- **Frontend**: Next.js 14, Tailwind CSS v4, Recharts, Framer Motion
- **Backend**: Python FastAPI, SQLite (in-memory caching), Pandas
- **AI Agent**: Google Gemini 2.5 Flash (Two-Pass architecture)
