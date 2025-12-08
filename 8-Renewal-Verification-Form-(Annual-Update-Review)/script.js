/* ================== CONFIG ================== */
const endpointURL = ""; // kosong = demo mode (preview JSON)

/* ================== CACHED DOM ================== */
const form = document.getElementById("renewalForm");
const steps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".step");

const nextStep1 = document.getElementById("nextStep1");
const nextStep2 = document.getElementById("nextStep2");
const backStep2 = document.getElementById("backStep2");
const backStep3 = document.getElementById("backStep3");

const previewBtn = document.getElementById("previewBtn");

const statusMsg = document.getElementById("statusMsg");

const previewModal = document.getElementById("previewModal");
const previewBody = document.getElementById("previewBody");
const closePreview = document.getElementById("closePreview");
const editBtn = document.getElementById("editBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");

/* ================== UTILS ================== */
function show(el){ if(!el) return; el.classList.remove("hidden"); el.style.display = ""; }
function hide(el){ if(!el) return; el.classList.add("hidden"); el.style.display = "none"; }

function escapeHtml(s){
  return (s===null||s===undefined)?'':String(s).replace(/[&<>'"]/g, c=> (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}

/* ================== STEP CONTROL ================== */
function goToStep(step){
  steps.forEach(s => {
    s.classList.add("hidden");
    s.classList.remove("active");
  });

  const target = document.querySelector(`.form-step[data-step="${step}"]`);
  target.classList.remove("hidden");
  target.classList.add("active");

  progressSteps.forEach(p => p.classList.remove("active"));
  document.querySelector(`.step[data-step="${step}"]`).classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================== YES / NO CONDITIONAL ================== */
function bindConditional(radioName, textareaId){
  document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
    r.addEventListener("change", () => {
      const ta = document.getElementById(textareaId);
      if (r.value === "yes") {
        show(ta);
        ta.required = true;
      } else {
        hide(ta);
        ta.required = false;
        ta.value = "";
      }
    });
  });
}

bindConditional("opsChange", "opsDesc");
bindConditional("exposureChange", "exposureDesc");
bindConditional("locationChange", "locationDesc");
bindConditional("vehicleChange", "vehicleDesc");
bindConditional("staffChange", "staffDesc");

/* ================== STEP VALIDATION ================== */
function validateStep(step){
  const current = document.querySelector(`.form-step[data-step="${step}"]`);
  const requiredFields = current.querySelectorAll("[required]");

  for (let field of requiredFields){
    if (field.type === "checkbox") {
      if (!field.checked) {
        alert("Please confirm before continuing.");
        field.focus();
        return false;
      }
    } else {
      if (!field.value.trim()) {
        alert("Please complete all required fields.");
        field.focus();
        return false;
      }
    }
  }
  return true;
}

/* ================== NAVIGATION ================== */
nextStep1.addEventListener("click", () => {
  if (!validateStep(1)) return;
  goToStep(2);
});

nextStep2.addEventListener("click", () => {
  if (!validateStep(2)) return;
  goToStep(3);
});

backStep2.addEventListener("click", () => goToStep(1));
backStep3.addEventListener("click", () => goToStep(2));

/* ================== BUILD PAYLOAD ================== */
function buildPayload(){
  return {
    organization: {
      name: document.getElementById("orgName").value.trim(),
      contact_name: document.getElementById("contactName").value.trim(),
      contact_email: document.getElementById("contactEmail").value.trim(),
      contact_phone: document.getElementById("contactPhone").value.trim() || "-"
    },

    operational_changes: {
      has_change: document.querySelector('input[name="opsChange"]:checked')?.value || "",
      description: document.getElementById("opsDesc").value.trim()
    },

    exposure_changes: {
      has_change: document.querySelector('input[name="exposureChange"]:checked')?.value || "",
      description: document.getElementById("exposureDesc").value.trim()
    },

    location_changes: {
      has_change: document.querySelector('input[name="locationChange"]:checked')?.value || "",
      description: document.getElementById("locationDesc").value.trim()
    },

    vehicle_changes: {
      has_change: document.querySelector('input[name="vehicleChange"]:checked')?.value || "",
      description: document.getElementById("vehicleDesc").value.trim()
    },

    staffing_changes: {
      has_change: document.querySelector('input[name="staffChange"]:checked')?.value || "",
      description: document.getElementById("staffDesc").value.trim()
    },

    confirmation: {
      final_confirm: document.getElementById("finalConfirm").checked
    },

    meta: {
      form_name: "Renewal Verification Form (Annual Update Review)",
      submitted_at: new Date().toISOString()
    }
  };
}

/* ================== PREVIEW ================== */

function addPreviewRow(rows, label, value) {
  rows.push(`
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(label)}</div>
      <div class="preview-value">${escapeHtml(value || '(not provided)')}</div>
    </div>
  `);
}

function showPreview(payload) {
  const rows = [];

  // ================= ORG INFO =================
  rows.push(`<h4>Organization Information</h4>`);
  addPreviewRow(rows, "Organization Name", payload.organization.name);
  addPreviewRow(rows, "Contact Name", payload.organization.contact_name);
  addPreviewRow(rows, "Contact Email", payload.organization.contact_email);
  addPreviewRow(rows, "Contact Phone", payload.organization.contact_phone);

  // ================= OPERATIONAL =================
  rows.push(`<h4 style="margin-top:14px;">Operational & Program Changes</h4>`);
  addPreviewRow(rows, "Changed?", payload.operational_changes.has_change);
  if (payload.operational_changes.has_change === "yes") {
    addPreviewRow(rows, "Description", payload.operational_changes.description);
  }

  // ================= EXPOSURE =================
  rows.push(`<h4 style="margin-top:14px;">Exposure & Activity Changes</h4>`);
  addPreviewRow(rows, "Changed?", payload.exposure_changes.has_change);
  if (payload.exposure_changes.has_change === "yes") {
    addPreviewRow(rows, "Description", payload.exposure_changes.description);
  }

  // ================= LOCATION =================
  rows.push(`<h4 style="margin-top:14px;">Location & Property Changes</h4>`);
  addPreviewRow(rows, "Changed?", payload.location_changes.has_change);
  if (payload.location_changes.has_change === "yes") {
    addPreviewRow(rows, "Description", payload.location_changes.description);
  }

  // ================= VEHICLE =================
  rows.push(`<h4 style="margin-top:14px;">Vehicle & Transportation Changes</h4>`);
  addPreviewRow(rows, "Changed?", payload.vehicle_changes.has_change);
  if (payload.vehicle_changes.has_change === "yes") {
    addPreviewRow(rows, "Description", payload.vehicle_changes.description);
  }

  // ================= STAFF =================
  rows.push(`<h4 style="margin-top:14px;">Staffing, Payroll & Volunteer</h4>`);
  addPreviewRow(rows, "Changed?", payload.staffing_changes.has_change);
  if (payload.staffing_changes.has_change === "yes") {
    addPreviewRow(rows, "Description", payload.staffing_changes.description);
  }

  // ================= CONFIRMATION =================
  rows.push(`<h4 style="margin-top:14px;">Final Confirmation</h4>`);
  addPreviewRow(
    rows,
    "Confirmation",
    payload.confirmation.final_confirm ? "Confirmed" : "Not confirmed"
  );

  // ================= META =================
  rows.push(`<h4 style="margin-top:14px;">Submission Info</h4>`);
  addPreviewRow(rows, "Form Name", payload.meta.form_name);
  addPreviewRow(rows, "Submitted At", payload.meta.submitted_at);

  // ================= RENDER =================
  previewBody.innerHTML = rows.join("");
  show(previewModal);
}

/* ================== PREVIEW BUTTON ================== */
previewBtn.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (!validateStep(3)) return;
  const payload = buildPayload();
  showPreview(payload);
});

/* ================== MODAL HANDLER ================== */
closePreview.addEventListener("click", () => hide(previewModal));

editBtn.addEventListener("click", () => hide(previewModal));

confirmSubmitBtn.addEventListener("click", () => {
  hide(previewModal);
  form.dispatchEvent(new Event("submit"));
});

/* ================== SUBMIT (DEMO / LIVE) ================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;

  const payload = buildPayload();

  // ================== DEMO MODE ==================
  if (!endpointURL) {
    statusMsg.innerHTML = `
      <strong>No endpoint configured (DEMO MODE)</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    `;
    statusMsg.classList.remove("hidden");
    window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: "smooth" });
    return;
  }

  // ================== LIVE SUBMIT ==================
  try {
    const res = await fetch(endpointURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server error");

    statusMsg.innerHTML = "<strong>✅ Successfully submitted!</strong>";
    statusMsg.classList.remove("hidden");

    form.reset();
    goToStep(1);

  } catch (err) {
    statusMsg.innerHTML = `<strong>❌ Submission failed:</strong> ${escapeHtml(err.message)}`;
    statusMsg.classList.remove("hidden");
  }

  window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: "smooth" });
});

/* ================== INIT ================== */
goToStep(1);