# AI Story Summarizer for Social Media Cards

An AI-powered newsroom platform that converts full news articles into concise summaries, pull quotes, hashtags, and social media captions using Gemini AI.

## Key Features

* Custom database-backed user authentication
* Google Gemini AI content generation
* Generation history and analytics dashboards
* Branded social media card previews and downloads
* Multi-user data isolation

## Technology Stack

* Frontend: React, Vite, Tailwind CSS, Lucide React, Motion
* Backend: Node.js, Express, Drizzle ORM
* Database: PostgreSQL in production with local file fallback for development
* AI: Official `@google/genai` SDK

## Environment Configuration

Create a `.env` file in the root directory:

```bash
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:5000"

SQL_HOST=
SQL_DB_NAME=
SQL_USER=
SQL_PASSWORD=
SQL_ADMIN_USER=
SQL_ADMIN_PASSWORD=
```

## Local Usage

Install dependencies:

```bash
npm install
```

Run the full app:

```bash
npm run dev
```

Open `http://localhost:5000` in your browser.

## Deployment

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```
