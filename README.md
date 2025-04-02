# AI Agent Application

A full-stack application for creating and managing AI agents using LangGraph and OpenAI.

## Features

- Create custom AI agents with specific instructions
- Real-time chat interface with agents
- Persistent chat history
- Memory management using MongoDB
- Built with React and Node.js

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

## Development

1. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm run dev
```

## Deployment

The application is configured for deployment on Vercel. The `vercel.json` file handles both frontend and backend routing.

## License

MIT 