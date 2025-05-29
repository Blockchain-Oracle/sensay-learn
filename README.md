# Sensay Learn - AI-Powered Learning Platform

[![Sensay Hackathon](https://img.shields.io/badge/Sensay-Hackathon-blue)](https://dorahacks.io/hackathon/sensay-hackathon/buidl)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Sensay API](https://img.shields.io/badge/Sensay-API-purple)](https://sensay.ai/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-cyan)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

A comprehensive educational platform featuring 10 AI-driven learning modes powered by the Sensay API, providing personalized learning experiences across various disciplines.

[View Demo](https://sensay-learn.vercel.app) | [GitHub Repository](https://github.com/Blockchain-Oracle/sensay-learn.git) | [Hackathon Submission](https://dorahacks.io/hackathon/sensay-hackathon/buidl)

![Sensay Learn Platform](/public/screenshots/platform-overview.png)

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Learning Modules](#-learning-modules)
- [Sensay API Integration](#-sensay-api-integration)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

- **AI Mentor for Lifelong Learning** - Personalized learning paths and guidance
- **Interactive Coding Tutor** - Learn programming with real-time feedback
- **Mindfulness & Mental Health Coach** - Stress relief and emotional well-being
- **AI Debate Coach** - Improve argumentation and critical thinking
- **Historical Figures Chat** - Converse with AI replicas of famous personalities
- **Adaptive Learning for Special Needs** - Personalized accessibility features
- **Career Simulation Assistant** - Practice interviews and workplace scenarios
- **AI-Powered Study Buddy** - Study planning and progress tracking
- **Virtual Science Lab** - Conduct simulated experiments safely
- **Language & Culture Learning Coach** - Immersive language learning

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 15.2.4
  - React 19
  - TypeScript 5
  - Tailwind CSS
  - Radix UI Components
  - React Three Fiber (3D visualizations)
  - D3.js (Data visualizations)
  - CodeMirror (Code editor)

- **Backend**:
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL

- **AI Integration**:
  - Sensay API (Primary AI provider)
  - Multiple LLM model support

- **Authentication**:
  - Privy Authentication

- **Storage & Infrastructure**:
  - AWS S3
  - Redis
  - Docker

## 🏗 Architecture

The application follows a modern architecture with several key components:

![Architecture Diagram](/public/screenshots/architecture-diagram.png)

### Core Components

1. **Frontend Layer**
   - Next.js App Router for page routing
   - React components for UI
   - TailwindCSS for styling
   - Client-side state management

2. **API Layer**
   - RESTful API endpoints via Next.js API Routes
   - Real-time communication

3. **AI Layer**
   - Sensay API integration for AI capabilities
   - Custom prompt engineering
   - Context management for personalized experiences

4. **Data Layer**
   - PostgreSQL database with Prisma ORM
   - Redis caching for performance
   - AWS S3 for file storage

5. **Authentication Layer**
   - Privy authentication service
   - User management and profiles

### Data Flow

1. User requests are handled by Next.js routing
2. API routes process requests and communicate with Sensay API
3. Sensay API generates AI responses based on user context
4. Data is stored and retrieved from the database via Prisma
5. Responses are sent back to the client for rendering

## 🚦 Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- PostgreSQL 15+
- Redis 7+
- AWS Account (for S3 storage)
- Privy Account (for authentication)
- Sensay API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Blockchain-Oracle/sensay-learn.git
   cd sensay-learn
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env`

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### Docker Development

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```

## 🧠 Learning Modules

The platform offers 10 specialized learning modules:

### 1. AI Mentor
Personalized guidance with adaptive learning paths based on user progress and goals.

### 2. Coding Tutor
Interactive programming environment with real-time code execution, feedback, and challenges across multiple languages.

### 3. Mindfulness Coach
Guided meditation, stress management techniques, and emotional well-being exercises.

### 4. Debate Coach
Critical thinking development, argument structure, and persuasive communication training.

### 5. Historical Figures
Conversations with AI representations of famous historical personalities for immersive learning.

### 6. Adaptive Learning
Specialized education tools for learners with different needs and learning styles.

### 7. Career Simulation
Job interview preparation, workplace scenario training, and professional development.

### 8. Study Buddy
Study planning, progress tracking, and active recall techniques to enhance learning efficiency.

### 9. Virtual Science Lab
Interactive 3D experiments across chemistry, physics, and biology with real-time data visualization.

### 10. Language Coach
Immersive language learning with conversation practice, cultural context, and personalized feedback.

## 🤖 Sensay API Integration

This project uses the Sensay API as the primary AI provider, replacing the previous OpenAI implementation. Key integration points:

### Features
- User identification and context management
- Replica management for personalized experiences
- Support for multiple LLM models
- Fallback mechanisms for reliability

### Supported Models
- "gpt-4o" 
- "claude-3-5-haiku-latest" 
- "claude-3-7-sonnet-latest" 
- "claude-4-sonnet-20250514" 
- "grok-2-latest" 
- "grok-3-beta" 
- "deepseek-chat" 
- "o3-mini" 
- "gpt-4o-mini" 
- "huggingface-eva" 
- "huggingface-dolphin-llama"

For more details, see [SENSAY_INTEGRATION.md](./SENSAY_INTEGRATION.md)

## 📸 Screenshots

| Module | Screenshot |
|--------|------------|
| AI Mentor | ![AI Mentor](/public/screenshots/ai-mentor.png) |
| Coding Tutor | ![Coding Tutor](/public/screenshots/coding-tutor.png) |
| Debate Coach | ![Debate Coach](/public/screenshots/debate-coach.png) |
| Science Lab | ![Science Lab](/public/screenshots/science-lab.png) |
| Language Coach | ![Language Coach](/public/screenshots/language-coach.png) |

## 🤝 Contributing

We welcome contributions to Sensay Learn!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built for the [Sensay Hackathon](https://dorahacks.io/hackathon/sensay-hackathon/buidl) | [GitHub Repository](https://github.com/Blockchain-Oracle/sensay-learn.git)
