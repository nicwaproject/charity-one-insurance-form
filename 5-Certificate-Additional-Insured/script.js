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

// Explanation blocks (inside card)
const exCert = document.getElementById("exPlain_cert_only");
const exAI = document.getElementById("exPlain_ai");
const exLoss = document.getElementById("exPlain_loss");

// Sections inside the Request Card
const reqCard = document.getElementById("reqCard");

const secPurpose = document.getElementById("secPurpose");
// const secAISection = document.getElementById("secAdditionalInsured");
const secCertHolder = document.getElementById("secCertificateHolder");
const secLossPayee = document.getElementById("ecLossPayee");

const purposeSelect = document.getElementById("purposeSelect");
const purposeOtherWrapper = document.getElementById("purposeOtherWrapper");
const purposeOther = document.getElementById("purposeOther");

// Certificate Holder fields
const holderName = document.getElementById("holderName");
const holderAddress = document.getElementById("holderAddress");
const holderDetails = document.getElementById("holderDetails");

// Additional Insured field
const aiLegalName = document.getElementById("aiLegalName");

// Loss Payee fields
const lpName = document.getElementById("lpName");
const lpAddress = document.getElementById("lpAddress");
const lpDetails = document.getElementById("lpDetails");

// Upload & delivery email
const uploadFiles = document.getElementById("uploadFiles");
const deliveryEmail = document.getElementById("deliveryEmail");

// Preview modal
const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");

const requirementRadios = document.querySelectorAll("input[name='hasRequirements']");
const secRequirementsUpload = document.getElementById("secRequirementsUpload");
const requirementsUpload = document.getElementById("requirementsUpload");

const portalUploadLink = document.getElementById("portalUploadLink");

/* ---------------------------------------------------
   UTILITIES
---------------------------------------------------- */
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function escapeHtml(str) {
  return (str ?? "").replace(/[&<>'"]/g, c =>
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
   RESET ALL INSIDE CARD
---------------------------------------------------- */
function hideAllInsideCard() {
  hide(exCert);
  hide(exAI);
  hide(exLoss);

  hide(secPurpose);
  // hide(secAISection);
  hide(secCertHolder);
  hide(secLossPayee);

  disableSection(secPurpose, true);
  // disableSection(secAISection, true);
  disableSection(secCertHolder, true);
  disableSection(secLossPayee, true);

  // Clear required state
  reqCard.querySelectorAll("[required]").forEach(el => {
    el.required = false;
  });
}


/* ---------------------------------------------------
   REQUEST TYPE LOGIC
---------------------------------------------------- */
function handleRequestTypeChange() {
  const type = document.querySelector("input[name='requestType']:checked")?.value;

  if (type) {
    reqCard.classList.remove("hidden"); // Only show AFTER user selects request type
  }

  hideAllInsideCard();
  if (!type) return;

  /* Show explanation */
  if (type === "certificate_only") show(exCert);
  if (type === "certificate_ai") show(exAI);
  if (type === "loss_payee") show(exLoss);

  /* ✅ PURPOSE SEKARANG WAJIB UNTUK SEMUA TIPE */
  show(secPurpose);
  disableSection(secPurpose, false);
  purposeSelect.required = true;

  /* LOGIC RULES PER TYPE */
  if (type === "certificate_only") {
    show(secCertHolder);
    disableSection(secCertHolder, false);

    holderName.required = true;
    holderAddress.required = true;

  } 
  else if (type === "certificate_ai") {
    // show(secAISection);
    show(secCertHolder);

    disableSection(secAISection, false);
    disableSection(secCertHolder, false);

    aiLegalName.required = true;
    holderName.required = true;
    holderAddress.required = true;

  } 
  else if (type === "loss_payee") {
    show(secLossPayee);
    disableSection(secLossPayee, false);

    lpName.required = true;
    lpAddress.required = true;
  }
}


requestTypeRadios.forEach(r =>
  r.addEventListener("change", handleRequestTypeChange)
);

requirementRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "yes" && radio.checked) {
      secRequirementsUpload.classList.remove("hidden");
      requirementsUpload.required = true;
    }

    if (radio.value === "no" && radio.checked) {
      secRequirementsUpload.classList.add("hidden");
      requirementsUpload.required = false;
      requirementsUpload.value = "";
    }
  });
});

/* ---------------------------------------------------
   PURPOSE — "OTHER" LOGIC
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


/* ---------------------------------------------------
   BUILD PAYLOAD
---------------------------------------------------- */
function buildPayload() {
  return {
    organizationName: orgName.value,
    requestType: document.querySelector("input[name='requestType']:checked")?.value,

    purpose: purposeSelect.value,
    purposeOther: purposeOther.value,

    additionalInsuredName: aiLegalName.value,

    holderName: holderName.value,
    holderAddress: holderAddress.value,
    holderDetails: holderDetails.value,

    lossPayeeName: lpName.value,
    lossPayeeAddress: lpAddress.value,
    lossPayeeDetails: lpDetails.value,

    hasInsuranceRequirements:
    document.querySelector("input[name='hasRequirements']:checked")?.value || "",

    uploadedRequirementsFile:
      requirementsUpload?.files?.[0]?.name || "",

    deliveryEmail: deliveryEmail.value,

    portalUploadLink: portalUploadLink.value,
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
  const v = value
    ? escapeHtml(value)
    : `<span style="color:#777;">(not provided)</span>`;

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
    if (payload.purpose === "other") {
      addRow(rows, "Other Purpose", payload.purposeOther);
    }
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

  addRow(rows, "Has Insurance Requirements", payload.hasInsuranceRequirements);

  if (payload.hasInsuranceRequirements === "yes") {
    addRow(rows, "Uploaded Requirements File", payload.uploadedRequirementsFile);
  }

  addRow(rows, "Delivery Email", payload.deliveryEmail);
  
  if (payload.portalUploadLink) {
  addRow(rows, "Portal Upload Link", payload.portalUploadLink);
  }

  previewBody.innerHTML = rows.join("");
  show(previewModal);
}


/* PREVIEW button */
previewBtn.addEventListener("click", () => {
  if (!validateForm()) return;
  const payload = buildPayload();
  showPreview(payload);
});

/* Close modal */
closePreview.addEventListener("click", () => hide(previewModal));
editBtn.addEventListener("click", () => hide(previewModal));

/* Confirm submit */
confirmSubmitBtn.addEventListener("click", () => {
  hide(previewModal);
  form.dispatchEvent(new Event("submit"));
});


/* ---------------------------------------------------
   SUBMIT (DEMO MODE)
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
  window.scrollTo({ top: statusMsg.offsetTop - 60, behavior: "smooth" });
});


/* INIT */
hide(reqCard);  
hide(purposeOtherWrapper);