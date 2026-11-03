import React, { useState, useRef, useEffect } from 'react';
import useChat from '../hooks/useChat';
import './ChatWidget.css';

/**
 * Parses simple inline markdown bold and italic formatting safely.
 */
const formatChatContent = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

/**
 * ChatWidget Component
 * Floating conversational assistant for interns with accessible keyboard controls,
 * responsive theming, friendly retry states, and disclaimer guidance.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, error, sendMessage, retryLastMessage, clearChat } = useChat();

  const fabRef = useRef(null);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, error, isOpen]);

  // Focus management: focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      // Delay slightly for smooth transition and DOM readiness
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Accessibility: Handle Escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape key closes the widget and returns focus to FAB
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        fabRef.current?.focus();
        return;
      }

      // Focus trap within container
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      fabRef.current?.focus();
    } else {
      setIsOpen(true);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    sendMessage(trimmed);
    setInputValue('');
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = inputValue.length;
  const isNearLimit = charCount >= 450 && charCount < 500;
  const isAtLimit = charCount >= 500;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        ref={fabRef}
        type="button"
        className="chat-widget-fab"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="intern-chat-dialog"
        aria-label={isOpen ? 'Close Guidance Assistant' : 'Open Guidance Assistant'}
        title="Guidance Assistant"
      >
        <i className={isOpen ? 'bi bi-x-lg' : 'bi bi-chat-dots-fill'} aria-hidden="true" />
        {!isOpen && <span className="chat-fab-badge" aria-hidden="true" />}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <section
          ref={containerRef}
          id="intern-chat-dialog"
          className="chat-panel-container"
          role="dialog"
          aria-modal="true"
          aria-label="Intern Guidance Assistant"
        >
          {/* Header */}
          <header className="chat-panel-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar" aria-hidden="true">
                <i className="bi bi-robot" />
              </div>
              <div className="chat-header-titles">
                <h2 className="chat-header-title">Guidance Assistant</h2>
                <div className="chat-header-status">
                  <span className="chat-status-dot" aria-hidden="true" />
                  <span>Online • AI Helper</span>
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-header-btn"
                onClick={clearChat}
                title="Clear conversation"
                aria-label="Clear conversation history"
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="chat-header-btn"
                onClick={handleToggle}
                title="Close chat"
                aria-label="Close guidance chat"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Disclaimer Banner */}
          <div className="chat-disclaimer" role="note">
            <i className="bi bi-info-circle-fill" aria-hidden="true" />
            <span>
              <strong>Note:</strong> AI guidance responses may not always be accurate. For official verification, consult your Team Leader.
            </span>
          </div>

          {/* Messages Area */}
          <div
            className="chat-messages-container"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${msg.sender}`}
              >
                <div className="chat-bubble">
                  {formatChatContent(msg.text)}
                </div>
                <span className="chat-message-time">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div
                className="chat-typing-bubble"
                role="status"
                aria-label="Guidance assistant is typing"
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}

            {/* Error & Retry State */}
            {error && (
              <div className="chat-error-card" role="alert">
                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                <div className="chat-error-body">
                  <p className="chat-error-message">{error}</p>
                  <button
                    type="button"
                    className="chat-retry-btn"
                    onClick={retryLastMessage}
                    disabled={isLoading}
                  >
                    <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Input Area */}
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <div className="chat-input-wrapper">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                rows={1}
                placeholder="Ask about your certificate, timeline..."
                value={inputValue}
                maxLength={500}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                aria-label="Type your message"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                title="Send message (Enter)"
              >
                <i className="bi bi-send-fill" aria-hidden="true" />
              </button>
            </div>
            <div className="chat-input-meta">
              <span>Press Enter to send</span>
              <span
                className={`chat-char-counter ${
                  isAtLimit ? 'limit-reached' : isNearLimit ? 'limit-near' : ''
                }`}
              >
                {charCount}/500
              </span>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
