import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatWidget from '../ChatWidget';
import * as internService from '../../services/intern.service';

describe('Task M: Frontend ChatWidget Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Renders floating chat toggle button with proper accessibility attributes', () => {
    render(<ChatWidget />);

    const fab = screen.getByRole('button', { name: /open guidance assistant/i });
    expect(fab).not.toBeNull();
    expect(fab.getAttribute('aria-expanded')).toBe('false');
    expect(fab.getAttribute('aria-controls')).toBe('intern-chat-dialog');
  });

  it('2. Opens chat dialog, displays welcome message and disclaimer note', () => {
    render(<ChatWidget />);

    const fab = screen.getByRole('button', { name: /open guidance assistant/i });
    fireEvent.click(fab);

    // Dialog is open
    const dialog = screen.getByRole('dialog', { name: /intern guidance assistant/i });
    expect(dialog).not.toBeNull();
    expect(fab.getAttribute('aria-expanded')).toBe('true');

    // Disclaimer is visible
    expect(screen.getByText(/AI guidance responses may not always be accurate/i)).not.toBeNull();

    // Welcome message is visible
    expect(screen.getByText(/Hello! 👋 I'm your Intern Guidance Assistant/i)).not.toBeNull();
  });

  it('3. Sends a message, shows typing indicator, and appends bot reply', async () => {
    vi.spyOn(internService, 'sendChatMessage').mockResolvedValueOnce({
      reply: 'You can check your progress in the Internship Timeline card.'
    });

    render(<ChatWidget />);

    // Open chat
    fireEvent.click(screen.getByRole('button', { name: /open guidance assistant/i }));

    const textarea = screen.getByPlaceholderText(/Ask about your certificate, timeline/i);
    const sendBtn = screen.getByRole('button', { name: /send message/i });

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Where is my timeline?' } });
    expect(screen.getByText('21/500')).not.toBeNull();

    // Submit
    fireEvent.click(sendBtn);

    // User message is shown
    expect(screen.getByText('Where is my timeline?')).not.toBeNull();

    // Typing status exists
    expect(screen.getByLabelText(/guidance assistant is typing/i)).not.toBeNull();

    // Await bot reply
    await waitFor(() => {
      expect(screen.getByText('You can check your progress in the Internship Timeline card.')).not.toBeNull();
    });

    // Typing indicator disappeared
    expect(screen.queryByLabelText(/guidance assistant is typing/i)).toBeNull();
  });

  it('4. Handles failure with friendly error state and functional Retry button', async () => {
    const sendMock = vi
      .spyOn(internService, 'sendChatMessage')
      .mockRejectedValueOnce({
        response: { data: { message: 'The guidance assistant is temporarily unavailable.' } }
      })
      .mockResolvedValueOnce({
        reply: 'Retry succeeded! Here is your guidance.'
      });

    render(<ChatWidget />);

    // Open chat
    fireEvent.click(screen.getByRole('button', { name: /open guidance assistant/i }));

    const textarea = screen.getByPlaceholderText(/Ask about your certificate, timeline/i);
    fireEvent.change(textarea, { target: { value: 'Help with my request' } });

    // Submit message
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Wait for error card to appear
    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).not.toBeNull();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).not.toBeNull();

    // Click retry
    fireEvent.click(retryBtn);

    // Wait for success response
    await waitFor(() => {
      expect(screen.getByText('Retry succeeded! Here is your guidance.')).not.toBeNull();
    });

    // Error card should be dismissed
    expect(screen.queryByText(/temporarily unavailable/i)).toBeNull();
  });

  it('5. Closes dialog on Escape key and returns focus to FAB', () => {
    render(<ChatWidget />);

    const fab = screen.getByRole('button', { name: /open guidance assistant/i });
    fireEvent.click(fab);

    expect(screen.getByRole('dialog')).not.toBeNull();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Dialog should be closed
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(fab);
  });

  it('6. Submits message on Enter without Shift, but allows multiline with Shift+Enter', async () => {
    const sendSpy = vi.spyOn(internService, 'sendChatMessage').mockResolvedValueOnce({
      reply: 'Answer to enter key submit'
    });

    render(<ChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: /open guidance assistant/i }));
    const textarea = screen.getByPlaceholderText(/Ask about your certificate, timeline/i);

    // Shift+Enter should NOT submit
    fireEvent.change(textarea, { target: { value: 'Line 1' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(sendSpy).not.toHaveBeenCalled();

    // Regular Enter should submit
    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    });
    expect(sendSpy).toHaveBeenCalledWith('Line 1');
  });
});
