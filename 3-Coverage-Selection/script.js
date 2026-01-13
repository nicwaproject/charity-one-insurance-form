/* CONFIG */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/77ff9ceb3c38478ea9d2abcf34b8cecf/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rMK155bqgZSmjSanSFQlZiap31_jMw-vdsXUl5oUcLI";

/* ELEMENTS */
const form = document.getElementById("coverageForm");
const submitBtn = document.getElementById("submitBtn");
const previewBtn = document.getElementById("previewBtn");
const statusMsg = document.getElementById("statusMsg");

/* -----------------------------
   COVERAGE TOGGLE (expand/collapse)
--------------------------------*/
document.querySelectorAll(".coverage-toggle").forEach(toggle => {
  toggle.addEventListener("change", () => {
    const target = document.getElementById(toggle.dataset.target);
    if (!target) return;
    toggle.checked
      ? target.classList.remove("hidden")
      : target.classList.add("hidden");
  });
});

/* -----------------------------
   PREVIEW MODAL
--------------------------------*/
const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");

function escapeHtml(str) {
  return (str + "").replace(/[&<>"]/g, s =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[s])
  );
}

function showPreviewModal(payload) {
  const rows = [];

  function addRow(label, value) {
    rows.push(`
      <div class="preview-row">
        <div class="preview-label">${label}</div>
        <div class="preview-value">${escapeHtml(value || "(not selected)")}</div>
      </div>
    `);
  }

  addRow("Organization Name", payload.orgName || "(not provided)");
  addRow("Core Coverages", payload.coreCoverages.join(", ") || "(none)");
  addRow("Additional Coverages", payload.additionalCoverages.join(", ") || "(none)");
  addRow("Notes", payload.notes || "(none)");
  addRow("Submitted At", payload.submittedAt);

  previewBody.innerHTML = rows.join("");
  previewModal.classList.remove("hidden");
}

function closePreviewModal() {
  previewModal.classList.add("hidden");
  previewBtn.focus();
}

closePreview.addEventListener("click", closePreviewModal);
editBtn.addEventListener("click", closePreviewModal);

/* -----------------------------
   BUILD PAYLOAD
--------------------------------*/
function buildPayload() {
  return {
    orgName: document.getElementById("orgName")?.value.trim() || "",
    notes: document.getElementById("notes")?.value.trim() || "",
    coreCoverages: Array.from(
      document.querySelectorAll("#coreSection .coverage-toggle")
    )
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.label),
    additionalCoverages: Array.from(
      document.querySelectorAll("#additionalSection .coverage-toggle")
    )
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.label),
    submittedAt: new Date().toISOString()
  };
}

/* -----------------------------
   SUBMIT UX HELPERS
--------------------------------*/
function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? "Submitting…" : "Submit";
}

/* -----------------------------
   MAIN SUBMIT HANDLER
--------------------------------*/
async function handleSubmit() {
  const payload = buildPayload();

  setSubmitting(true);
  statusMsg.classList.remove("hidden");
  statusMsg.style.borderLeftColor = "var(--blue)";
  statusMsg.innerHTML = `
    <strong>Submitting your request…</strong><br/>
    Please wait and do not close this page.
  `;

  try {
    const res = await fetch(endpointURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server error");

    statusMsg.style.borderLeftColor = "var(--green)";
    statusMsg.innerHTML = `
    <strong>Submitted successfully.</strong>
    `;
    form.reset();

  } catch (err) {
    statusMsg.style.borderLeftColor = "var(--red)";
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
  } finally {
    setSubmitting(false);
    window.scrollTo({
      top: statusMsg.offsetTop - 20,
      behavior: "smooth"
    });
  }
}

/* -----------------------------
   EVENTS
--------------------------------*/
form.addEventListener("submit", ev => {
  ev.preventDefault();
  handleSubmit();
});

previewBtn.addEventListener("click", ev => {
  ev.preventDefault();
  showPreviewModal(buildPayload());
});

confirmSubmitBtn.addEventListener("click", () => {
  closePreviewModal();
  handleSubmit();
});