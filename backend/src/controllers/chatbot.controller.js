import CertificateRequest from '../models/CertificateRequest.js';
import { callExternalChatbotService } from '../services/chatbot.service.js';

/**
 * Handle incoming intern chat message.
 * POST /api/intern/chat
 */
export async function chatWithBot(req, res) {
  try {
    const { message } = req.body || {};

    // ─── 1. Validation & Security Guardrails ───
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        message: 'Message is required and must be a valid text string.'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        message: 'Message cannot be empty.'
      });
    }

    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        message: 'Message exceeds maximum allowed length of 500 characters.'
      });
    }

    // ─── 2. Strict Data Privacy: Build Safe Context ───
    // Strictly retrieve ONLY the authenticated intern's own request status.
    // NEVER include passwords, emails, intern codes, or any other user's data.
    let safeContext = {
      requestStatus: 'none',
      certificateType: null
    };

    try {
      const latestRequest = await CertificateRequest.findOne({ userId: req.user.id })
        .sort({ createdAt: -1, requestedAt: -1 })
        .select('status certificateType')
        .lean();

      if (latestRequest) {
        safeContext = {
          requestStatus: latestRequest.status || 'none',
          certificateType: latestRequest.certificateType || null
        };
      }
    } catch {
      // Safe fallback if database query encounters an issue
      safeContext = { requestStatus: 'unknown', certificateType: null };
    }

    // ─── 3. Delegate to Adapter Layer (Zero Persistence) ───
    // We strictly do NOT persist messages or conversations to the database.
    const result = await callExternalChatbotService(trimmedMessage, safeContext);

    return res.status(200).json({
      reply: result.reply || "I am here to guide you. How can I assist you with your internship today?"
    });
  } catch (error) {
    // ─── 4. Polite Fallback: Never leak error stack or internals ───
    return res.status(500).json({
      message: 'The guidance assistant is temporarily unavailable. Please try again shortly or contact your Team Leader.'
    });
  }
}

