/* ---------------------------------------------------
   CONFIG
---------------------------------------------------- */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/fbfbeaf03f454f6f969f2f615e38f415/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ge_-u_17I8WYguZiVskfQ5S5PLy3qJEynySS5QawF18"; // isi endpoint Power Automate jika sudah siap


/* ---------------------------------------------------
   ELEMENTS
---------------------------------------------------- */
const form = document.getElementById("certAiForm");

const previewBtn = document.getElementById("previewBtn");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

const requestTypeRadios = document.querySelectorAll("input[name='requestType']");

const orgName = document.getElementById("orgName");

// Explanation blocks
const exCert = document.getElementById("exPlain_cert_only");
const exAI = document.getElementById("exPlain_ai");
const exLoss = document.getElementById("exPlain_loss");

// Card + sections
const reqCard = document.getElementById("reqCard");
const secPurpose = document.getElementById("secPurpose");
const secCertHolder = document.getElementById("secCertificateHolder");
const secLossPayee = document.getElementById("secLossPayee");

// Purpose
const purposeSelect = document.getElementById("purposeSelect");
const purposeOtherWrapper = document.getElementById("purposeOtherWrapper");
const purposeOther = document.getElementById("purposeOther");

// Certificate holder
const holderName = document.getElementById("holderName");
const holderAddress = document.getElementById("holderAddress");
const holderDetails = document.getElementById("holderDetails");

// Loss payee
const lpName = document.getElementById("lpName");
const lpAddress = document.getElementById("lpAddress");
const lpDetails = document.getElementById("lpDetails");

// Insurance requirements
const insuranceReqSelect = document.getElementById("insuranceReqSelect");
const insuranceUploadWrapper = document.getElementById("insuranceUploadWrapper");
const insuranceUpload = document.getElementById("insuranceUpload");
const emailLaterMsg = document.getElementById("emailLaterMsg");
const notReceivedMsg = document.getElementById("notReceivedMsg");

// Email / portal
const deliveryEmail = document.getElementById("deliveryEmail");
const portalUploadLink = document.getElementById("portalUploadLink");

// Preview modal
const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");


/* ---------------------------------------------------
   UTILITIES
---------------------------------------------------- */
function show(el) { el && el.classList.remove("hidden"); }
function hide(el) { el && el.classList.add("hidden"); }

function escapeHtml(str) {
  return (str ?? "").replace(/[&<>'"]/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" }[c])
  );
}

function disableSection(section, disable = true) {
  if (!section) return;
  section.querySelectorAll("input, textarea, select").forEach(el => {
    el.disabled = disable;
    if (disable) el.required = false;
  });
}

function setSubmitting(isSubmitting) {
  if (!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? "Submitting…" : "Submit";
  submitBtn.style.opacity = isSubmitting ? "0.7" : "1";
  submitBtn.style.cursor = isSubmitting ? "not-allowed" : "pointer";
}

function scrollToStatus() {
  statusMsg.scrollIntoView({ behavior: "smooth", block: "center" });
}

function filesToBase64(fileInput) {
  const files = Array.from(fileInput?.files || []);

  return Promise.all(
    files.map(file =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          content: reader.result.split(',')[1] // base64 only
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    )
  );
}


/* ---------------------------------------------------
   RESET CARD
---------------------------------------------------- */
function resetCard() {
  hide(exCert); hide(exAI); hide(exLoss);
  hide(secPurpose); hide(secCertHolder); hide(secLossPayee);

  disableSection(secPurpose, true);
  disableSection(secCertHolder, true);
  disableSection(secLossPayee, true);

  reqCard.querySelectorAll("[required]").forEach(el => el.required = false);
}


/* ---------------------------------------------------
   REQUEST TYPE LOGIC
---------------------------------------------------- */
function handleRequestTypeChange() {
  const type = document.querySelector("input[name='requestType']:checked")?.value;
  if (!type) return;

  show(reqCard);
  resetCard();

  if (type === "certificate_only") show(exCert);
  if (type === "certificate_ai") show(exAI);
  if (type === "loss_payee") show(exLoss);

  // Purpose (not for loss payee)
  if (type !== "loss_payee") {
    show(secPurpose);
    disableSection(secPurpose, false);
    purposeSelect.required = true;
  }

  if (type === "certificate_only" || type === "certificate_ai") {
    show(secCertHolder);
    disableSection(secCertHolder, false);
    holderName.required = true;
    holderAddress.required = true;
  }

  if (type === "loss_payee") {
    show(secLossPayee);
    disableSection(secLossPayee, false);
    lpName.required = true;
    lpAddress.required = true;
  }
}

requestTypeRadios.forEach(r =>
  r.addEventListener("change", handleRequestTypeChange)
);


/* ---------------------------------------------------
   PURPOSE OTHER
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
   INSURANCE REQUIREMENTS
---------------------------------------------------- */
insuranceReqSelect.addEventListener("change", () => {
  hide(insuranceUploadWrapper);
  hide(emailLaterMsg);
  hide(notReceivedMsg);
  insuranceUpload.required = false;

  if (insuranceReqSelect.value === "upload_now") {
    show(insuranceUploadWrapper);
    insuranceUpload.required = true;
  }
  if (insuranceReqSelect.value === "email_later") show(emailLaterMsg);
  if (insuranceReqSelect.value === "not_received") show(notReceivedMsg);
});


/* ---------------------------------------------------
   BUILD PAYLOAD
---------------------------------------------------- */
async function buildPayload() {
  const reqType =
    document.querySelector("input[name='requestType']:checked")?.value;

  let insuranceFiles = [];

  if (
    insuranceReqSelect.value === "upload_now" &&
    insuranceUpload.files.length
  ) {
    insuranceFiles = await filesToBase64(insuranceUpload);
  }

  return {
    organizationName: orgName?.value || "",
    requestType: reqType,

    purpose: reqType === "loss_payee" ? "" : purposeSelect.value,
    purposeOther: purposeOther.value,

    holderName: holderName.value,
    holderAddress: holderAddress.value,
    holderDetails: holderDetails.value,

    lossPayeeName: lpName.value,
    lossPayeeAddress: lpAddress.value,
    lossPayeeDetails: lpDetails.value,

    insuranceRequirementsOption: insuranceReqSelect.value,
    insuranceRequirementFiles: insuranceFiles, // ✅ base64 array

    deliveryEmail: deliveryEmail.value,
    portalUploadLink: portalUploadLink?.value || "",

    submittedAt: new Date().toISOString()
  };
}


/* ---------------------------------------------------
   VALIDATION
---------------------------------------------------- */
function validateForm() {
  const reqType = document.querySelector("input[name='requestType']:checked");
  if (!reqType) {
    alert("Please select a request type.");
    return false;
  }

  if (!insuranceReqSelect.value) {
    alert("Please select an insurance requirements option.");
    return false;
  }

  if (
    insuranceReqSelect.value === "upload_now" &&
    insuranceUpload.files.length === 0
  ) {
    alert("Please upload your insurance requirements.");
    return false;
  }

  for (const file of insuranceUpload.files) {
  if (file.size > 8 * 1024 * 1024) {
    alert(`"${file.name}" exceeds 8MB.`);
    return false;
  }
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  return true;
}


/* ---------------------------------------------------
   PREVIEW
---------------------------------------------------- */
function addRow(rows, label, value) {
  rows.push(`
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(label)}</div>
      <div class="preview-value">
        ${value ? escapeHtml(value) : "<span style='color:#777'>(not provided)</span>"}
      </div>
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
    addRow(rows, "Certificate Holder", payload.holderName);
    addRow(rows, "Holder Address", payload.holderAddress);
  }

  if (payload.requestType === "loss_payee") {
    addRow(rows, "Loss Payee Name", payload.lossPayeeName);
    addRow(rows, "Loss Payee Address", payload.lossPayeeAddress);
  }

  addRow(rows, "Insurance Requirements", payload.insuranceRequirementsOption);
  addRow(rows, "Delivery Email", payload.deliveryEmail);

  previewBody.innerHTML = rows.join("");
  show(previewModal);
}

previewBtn.addEventListener("click", async () => {
  if (!validateForm()) return;
  const payload = await buildPayload();
  showPreview(payload);
});

closePreview.addEventListener("click", () => hide(previewModal));
editBtn.addEventListener("click", () => hide(previewModal));

confirmSubmitBtn.addEventListener("click", () => {
  hide(previewModal);
  form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
});


/* ---------------------------------------------------
   SUBMIT
---------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setSubmitting(true);

  statusMsg.innerHTML = `
    <strong>Submitting your request…</strong><br/>
    Please wait and do not close this page.
  `;
  show(statusMsg);
  scrollToStatus();

  const payload = await buildPayload();

  if (!endpointURL) {
    statusMsg.innerHTML = `
      <strong>No endpoint configured.</strong>
      <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    `;
    setSubmitting(false);
    return;
  }

  try {
    const res = await fetch(endpointURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server error");

    statusMsg.innerHTML = `<strong>Submitted successfully.</strong>`;
    form.reset();
    resetCard();
  } catch (err) {
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${escapeHtml(err.message)}`;
  } finally {
    setSubmitting(false);
    scrollToStatus();
  }
});


/* ---------------------------------------------------
   INIT
---------------------------------------------------- */
hide(reqCard);
hide(purposeOtherWrapper);