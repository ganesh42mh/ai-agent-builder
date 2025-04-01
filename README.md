# AI Pipeline Builder

A web application for building and managing AI pipelines with a modern React frontend and Node.js backend.

## Features

- Create and manage AI pipelines
- Upload and process files
- Real-time pipeline execution status
- Modern and responsive UI
- Secure file handling
- Error management and logging

## Project Structure

```
ai-agent-app/
├── frontend/          # React frontend application
└── backend/          # Node.js backend server
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required environment variables:
   ```
   PORT=5000
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
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

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT`: Backend server port (default: 5000)
- `OPENAI_API_KEY`: Your OpenAI API key

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 