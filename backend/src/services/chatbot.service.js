import axios from 'axios';

/**
 * Chatbot Service Configuration
 * Reads configuration from environment variables with sensible defaults.
 */
export const getChatbotConfig = () => {
  const serviceUrl = process.env.CHATBOT_SERVICE_URL || '';
  const apiKey = process.env.CHATBOT_API_KEY || '';
  const timeoutMs = parseInt(process.env.CHATBOT_TIMEOUT_MS || '8000', 10);

  // CHATBOT_MOCK_MODE defaults to true if CHATBOT_SERVICE_URL is missing
  let mockMode = true;
  if (process.env.CHATBOT_MOCK_MODE !== undefined) {
    mockMode = process.env.CHATBOT_MOCK_MODE === 'true';
  } else {
    mockMode = !serviceUrl;
  }

  return {
    serviceUrl,
    apiKey,
    timeoutMs,
    mockMode
  };
};

/**
 * Generate a context-aware mock reply based on the intern's safe context and question.
 */
function generateMockResponse(message, safeContext = {}) {
  const query = (message || '').toLowerCase().trim();
  const { requestStatus, certificateType } = safeContext;

  // 1. How to request a certificate / guidance on applying
  const isRequestGuidance =
    (query.includes('request') && (query.includes('certif') || query.includes('how') || query.includes('guide') || query.includes('step') || query.includes('modal'))) ||
    (query.includes('apply') && (query.includes('certif') || query.includes('for'))) ||
    (query.includes('get') && query.includes('certif')) ||
    (query.includes('need') && query.includes('certif')) ||
    (query.includes('issue') && query.includes('certif')) ||
    query.includes('requesting a certificate') ||
    query.includes('certificate request process');

  // If asking how to request (and not explicitly asking for existing request status)
  if (
    isRequestGuidance &&
    !query.includes('status') &&
    !query.includes('track') &&
    !query.includes('where is my') &&
    !query.includes('check my')
  ) {
    return (
      'To request a certificate in the portal, follow these simple steps:\n\n' +
      '1. **Go to Certificates Tab**: In the top navigation bar, click on **Certificates**.\n' +
      '2. **Click "Request certificate"**: In the Certificate Desk section, click the **Request certificate** button to open the application modal.\n' +
      '3. **Select Certificate Type**: In the dropdown, choose the certificate you need (e.g. *Offer Letter*, *Bonafide*, *OJT Certificate*, *Experience Letter*, *Completion Certificate*, *Intern of the Month*, or *League Winner*).\n' +
      '4. **Fill Required Details**: Provide any specific information needed for your document (such as College Name for Bonafide, or Reporting Manager for Offer Letter) and enter your **Reason / Justification**.\n' +
      '5. **Submit Request**: Click **Submit Request**. Your request will enter "pending" status and be forwarded to your Team Leader for review, followed by Admin finalization.\n\n' +
      'You can track its status anytime under the **My Requests** section on the Certificates page!'
    );
  }

  // 2. Certificate Status queries
  if (
    query.includes('status') ||
    query.includes('track') ||
    query.includes('progress') ||
    query.includes('where is my certificate') ||
    query.includes('check my request')
  ) {
    if (requestStatus === 'pending') {
      return 'Your certificate request is currently under review by your Team Leader. Once recommended, it will be forwarded to the Admin team for final approval.';
    }
    if (requestStatus === 'approved') {
      return 'Your certificate request has been approved by your Team Leader and is currently being processed by the Admin team.';
    }
    if (requestStatus === 'completed') {
      return 'Great news! Your certificate has been issued and finalized. You can view or download it directly from the Certificates tab on your dashboard.';
    }
    if (requestStatus === 'rejected') {
      return 'Your previous certificate request was rejected. Please review feedback from your Team Leader or contact them for clarification before reapplying.';
    }
    return 'You have not submitted any certificate requests yet. To apply, navigate to the **Certificates** tab in the top navigation bar and click the **Request certificate** button.';
  }

  // 3. Internship timeline & duration
  if (
    query.includes('timeline') ||
    query.includes('end date') ||
    query.includes('start date') ||
    query.includes('days left') ||
    query.includes('duration')
  ) {
    return 'You can check your internship start date, end date, and completion progress in the "Internship Timeline" card right on your Dashboard.';
  }

  // 4. Download certificate
  if (query.includes('download') || query.includes('pdf')) {
    if (requestStatus === 'completed') {
      return 'You can download your finalized PDF certificate directly from the Certificates table on your dashboard using the Download action.';
    }
    return 'Once your certificate request is approved and finalized by the Admin, a secure download link will appear in your Certificates tab.';
  }

  // 5. Updating profile / mobile number
  if (query.includes('profile') || query.includes('mobile') || query.includes('phone') || query.includes('contact')) {
    return 'You can update your 10-digit mobile number directly from the Profile card on your dashboard by clicking the edit icon. For name or domain changes, please consult your administrator.';
  }

  // 6. Changing password
  if (query.includes('password') || query.includes('settings')) {
    return 'You can update your account password at any time by navigating to "Settings" in the top navigation bar.';
  }

  // 7. Greetings
  if (query.startsWith('hi') || query.startsWith('hello') || query.startsWith('hey') || query === 'help') {
    return 'Hello! 👋 I am your Intern Guidance Assistant. How can I help you today? You can ask me about your certificate request status, internship timeline, or portal features.';
  }

  // General fallback guidance
  return 'I am here to guide you through the intern portal! You can ask me about requesting a certificate, checking your current request status, tracking your internship timeline, or updating your account profile.';
}

/**
 * Isolate the external API call inside this dedicated helper function.
 * Handles Mock Mode or executes outbound HTTP request to external chatbot service.
 * Enforces strict request timeout and polite fallback handling.
 *
 * @param {string} message - Sanitized user message.
 * @param {object} safeContext - Privacy-preserving safe context (e.g. { requestStatus }).
 * @returns {Promise<{ reply: string }>}
 */
export async function callExternalChatbotService(message, safeContext = {}) {
  const config = getChatbotConfig();

  // ─── 1. MOCK MODE ───
  if (config.mockMode) {
    // Simulate realistic network latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockReply = generateMockResponse(message, safeContext);
    return { reply: mockReply };
  }

  // ─── 2. EXTERNAL CHATBOT API CALL ───
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    /* 
     * =========================================================================
     * TODO: [EXTERNAL CHATBOT TEAM CONTRACT SPECIFICATION]
     * When the external chatbot team finalizes their API contract:
     * 
     * 1. Request Payload Format:
     *    Update the payload object below according to the agreed JSON schema.
     *    Current structure sends: { message, context: safeContext }
     * 
     * 2. Authentication Headers:
     *    Verify the authentication header format with the chatbot team:
     *    e.g., 'Authorization': `Bearer ${config.apiKey}` or 'x-api-key': config.apiKey.
     * 
     * 3. Response Field Mapping:
     *    Update response extraction below if the external service returns a
     *    different structure (e.g., response.data.answer or response.data.reply).
     * =========================================================================
     */
    const payload = {
      // TODO: Confirm exact payload field names with chatbot team
      message,
      context: safeContext
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    // TODO: Confirm auth header key and format with chatbot team
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['x-api-key'] = config.apiKey;
    }

    const response = await axios.post(config.serviceUrl, payload, {
      headers,
      signal: controller.signal,
      timeout: config.timeoutMs
    });

    clearTimeout(timeoutId);

    // TODO: Confirm response field mapping with chatbot team
    const replyText =
      response.data?.reply ||
      response.data?.answer ||
      response.data?.message ||
      (typeof response.data === 'string' ? response.data : null);

    if (replyText && typeof replyText === 'string') {
      return { reply: replyText.trim() };
    }

    // Unexpected payload structure fallback
    return {
      reply: "I received a response from the guidance service, but was unable to parse the reply. Please try again shortly or consult your Team Leader."
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Polite fallback handling: never leak stack traces, service URLs, or API keys
    const isTimeout = error.code === 'ECONNABORTED' || error.name === 'CanceledError' || error.name === 'AbortError';

    if (isTimeout) {
      return {
        reply: "The guidance assistant took too long to respond. Please try asking again in a moment, or reach out to your Team Leader for urgent help."
      };
    }

    return {
      reply: "I am having trouble connecting to the guidance service right now. Please try again in a few moments, or reach out to your Team Leader for assistance."
    };
  }
}

