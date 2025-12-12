/* -------------------------------------------
   CONFIG
-------------------------------------------- */
const endpointURL = ""; // demo mode


/* -------------------------------------------
   ELEMENTS
-------------------------------------------- */
const updateTypeRadios = document.querySelectorAll('input[name="updateType"]');
const locationSection = document.getElementById('locationSelect').closest('.section');
const locationSelect = document.getElementById('locationSelect');
const newLocationName = document.getElementById('newLocationName');

const addressSection = document.getElementById('addressSection');
const buildingDetailsSection = document.getElementById('buildingDetailsSection');

const addInsRadios = document.querySelectorAll('input[name="addIns"]');
const addInsInfoSection = document.getElementById("addInsInfoSection");
const addInsFileSection = document.getElementById("addInsFileSection");

const otherExplain = document.getElementById('otherExplain');

const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closePreview = document.getElementById('closePreview');
const previewBody = document.getElementById('previewBody');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');

const statusMsg = document.getElementById('statusMsg');
const form = document.getElementById('locForm');

const replaceLocationSelect = document.getElementById('replaceLocationSelect');
const insInfo = document.getElementById("insInfo");
const insInfoRequiredStar = document.getElementById("insInfoRequiredStar");

const contentsCoverageRadios = document.querySelectorAll('input[name="contentsCoverage"]');
const contentsValue = document.getElementById('contentsValue');

/* -------------------------------------------
   UTILITY
-------------------------------------------- */
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, t =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[t])
  );
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }


/* helper: enable/disable all form controls inside a container */
function setControlsActive(container, active = true) {
  if (!container) return;
  const controls = container.querySelectorAll('input, textarea, select, button');
  controls.forEach(c => {
    if (active) {
      c.disabled = false;
      c.removeAttribute('aria-hidden');
    } else {
      c.disabled = true;
      c.removeAttribute('required'); // remove required to prevent validation errors
      c.setAttribute('aria-hidden', 'true');
    }
  });
}

/* updated handler for update type (Q7) */
function handleUpdateTypeChange() {
  const val = document.querySelector('input[name="updateType"]:checked')?.value || "";
  
  /* Hide dropdown by default */
  hide(replaceLocationSelect);
  replaceLocationSelect.required = false;
  replaceLocationSelect.disabled = true;

  /* REPLACE LOCATION logic */
  if (val === "replace") {
    show(locationSection);
    locationSelect.required = true;
    locationSelect.disabled = false;

    show(replaceLocationSelect);
    replaceLocationSelect.required = true;
    replaceLocationSelect.disabled = false;

    hide(newLocationName);
    newLocationName.required = false;
    newLocationName.disabled = true;

    setControlsActive(addressSection, false);
    setControlsActive(buildingDetailsSection, false);
    return;
  }

  /* -------------------------------------------
   LOGIC — Contents Coverage (NEW QUESTION)
-------------------------------------------- */
contentsCoverageRadios.forEach(r => {
  r.addEventListener("change", () => {
    const val = document.querySelector('input[name="contentsCoverage"]:checked')?.value;

    if (val === "yes") {
      contentsValue.classList.remove("hidden");
      contentsValue.required = true;
      contentsValue.disabled = false;
    } else {
      contentsValue.classList.add("hidden");
      contentsValue.required = false;
      contentsValue.disabled = true;
      contentsValue.value = "";
    }
  });
});

  // otherExplain visibility (Other)
  if (val === "other") {
    show(otherExplain);
    otherExplain.disabled = false;
  } else {
    hide(otherExplain);
    otherExplain.disabled = true;
    otherExplain.removeAttribute('required');
  }

  // If add new location
  if (val === "add") {
    // hide existing location selector and make it non-required/disabled
    try {
      hide(locationSection);
    } catch(e){ /* ignore */ }
    locationSelect.required = false;
    locationSelect.disabled = true;

    // show newLocationName, enable and require it
    show(newLocationName);
    newLocationName.disabled = false;
    newLocationName.required = true;

    // address fields required + enabled
    setControlsActive(addressSection, true);
    addressSection.querySelectorAll('input').forEach(i => { i.required = true; i.disabled = false; });

    // building details required + enabled
    setControlsActive(buildingDetailsSection, true);
    const ta = buildingDetailsSection.querySelector('textarea');
    if (ta) { ta.required = true; ta.disabled = false; }

  } else {
    // restore normal mode: show location select, enable it
    try {
      show(locationSection);
    } catch(e){ /* ignore */ }
    locationSelect.required = true;
    locationSelect.disabled = false;

    // hide and disable newLocationName
    hide(newLocationName);
    newLocationName.required = false;
    newLocationName.disabled = true;

    // address fields not required and disabled (so browser won't validate hidden ones)
    setControlsActive(addressSection, false);
    // building details disabled too
    setControlsActive(buildingDetailsSection, false);
  }
}

/* Ensure initial state on load */
document.addEventListener('DOMContentLoaded', () => {
  // disable elements that should start disabled
  if (newLocationName) { newLocationName.disabled = true; }
  setControlsActive(addressSection, false);
  setControlsActive(buildingDetailsSection, false);
  if (otherExplain) { otherExplain.disabled = true; }

  // attach listeners if not already attached
  updateTypeRadios.forEach(r => r.removeEventListener('change', handleUpdateTypeChange));
  updateTypeRadios.forEach(r => r.addEventListener('change', handleUpdateTypeChange));

  // run once to set correct initial visibility based on any preselected radio
  handleUpdateTypeChange();
});


/* -------------------------------------------
   LOGIC — Additional Insured
-------------------------------------------- */
addInsRadios.forEach(r => {
  r.addEventListener('change', () => {
    const val = document.querySelector('input[name="addIns"]:checked')?.value;
    if (val === "yes") {
      show(addInsInfoSection);
      show(addInsFileSection);

      // MAKE FIELD REQUIRED
      insInfo.required = true;
      insInfo.setAttribute("aria-required", "true");

      // SHOW REQUIRED STAR
      insInfoRequiredStar.classList.remove("hidden");

    } else {
      hide(addInsInfoSection);
      hide(addInsFileSection);

      // REMOVE REQUIRED STATE
      insInfo.required = false;
      insInfo.removeAttribute("aria-required");
      insInfo.value = ""; // optional: clear field

      // HIDE REQUIRED STAR
      insInfoRequiredStar.classList.add("hidden");
    }
  });
});


/* -------------------------------------------
   BUILD PAYLOAD
-------------------------------------------- */
/************************************
 * PREVIEW PAYLOAD
 ************************************/
function buildPayload() {
  return {
    organizationName: orgName.value,
    yourName: yourName.value,

    updateType: document.querySelector("input[name='updateType']:checked")?.value || "",
    otherExplain: otherExplain.value,

    locationSelect: locationSelect.value,
    newLocationName: newLocationName.value,

    address: {
      street: strAdd.value,
      city: city.value,
      state: state.value,
      zip: zipCode.value
    },

    buildingDetails: buildingDetails.value,

    changeDate: changeDate.value,

    additionalInsured: document.querySelector("input[name='addIns']:checked")?.value,
    insuredInfo: insInfo.value,
    insuredContractFile: fileUpload.value,

    notes: notes.value,

    confirmed: agree.checked,
    signature: fullName.value
  };
}


/* -------------------------------------------
   VALIDATION
-------------------------------------------- */
function validateForm() {
  // Native browser validation first
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // Custom rules if needed (none extra now)
  return true;
}


/************************************
 * PREVIEW MODAL (CLEAN VERSION)
 ************************************/

function addPreviewRow(rows, label, value, options = {}) {
  const { showIfEmpty = false } = options;

  // hide if empty and not required to show
  if (!showIfEmpty && (!value || value.trim() === "")) {
    return; // SKIP → do not add the preview row
  }

  const safe = value && value.trim() !== ""
    ? escapeHtml(String(value))
    : '<span style="color:#9aa5b1;font-style:italic;">(not provided)</span>';

  rows.push(`
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(label)}</div>
      <div class="preview-value">${safe}</div>
    </div>
  `);
}

function showPreviewModal(payload) {
  const rows = [];

  addPreviewRow(rows, "Organization Name", payload.organizationName);
  addPreviewRow(rows, "Your Name", payload.yourName);

  addPreviewRow(rows, "Type of Change", payload.updateType);
  if (payload.updateType === "other") addPreviewRow(rows, "Explanation", payload.otherExplain);

  if (payload.updateType !== "add") {
    addPreviewRow(rows, "Location Being Updated", payload.locationSelect);
  }

  addPreviewRow(rows, "New Location Name", payload.newLocationName);

  rows.push(`<h4 class="preview-section-title">Updated / Corrected Address</h4>`);
  addPreviewRow(rows, "Street", payload.address.street);
  addPreviewRow(rows, "City", payload.address.city);
  addPreviewRow(rows, "State", payload.address.state);
  addPreviewRow(rows, "ZIP", payload.address.zip);

  addPreviewRow(rows, "Building Details", payload.buildingDetails);
  addPreviewRow(rows, "Effective Date", payload.changeDate);

  addPreviewRow(rows, "Additional Insured?", payload.additionalInsured);
  if (payload.additionalInsured === "yes") {
    addPreviewRow(rows, "Insured Info", payload.insuredInfo);
    addPreviewRow(rows, "Uploaded Contract", payload.insuredContractFile);
  }

  addPreviewRow(rows, "Additional Notes", payload.notes);

  addPreviewRow(rows, "Confirmed", payload.confirmed ? "Yes" : "No");
  addPreviewRow(rows, "Signature", payload.signature);

  previewBody.innerHTML = rows.join("");

  previewModal.classList.remove("hidden");
  previewModal.setAttribute("aria-hidden", "false");
  closePreview.focus();
}

function disableHiddenRequiredFields() {
  const all = document.querySelectorAll('[required]');
  all.forEach(el => {
    const isHidden = el.offsetParent === null; // element hidden
    if (isHidden) {
      el.disabled = true;
      el.removeAttribute('required');
    }
  });
}

/* OVERRIDE OLD PREVIEW BUTTON HANDLER */
previewBtn.addEventListener("click", () => {
  disableHiddenRequiredFields();

  if (!validateForm()) return;
  const payload = buildPayload();
  showPreviewModal(payload);
});

closePreview.addEventListener("click", () => {
  previewModal.classList.add("hidden");
});

editBtn.addEventListener("click", () => {
  previewModal.classList.add("hidden");
});

/************************************
 * CONFIRM SUBMIT FROM PREVIEW
 ************************************/
confirmSubmitBtn.addEventListener("click", () => {
  previewModal.classList.add("hidden");

  form.dispatchEvent(new Event("submit"));
});


/* -------------------------------------------
   SUBMIT HANDLER (Demo Mode)
-------------------------------------------- */
locForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  if (!validateForm()) return;

  const payload = buildPayload();

  statusMsg.innerHTML = `
    <strong>No endpoint configured.</strong>
    <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload,null,2))}</pre>
  `;
  statusMsg.classList.remove("hidden");
  statusMsg.setAttribute("aria-hidden", "false");
  window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: "smooth" });


});