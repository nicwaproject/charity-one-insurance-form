/* ---------------------------------------------------
   CONFIG
---------------------------------------------------- */
const endpointURL = ""; // Demo mode — no backend


/* ---------------------------------------------------
   ELEMENTS
---------------------------------------------------- */
const form = document.getElementById("certAiForm");
const previewBtn = document.getElementById("previewBtn");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

const requestTypeRadios = document.querySelectorAll("input[name='requestType']");
const purposeSelect = document.getElementById("purposeSelect");
const purposeOtherWrapper = document.getElementById("purposeOtherWrapper");
const purposeOther = document.getElementById("purposeOther");

const secPurpose = document.getElementById("sec-purpose");
const secAdditionalInsured = document.getElementById("sec-additional-insured");
const secCertificateHolder = document.getElementById("sec-certificate-holder");
const secLossPayee = document.getElementById("sec-loss-payee");

const secExplanation = document.getElementById("sec-explanation");

const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");


/* ---------------------------------------------------
   UTILITIES
---------------------------------------------------- */
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function escapeHtml(str) {
  return (str ?? "").toString().replace(/[&<>'"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])
  );
}

function disableSection(section, disable = true) {
  if (!section) return;
  section.querySelectorAll("input, textarea, select").forEach(el => {
    if (disable) {
      el.disabled = true;
      el.required = false;
    } else {
      el.disabled = false;
    }
  });
}


/* ---------------------------------------------------
   REQUEST TYPE LOGIC
---------------------------------------------------- */
function handleRequestTypeChange() {
  const type = document.querySelector("input[name='requestType']:checked")?.value;

  // Hide all sections first
  hide(secPurpose);
  hide(secAdditionalInsured);
  hide(secCertificateHolder);
  hide(secLossPayee);

  disableSection(secPurpose, true);
  disableSection(secAdditionalInsured, true);
  disableSection(secCertificateHolder, true);
  disableSection(secLossPayee, true);

  // Reset explanations
  secExplanation.querySelectorAll("[data-for]").forEach(el => hide(el));

  if (!type) return;

  // Show relevant informational block
  const info = secExplanation.querySelector(`[data-for="${type}"]`);
  if (info) show(info);

  /* LOGIC TABLE */
  if (type === "certificate_only") {
    show(secPurpose);
    show(secCertificateHolder);

    disableSection(secPurpose, false);
    disableSection(secCertificateHolder, false);

    purposeSelect.required = true;
    document.getElementById("holderName").required = true;
    document.getElementById("holderAddress").required = true;

  } else if (type === "certificate_ai") {
    show(secPurpose);
    show(secAdditionalInsured);
    show(secCertificateHolder);

    disableSection(secPurpose, false);
    disableSection(secAdditionalInsured, false);
    disableSection(secCertificateHolder, false);

    purposeSelect.required = true;
    document.getElementById("aiLegalName").required = true;
    document.getElementById("holderName").required = true;
    document.getElementById("holderAddress").required = true;

  } else if (type === "loss_payee") {
    show(secLossPayee);
    disableSection(secLossPayee, false);

    document.getElementById("lpName").required = true;
    document.getElementById("lpAddress").required = true;
  }
}


/* ---------------------------------------------------
   PURPOSE LOGIC
---------------------------------------------------- */
purposeSelect.addEventListener("change", () => {
  if (purposeSelect.value === "other") {
    show(purposeOtherWrapper);
    purposeOther.required = true;
  } else {
    hide(purposeOtherWrapper);
    purposeOther.required = false;
  }
});


requestTypeRadios.forEach(r =>
  r.addEventListener("change", handleRequestTypeChange)
);


/* ---------------------------------------------------
   BUILD PAYLOAD
---------------------------------------------------- */
function buildPayload() {
  return {
    organizationName: orgName.value,
    requestType: document.querySelector("input[name='requestType']:checked")?.value,

    // Purpose section
    purpose: purposeSelect.value,
    purposeOther: purposeOther.value,

    // Additional Insured
    additionalInsuredName: aiLegalName.value,

    // Certificate Holder
    holderName: holderName.value,
    holderAddress: holderAddress.value,
    holderDetails: holderDetails.value,

    // Loss Payee
    lossPayeeName: lpName.value,
    lossPayeeAddress: lpAddress.value,
    lossPayeeDetails: lpDetails.value,

    // Upload (only file names)
    uploadedFiles: [...uploadFiles.files].map(f => f.name),

    deliveryEmail: deliveryEmail.value,
  };
}


/* ---------------------------------------------------
   VALIDATION
---------------------------------------------------- */
function validateForm() {
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  return true;
}


/* ---------------------------------------------------
   PREVIEW MODAL
---------------------------------------------------- */
function addRow(rows, label, value) {
  const v = value ? escapeHtml(value) : `<span style="color:#778;">(not provided)</span>`;
  rows.push(`
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(label)}</div>
      <div class="preview-value">${v}</div>
    </div>
  `);
}

function showPreview(payload) {
  const rows = [];

  addRow(rows, "Organization Name", payload.organizationName);
  addRow(rows, "Request Type", payload.requestType);

  if (payload.requestType !== "loss_payee") {
    addRow(rows, "Purpose", payload.purpose);
    if (payload.purpose === "other") addRow(rows, "Other Purpose", payload.purposeOther);
  }

  if (payload.requestType === "certificate_ai") {
    addRow(rows, "Additional Insured", payload.additionalInsuredName);
  }

  if (payload.requestType !== "loss_payee") {
    addRow(rows, "Certificate Holder Name", payload.holderName);
    addRow(rows, "Holder Address", payload.holderAddress);
    addRow(rows, "Holder Details", payload.holderDetails);
  }

  if (payload.requestType === "loss_payee") {
    addRow(rows, "Lender Name", payload.lossPayeeName);
    addRow(rows, "Lender Address", payload.lossPayeeAddress);
    addRow(rows, "Details", payload.lossPayeeDetails);
  }

  addRow(rows, "Uploaded Files", payload.uploadedFiles.join(", "));
  addRow(rows, "Delivery Email", payload.deliveryEmail);

  previewBody.innerHTML = rows.join("");
  show(previewModal);
}


/* Preview button */
previewBtn.addEventListener("click", () => {
  if (!validateForm()) return;
  const payload = buildPayload();
  showPreview(payload);
});

/* Close modal */
closePreview.addEventListener("click", () => hide(previewModal));
editBtn.addEventListener("click", () => hide(previewModal));

/* Final submit from preview */
confirmSubmitBtn.addEventListener("click", () => {
  hide(previewModal);
  form.dispatchEvent(new Event("submit"));
});


/* ---------------------------------------------------
   SUBMIT HANDLER (DEMO MODE)
---------------------------------------------------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = buildPayload();

  statusMsg.innerHTML = `
    <strong>No endpoint configured.</strong><br/>
    <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
  `;
  statusMsg.classList.remove("hidden");
  window.scrollTo({ top: statusMsg.offsetTop - 50, behavior: "smooth" });
});


/* Initialize on page load */
handleRequestTypeChange();
hide(purposeOtherWrapper);