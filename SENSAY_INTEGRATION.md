# Sensay API Integration

## Overview

This project has been updated to replace OpenAI with Sensay as the primary AI provider. Sensay provides similar capabilities for chat completions, with additional features.

## Changes Made

1. Created `lib/ai/sensay.ts` with equivalent functions to the previous OpenAI implementation:
   - `generateChatResponse`: Generate AI responses using Sensay
   - `generateSummary`: Generate text summaries
   - `generateFlashcards`: Create educational flashcards
   - Added `initializeUser`: Ensure users exist in Sensay system

2. Updated API routes:
   - `app/api/chat/route.ts`: Replaced OpenAI with Sensay
   - `app/api/chat/mindfulness/route.ts`: Replaced OpenAI with Sensay

3. Updated services:
   - `lib/services/youtube-service.ts`: Now uses Sensay for content analysis
   - `lib/services/scraping-service.ts`: Now uses Sensay for content analysis

## Environment Configuration

Add the following to your `.env` file:

```
# Sensay API configuration
SENSAY_API_KEY=your_sensay_api_key
SAMPLE_USER_ID=default_user_id_fallback
```

The default values in the code are:
- `SENSAY_API_KEY`: "2b1f87eed6ffddc97f1fc30393f59432f986e2fd99073b939f6996bbb175bd69"
- `SAMPLE_USER_ID`: "73a8ac8e-2f3c-4896-bd67-54bbcc2040f8"

## How Sensay Integration Works

1. **User Identification**: Sensay requires a user ID for each request. The system creates users automatically if they don't exist.

2. **Replica Management**: Each user gets a "replica" (AI model instance) that maintains context across conversations. The system automatically creates replicas when needed.

3. **API Requests**: All AI requests now go through Sensay, with similar parameters to the previous OpenAI implementation. Key differences:
   - System prompts are included in the message content rather than as separate parameters
   - The userId parameter is required for proper context management

4. **Fallback Mechanism**: If Sensay fails, the system falls back to static responses based on message keywords.

## Supported Models

Sensay supports multiple models including:
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

The default model in the implementation is "claude-3-5-haiku-latest". 