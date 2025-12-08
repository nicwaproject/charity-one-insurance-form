const form = document.getElementById("coverageForm");
const previewBtn = document.getElementById("previewBtn");
const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");
const statusMsg = document.getElementById("statusMsg");

function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function escapeHtml(str){
  return (str ?? "").replace(/[&<>'"]/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" }[c])
  );
}

/* BUILD PAYLOAD */
function buildPayload(){
  const selectedCoverages = [...document.querySelectorAll("input[type='checkbox']:checked")]
    .map(cb => cb.value);

  return {
    coverages: selectedCoverages,
    helpType: document.getElementById("helpType").value,
    contactName: document.getElementById("contactName").value,
    contactEmail: document.getElementById("contactEmail").value,
    contactPhone: document.getElementById("contactPhone").value,
    organizationWebsite: document.getElementById("orgWebsite").value,
    organizationName: document.getElementById("orgName").value,
    additionalNotes: document.getElementById("additionalNotes").value,
    submittedAt: new Date().toISOString()
  };
}

/* VALIDATION */
function validateForm(){
  if(!form.checkValidity()){
    form.reportValidity();
    return false;
  }
  return true;
}

/* PREVIEW */
function showPreview(payload){
  const rows = [];

  rows.push(`<div class="preview-row"><div class="preview-label">Selected Coverages</div><div class="preview-value">${escapeHtml(payload.coverages.join(", ") || "(none)")}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Request Type</div><div class="preview-value">${escapeHtml(payload.helpType)}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Contact Name</div><div class="preview-value">${escapeHtml(payload.contactName)}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Email</div><div class="preview-value">${escapeHtml(payload.contactEmail)}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Phone</div><div class="preview-value">${escapeHtml(payload.contactPhone || "(not provided)")}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Website</div><div class="preview-value">${escapeHtml(payload.organizationWebsite || "(not provided)")}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Organization</div><div class="preview-value">${escapeHtml(payload.organizationName || "(not provided)")}</div></div>`);
  rows.push(`<div class="preview-row"><div class="preview-label">Notes</div><div class="preview-value">${escapeHtml(payload.additionalNotes || "(not provided)")}</div></div>`);

  previewBody.innerHTML = rows.join("");
  show(previewModal);
}

/* EVENTS */
previewBtn.addEventListener("click", () => {
  if(!validateForm()) return;
  showPreview(buildPayload());
});

closePreview.addEventListener("click", () => hide(previewModal));
editBtn.addEventListener("click", () => hide(previewModal));

confirmSubmitBtn.addEventListener("click", () => {
  hide(previewModal);
  form.dispatchEvent(new Event("submit"));
});

/* SUBMIT (DEMO MODE JSON) */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if(!validateForm()) return;

  const payload = buildPayload();

  statusMsg.innerHTML = `<strong>No endpoint configured.</strong><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
  statusMsg.classList.remove("hidden");
  window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: "smooth" });
});