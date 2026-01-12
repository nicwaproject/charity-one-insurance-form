/* CONFIG */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/77ff9ceb3c38478ea9d2abcf34b8cecf/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rMK155bqgZSmjSanSFQlZiap31_jMw-vdsXUl5oUcLI"; // your endpoint

/* -----------------------------
   EXPAND / COLLAPSE COVERAGE BOXES
--------------------------------*/
document.querySelectorAll(".coverage-toggle").forEach(toggle => {
  toggle.addEventListener("change", () => {
    const target = document.getElementById(toggle.dataset.target);
    if (!target) return;
    toggle.checked ? target.classList.remove("hidden") : target.classList.add("hidden");
  });
});

const submitBtn = confirmSubmitBtn;

function setSubmitting(isSubmitting) {
  if (!submitBtn) return;

  if (isSubmitting) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="spinner"></span>
      Submitting...
    `;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtn.dataset.originalText || "Submit";
  }
}

/* -----------------------------
   PREVIEW MODAL (same behavior as previous forms)
--------------------------------*/
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
const previewBtn = document.getElementById('previewBtn');
const statusMsg = document.getElementById('statusMsg');

function escapeHtml(str){
  return (str+'').replace(/[&<>"]/g, s=> (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]
  ));
}

function showPreviewModal() {
  const rows = [];

  const visibleSections = document.querySelectorAll(".section");

  visibleSections.forEach(sec => {
    const titleEl = sec.querySelector(".section-title");
    if (!titleEl) return;

    const label = titleEl.textContent.trim();
    let value = "";

    // input text
    const input = sec.querySelector("input.answer[type='text']");
    if (input) value = input.value.trim();

    // textarea notes
    const textarea = sec.querySelector("textarea.answer");
    if (textarea) value = textarea.value.trim();

    // checkbox-based coverage selection
    const checks = sec.querySelectorAll(".coverage-toggle");
    if (checks.length) {
      const checked = Array.from(checks)
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.label);
      if (checked.length) value = checked.join(", ");
    }

    // fallback
    if (!value) value = "(not selected)";

    rows.push(`
      <div class="preview-row">
        <div class="preview-label">${label}</div>
        <div class="preview-value">${escapeHtml(value)}</div>
      </div>
    `);
  });

  previewBody.innerHTML = rows.join("");
  previewModal.classList.remove("hidden");
}

/* Trigger preview */
previewBtn.addEventListener("click", ev => {
  ev.preventDefault();
  showPreviewModal();
});

/* Close modal */
function closePreviewModal() {
  previewModal.classList.add("hidden");
  if (previewBtn) previewBtn.focus();
}
closePreview.addEventListener("click", closePreviewModal);
editBtn.addEventListener("click", closePreviewModal);

/* -----------------------------
   BUILD PAYLOAD
--------------------------------*/
function buildPayload() {
  const payload = {};

  const orgName = document.getElementById("orgName");
  if (orgName) payload.orgName = orgName.value.trim();

  const notes = document.getElementById("notes");
  if (notes) payload.notes = notes.value.trim();

  // core coverages
  payload.coreCoverages = Array.from(document.querySelectorAll('#coreSection .coverage-toggle'))
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.label);

  // additional coverages
  payload.additionalCoverages = Array.from(document.querySelectorAll('#additionalSection .coverage-toggle'))
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.label);

  payload.submittedAt = new Date().toISOString();

  return payload;
}

/* -----------------------------
   SUBMIT HANDLER (same style as other forms)
--------------------------------*/
document.getElementById('coverageForm').addEventListener('submit', ev => {
  ev.preventDefault();

  const payload = buildPayload();

  statusMsg.innerHTML = `
    <strong>No endpoint configured.</strong>
    <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
  `;
  statusMsg.classList.remove('hidden');
  statusMsg.setAttribute('aria-hidden', 'false');

  window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: 'smooth' });
});

/* Confirm submit (from preview modal) */
confirmSubmitBtn.addEventListener("click", async () => {
  closePreviewModal();
  setSubmitting(true);

  const payload = buildPayload();

  try {
    const res = await fetch(endpointURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server error");

    statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
    statusMsg.style.borderLeftColor = "var(--green)";
    statusMsg.classList.remove("hidden");

  } catch (err) {
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
    statusMsg.style.borderLeftColor = "var(--red)";
    statusMsg.classList.remove("hidden");
  } finally {
    setSubmitting(false);
    window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: 'smooth' });
  }
});