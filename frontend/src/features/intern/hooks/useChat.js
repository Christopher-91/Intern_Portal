import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../services/intern.service';

const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const INITIAL_MESSAGE = {
  id: 'welcome-msg',
  sender: 'bot',
  text: "Hello! 👋 I'm your Intern Guidance Assistant. You can ask me about your certificate status, internship timeline, or navigating the portal. How can I assist you today?",
  timestamp: formatTime(),
};

/**
 * Custom hook to manage chatbot in-memory session history, typing state,
 * error state, and retry mechanism.
 */
export function useChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastMessageRef = useRef('');

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    if (trimmed.length > 500) {
      setError('Message exceeds the maximum limit of 500 characters.');
      return;
    }

    lastMessageRef.current = trimmed;
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(trimmed);
      const botReplyText =
        data?.reply ||
        data?.message ||
        "I'm here to assist you! If you need specific help with your certificate, feel free to ask.";

      const botMessage = {
        id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const fallbackErrorMessage =
        err.response?.data?.message ||
        'Unable to reach the guidance assistant. Please try again or consult your Team Leader.';
      setError(fallbackErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current || isLoading) return;
    const textToRetry = lastMessageRef.current;
    setError(null);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(textToRetry);
      const botReplyText =
        data?.reply ||
        data?.message ||
        "I'm here to assist you! If you need specific help with your certificate, feel free to ask.";

      const botMessage = {
        id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const fallbackErrorMessage =
        err.response?.data?.message ||
        'Unable to reach the guidance assistant. Please try again or consult your Team Leader.';
      setError(fallbackErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: formatTime(),
      },
    ]);
    setError(null);
    lastMessageRef.current = '';
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearChat,
  };
}

export default useChat;

