# CaptionLint API

Fastify REST API server for CaptionLint.

## Prerequisites

- PostgreSQL 14+
- Redis 6+
- Node.js 18+

## Setup

1. Copy `.env.example` to `.env` and configure:

```bash
cp ../../.env.example .env
```

2. Start PostgreSQL and Redis:

```bash
# Using Docker
docker run -d --name captionlint-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
docker run -d --name captionlint-redis -p 6379:6379 redis:7

# Or use your local installation
```

3. Run database migrations:

```bash
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
```

The API will be available at `http://localhost:4000`.

## API Endpoints

### Health

```
GET /health
```

### Lint Runs

```
POST   /lint-runs          # Create lint run (queues job)
GET    /lint-runs          # List lint runs
GET    /lint-runs/:id      # Get single lint run
GET    /lint-runs/:id/findings  # Get findings
DELETE /lint-runs/:id      # Delete lint run
```

### Vocabulary

```
GET    /vocabulary         # List vocabulary terms
POST   /vocabulary         # Add vocabulary term
DELETE /vocabulary/:id     # Delete vocabulary term
```

## Example: Create Lint Run

```bash
curl -X POST http://localhost:4000/lint-runs \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.srt",
    "format": "SRT",
    "presetId": "youtube-shorts",
    "engineVersion": "0.1.0",
    "cues": [...],
    "vocabularyTerms": ["ChatGPT", "OpenAI"]
  }'
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Fastify   │────▶│ PostgreSQL  │
│             │     │   Server    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │    Redis    │
                    │  (BullMQ)   │
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Worker    │
                    │  Processor  │
                    └─────────────┘
```

1. Client POSTs to `/lint-runs`
2. Server creates record with status `QUEUED`
3. Server adds job to BullMQ queue
4. Worker picks up job, processes lint
5. Worker updates record with findings and status
