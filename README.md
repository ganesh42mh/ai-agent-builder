# AI Agent Builder

A full-stack application for building and managing AI agents using LangGraph.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The frontend will automatically connect to the backend at `http://localhost:5000/api` in development mode.

## Development
- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000
- API endpoints are available at: http://localhost:5000/api

## Production
For production deployment, the frontend will automatically use relative API paths (`/api`) which should be configured in your deployment platform (e.g., Vercel).

## Features
- Create and manage AI agents
- Custom action support
- Pipeline management
- Real-time chat interface
- MongoDB for persistent storage

## Tech Stack

- Frontend: React, Material-UI, Vite
- Backend: Node.js, Express
- AI: OpenAI, LangGraph
- Database: MongoDB
- Deployment: Vercel

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_api_key
```

## License

MIT 