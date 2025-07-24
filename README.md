# MyAiChatbot
# 💬 Gemini ChatBot (v2.5) – PDF-Aware AI Chat Interface

An interactive, intelligent chatbot powered by **Google's Gemini 2.5 (via Gemini Flash API)**, designed to handle human-like conversation and extract content from PDF files to answer contextually.

## 🚀 Features

- 🤖 Chat with Google Gemini 2.5 (Flash) model
- 📄 Upload PDF files — parses and sends content to the API
- 💬 Clean chat UI with typing indicator
- ⚡ Fast, low-latency responses using Gemini Flash
- ✅ Built with full type safety (TypeScript + React)

## 🧠 Model Used

This chatbot uses **Gemini 2.5**, Google's most advanced multimodal LLM, accessed via the `v1beta/generateContent` endpoint of the **Gemini Flash API**. It's optimized for:
- Speed and efficiency
- Long-context handling
- Rich natural language understanding

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS
- **UI Framework:** ShadCN UI
- **Icons:** Lucide React
- **Scroll UI:** ScrollArea
- **PDF Parsing:** PDF.js via CDN (no NPM install required)
- **AI API:** Google Gemini Flash (v1beta endpoint)

## 📦 Installation

> Requires Node.js 18+ and a valid Google AI API key.

```bash
git clone https://github.com/yourusername/gemini-chatbot.git
cd gemini-chatbot
npm install
npm run dev

