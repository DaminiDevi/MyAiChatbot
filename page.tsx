"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SendHorizonal, FileText } from "lucide-react";

interface Message {
  id: number;
  content: string;
  role: "user" | "ai";
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_KEY = "";

  // Load PDF.js from CDN once
  useEffect(() => {
    const loadPdfJs = async () => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      };
      document.body.appendChild(script);
    };
    loadPdfJs();
  }, []);

  // File upload and parsing handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result as ArrayBuffer);
      const pdf = await window.pdfjsLib.getDocument(typedArray).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      console.log("📄 Parsed PDF content:\n", fullText);
      setPdfText(fullText);
      setFileUploaded(true);
    };

    reader.readAsArrayBuffer(file);
  };

  // Sending message + parsed PDF (but only show message in UI)
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      role: "user",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Create formatted history (only visible messages)
    const formattedHistory = updatedMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add combined message with parsed PDF text only for API
    const lastUserMessage = `${input}\n\n[PDF CONTEXT]:\n${pdfText}`;

    formattedHistory[formattedHistory.length - 1].parts[0].text = lastUserMessage;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: formattedHistory,
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 200,
              topP: 0.9,
              topK: 40,
            },
          }),
        }
      );

      const data = await response.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I'm sorry, I couldn't process that.";

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiText,
        role: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("API error:", error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        content: "Something went wrong. Please try again.",
        role: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">MyChatbot</h1>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-xs px-4 py-2 rounded-xl w-fit",
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-800 mr-auto"
              )}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="bg-gray-200 text-gray-800 mr-auto px-4 py-2 rounded-xl w-fit animate-pulse">
              Typing...
            </div>
          )}
        </ScrollArea>

        <CardContent className="border-t flex flex-col gap-2 p-4">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <FileText className="w-4 h-4 mr-2" /> Upload PDF
            </Button>
          </div>

          {fileUploaded && (
            <div className="text-sm text-green-600">✅ 1 PDF file uploaded</div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isTyping}>
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
