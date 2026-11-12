import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateTemplateEditor from "../components/CertificateTemplateEditor";
import Toast from "../../../shared/components/Toast";
import BrandLogo from "../../shared/components/BrandLogo";
import {
  createCertificateTemplate,
  getCertificateTemplates,
  getTemplatePlaceholders,
  updateCertificateTemplate,
} from "../services/admin.service";
import { ArrowLeft, Plus, Eye, Code, Save, RefreshCw, AlertCircle } from "lucide-react";

const SAMPLE_DATA = {
  fullName: "Sarvesh Choudhary",
  internCode: "UPT-2026-001",
  domain: "Web Development",
  startDate: "01 October 2026",
  endDate: "31 December 2026",
  issueDate: "06 October 2026",
  requestNumber: "CERT-2026-00019",
  certificateTitle: "Certificate of Completion",
  qrCodeUrl: "https://example.com/verify/CERT-2026-00019",
};

function getTemplateHtml(template) {
  return template?.htmlContent || template?.content || "";
}

function replacePlaceholders(html) {
  if (!html) return "";

  let previewHtml = html;

  Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    previewHtml = previewHtml.replace(placeholder, value);
  });

  return previewHtml;
}

export default function CertificateTemplateEditorPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [placeholders, setPlaceholders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [previewMode, setPreviewMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [workingHtml, setWorkingHtml] = useState("");
  const [editorController, setEditorController] = useState(null);
  const [templateDetails, setTemplateDetails] = useState({
    templateCode: "",
    templateName: "",
    certificateType: "custom",
    title: "Certificate",
    status: "draft",
  });
  const isDirtyRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmLinkNavigation = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!isDirtyRef.current || !link || link.target === "_blank" || link.hasAttribute("download")) return;
      const next = new URL(link.href, window.location.href);
      if (next.origin !== window.location.origin || next.href === window.location.href) return;
      if (!window.confirm("You have unsaved template changes. Leave this page and discard them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", confirmLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", confirmLinkNavigation, true);
    };
  }, []);

  const starterHtml = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;min-height:794px;padding:80px;background:#fff;color:#172554;font-family:Arial,sans-serif;text-align:center}.certificate{border:8px double #d4a72c;min-height:620px;padding:70px 36px}h1{color:#123a67;font-size:42px}p{font-size:20px}</style></head><body><main class="certificate"><h1>{{certificateTitle}}</h1><p>This certificate is presented to</p><h2>{{fullName}}</h2><p>For completing {{domain}}</p><p>{{startDate}} — {{endDate}}</p><p>Certificate {{requestNumber}}</p><img width="100" src="{{qrCodeUrl}}" alt="Verification QR code"></main></body></html>`;

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) {
      return null;
    }

    return (
      templates.find(
        (template) => template._id === selectedTemplateId
      ) || null
    );
  }, [selectedTemplateId, templates]);

  /*
   * Load certificate templates
   */
  useEffect(() => {
    let mounted = true;

    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCertificateTemplates();

        if (!mounted) return;

        const templateList = response?.templates || [];

        const validTemplates = templateList.filter(
          (template) =>
            template?._id &&
            template?.templateCode &&
            template?.templateName
        );

        setTemplates(validTemplates);

        if (validTemplates.length > 0) {
          const selected = validTemplates[0];
          setSelectedTemplateId(selected._id);
          setWorkingHtml(getTemplateHtml(selected));
          setTemplateDetails({
            templateCode: selected.templateCode || "",
            templateName: selected.templateName || "",
            certificateType: selected.certificateType || "custom",
            title: selected.title || selected.templateName || "Certificate",
            status: selected.status || "draft",
          });
        }
      } catch (err) {
        console.error(
          "Failed to load certificate templates:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load certificate templates."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load supported placeholders
   */
  useEffect(() => {
    let mounted = true;

    const loadPlaceholders = async () => {
      try {
        setLoadingPlaceholders(true);

        const response = await getTemplatePlaceholders();

        if (!mounted) return;

        setPlaceholders(response?.placeholders || []);
      } catch (err) {
        console.error(
          "Failed to load placeholders:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load template placeholders."
        );
      } finally {
        if (mounted) {
          setLoadingPlaceholders(false);
        }
      }
    };

    loadPlaceholders();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Save template
   */
  const handleSave = async (htmlContent) => {
    if (!createMode && !selectedTemplate?._id) {
      throw new Error("Select a certificate template or create a new one.");
    }

    if (createMode && Object.values(templateDetails).some((value) => !value.trim())) {
      throw new Error("Complete the template code, name, certificate type, and title before saving.");
    }

    if (!htmlContent || !htmlContent.trim()) {
      throw new Error("Template HTML cannot be empty.");
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = createMode
        ? await createCertificateTemplate({ ...templateDetails, htmlContent })
        : await updateCertificateTemplate(selectedTemplate._id, { ...templateDetails, htmlContent });

      const updatedTemplate = response?.template;
      if (updatedTemplate) {
        setTemplates((currentTemplates) => createMode
          ? [updatedTemplate, ...currentTemplates]
          : currentTemplates.map((template) => template._id === updatedTemplate._id ? updatedTemplate : template));
        setSelectedTemplateId(updatedTemplate._id);
        setWorkingHtml(htmlContent);
        setCreateMode(false);
      }

      setIsDirty(false);
      setSuccess(createMode ? "Certificate template created successfully." : "Certificate template saved successfully.");
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to save certificate template.";
      setError(message);
      throw new Error(message, { cause: err });
    } finally {
      setSaving(false);
    }
  };

  const startNewTemplate = () => {
    if (isDirty && !window.confirm("Discard unsaved template changes?")) return;
    setTemplateDetails({ templateCode: "", templateName: "", certificateType: "custom", title: "Certificate", status: "draft" });
    setCreateMode(true);
    setWorkingHtml(starterHtml);
    setIsDirty(false);
    setEditorController(null);
    setPreviewMode(false);
    setError("");
    setSuccess("");
  };

  const handleTemplateChange = (event) => {
    if (isDirty && !window.confirm("Discard unsaved template changes?")) return;
    const id = event.target.value;
    setSelectedTemplateId(id);
    const nextTemplate = templates.find((template) => template._id === id);
    setWorkingHtml(getTemplateHtml(nextTemplate));
    if (nextTemplate) {
      setTemplateDetails({
        templateCode: nextTemplate.templateCode || "",
        templateName: nextTemplate.templateName || "",
        certificateType: nextTemplate.certificateType || "custom",
        title: nextTemplate.title || nextTemplate.templateName || "Certificate",
        status: nextTemplate.status || "draft",
      });
    }
    setCreateMode(false);
    setIsDirty(false);
    setEditorController(null);
    setError("");
    setSuccess("");
    setPreviewMode(false);
  };

  const handleEditorChange = (html) => {
    setWorkingHtml(html);
  };

  const handleEditorDirtyChange = (dirty) => {
    setIsDirty(dirty);
  };

  const handleEditorReady = (controller) => {
    setEditorController(controller);
  };

  /*
   * Generate preview HTML
   */
  const previewHtml = useMemo(() => {
    const html = createMode || isDirty ? workingHtml : getTemplateHtml(selectedTemplate);
    if (!html) {
      return "";
    }

    return replacePlaceholders(html);
  }, [createMode, isDirty, selectedTemplate, workingHtml]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div
        className="certificate-template-editor-page certificate-template-page-loading"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "var(--text-secondary)",
        }}
      >
        <p role="status">Loading certificate templates…</p>
      </div>
    );
  }

  /*
   * Error state when templates could not load
   */
  if (error && templates.length === 0) {
    return (
      <div
        className="certificate-template-editor-page"
        style={{
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <h1>Certificate Template Editor</h1>

        <div className="certificate-template-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="certificate-template-editor-page"
      style={{
        minHeight: "100vh",
        padding: "24px 32px",
        backgroundColor: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (isDirty && !window.confirm("Discard unsaved template changes?")) return;
          navigate("/admin/dashboard?view=certificates");
        }}
        className="admin-btn-sm"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}
      >
        <ArrowLeft size={14} />
        <span>Back to Admin Dashboard</span>
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            {createMode ? "Create Certificate Template" : "Certificate Template Studio"}
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Design, edit, and preview enterprise certificate templates on an A4 landscape layout.
          </p>
        </div>

        <div className="certificate-template-header-actions" style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="admin-btn-sm admin-btn-primary-sm"
            onClick={startNewTemplate}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} />
            <span>New Template</span>
          </button>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => setPreviewMode((value) => !value)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {previewMode ? <Code size={14} /> : <Eye size={14} />}
            <span>{previewMode ? "Code Editor" : "Live Sample Preview"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && <Toast type="error" message={error} onClose={() => setError("")} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Template selector & Metadata */}
      <div
        style={{
          marginBottom: "20px",
          padding: "18px 20px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        {!createMode && (
          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="certificate-template" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Active Certificate Template
            </label>
            <select
              id="certificate-template"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              style={{
                width: "100%",
                maxWidth: "480px",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: "13px",
              }}
            >
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.templateName} ({template.templateCode})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="certificate-template-create-fields">
          {[
            ["templateCode", "Template code"],
            ["templateName", "Template name"],
            ["certificateType", "Certificate type"],
            ["title", "Display title"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                required
                value={templateDetails[name]}
                onChange={(event) => {
                  setIsDirty(true);
                  setTemplateDetails((current) => ({ ...current, [name]: event.target.value }));
                }}
              />
            </label>
          ))}
          <label>
            Status
            <select
              value={templateDetails.status}
              onChange={(event) => {
                setIsDirty(true);
                setTemplateDetails((current) => ({ ...current, status: event.target.value }));
              }}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        {!createMode && selectedTemplate && (
          <small className="certificate-template-version" style={{ color: "var(--text-muted)", marginTop: "8px", display: "block" }}>
            Revision: {selectedTemplate.version || 1}
          </small>
        )}
      </div>

      {/* Main Studio content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 280px",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Editor / Preview */}
        <div
          style={{
            minWidth: 0,
            overflow: "auto",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            padding: "16px",
          }}
        >
          {previewMode ? (
            <div>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                A4 Landscape Live Preview (Rendered with sample intern data)
              </h2>

              <div
                style={{
                  width: "1123px",
                  minHeight: "794px",
                  margin: "0 auto",
                  background: "#ffffff",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-md)",
                  borderRadius: "8px",
                }}
              >
                <iframe
                  title="Certificate Preview"
                  srcDoc={previewHtml}
                  style={{
                    width: "1123px",
                    height: "794px",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
            </div>
          ) : (
            <CertificateTemplateEditor
              key={createMode ? "new-template" : selectedTemplate?._id || "new-template"}
              initialHtml={createMode ? starterHtml : getTemplateHtml(selectedTemplate)}
              onSave={handleSave}
              onChange={handleEditorChange}
              onDirtyChange={handleEditorDirtyChange}
              onEditorReady={handleEditorReady}
              saving={saving}
            />
          )}
        </div>

        {/* Placeholder panel */}
        <aside
          style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--bg-surface)",
            padding: "18px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Insert Placeholders
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", marginBottom: "12px" }}>
            Click any token to insert into cursor position.
          </p>

          {loadingPlaceholders ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Loading placeholders…</p>
          ) : placeholders.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No placeholders available.</p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "6px",
              }}
            >
              {placeholders.map((placeholder) => (
                <li key={placeholder}>
                  <button
                    type="button"
                    className="certificate-placeholder-button"
                    disabled={!editorController || previewMode}
                    onClick={() => editorController?.insertPlaceholder(placeholder)}
                  >
                    <code>{placeholder}</code>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <hr
            style={{
              margin: "18px 0",
              border: "none",
              borderTop: "1px solid var(--border-subtle)",
            }}
          />

          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            Sample Interpolation
          </h3>

          <div
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              display: "grid",
              gap: "4px",
            }}
          >
            <div><strong>Name:</strong> {SAMPLE_DATA.fullName}</div>
            <div><strong>Code:</strong> {SAMPLE_DATA.internCode}</div>
            <div><strong>Domain:</strong> {SAMPLE_DATA.domain}</div>
            <div><strong>Request:</strong> {SAMPLE_DATA.requestNumber}</div>
            <div><strong>Issue Date:</strong> {SAMPLE_DATA.issueDate}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
