/* -------------------------------------------
   CONFIG
-------------------------------------------- */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9138ff43700f434db48ec80cd9e64f9c/triggers/manual/paths/invoke?api-version=1";


/* -------------------------------------------
   ELEMENTS
-------------------------------------------- */
const form = document.getElementById('locForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');

const updateTypeRadios = document.querySelectorAll('input[name="updateType"]');

const locationSection = document.getElementById('locationSelect')?.closest('.section');
const locationSelect = document.getElementById('locationSelect');
const replaceLocationSelect = document.getElementById('replaceLocationSelect');
const newLocationName = document.getElementById('newLocationName');

const addressSection = document.getElementById('addressSection');
const buildingDetailsSection = document.getElementById('buildingDetailsSection');

const otherExplain = document.getElementById('otherExplain');

const addInsRadios = document.querySelectorAll('input[name="addIns"]');
const addInsInfoSection = document.getElementById("addInsInfoSection");
const addInsFileSection = document.getElementById("addInsFileSection");
const insInfo = document.getElementById("insInfo");
const insInfoRequiredStar = document.getElementById("insInfoRequiredStar");
const fileUpload = document.getElementById("fileUpload");

const contentsCoverageRadios = document.querySelectorAll('input[name="contentsCoverage"]');
const contentsValue = document.getElementById('contentsValue');

/* Preview */
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');


/* -------------------------------------------
   UTILITIES (STRICT)
-------------------------------------------- */
function escapeHtml(str = "") {
  return String(str).replace(/[&<>'"]/g, t =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[t])
  );
}

function hardHideInput(input){
  if(!input) return;
  input.classList.add('hidden');
  input.disabled = true;
  input.required = false;
  input.value = "";
}

function hardShowInput(input){
  if(!input) return;
  input.classList.remove('hidden');
  input.disabled = false;
}

function hardHideSection(section){
  if(!section) return;
  section.classList.add('hidden');
  section.querySelectorAll('input, textarea, select').forEach(el=>{
    el.disabled = true;
    el.required = false;
  });
}

function hardShowSection(section){
  if(!section) return;
  section.classList.remove('hidden');
  section.querySelectorAll('input, textarea, select').forEach(el=>{
    el.disabled = false;
  });
}

function filesToBase64(fileInput){
  const files = Array.from(fileInput?.files || []);
  return Promise.all(
    files.map(file =>
      new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = ()=> resolve({
          name: file.name,
          content: reader.result.split(',')[1]
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    )
  );
}

function setSubmitting(isSubmitting){
  if(!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? "Submitting…" : "Submit";
  submitBtn.style.opacity = isSubmitting ? "0.7" : "1";
  submitBtn.style.cursor = isSubmitting ? "not-allowed" : "pointer";
}

function scrollToStatus(){
  statusMsg?.scrollIntoView({ behavior:"smooth", block:"center" });
}


/* -------------------------------------------
   RESETTERS (CRITICAL)
-------------------------------------------- */
function resetNewLocationName(){
  hardHideInput(newLocationName);
}

function resetConditional(){
  hardHideInput(newLocationName);
  hardHideInput(otherExplain);
  hardHideInput(contentsValue);

  hardHideSection(addInsInfoSection);
  hardHideSection(addInsFileSection);

  hardHideSection(addressSection);
  hardHideSection(buildingDetailsSection);

  replaceLocationSelect.classList.add('hidden');
  replaceLocationSelect.disabled = true;
  replaceLocationSelect.required = false;

  locationSelect.disabled = false;
  locationSelect.required = true;
}


/* -------------------------------------------
   UPDATE TYPE LOGIC (FINAL FIX)
-------------------------------------------- */
function handleUpdateTypeChange(){
  const val = document.querySelector('input[name="updateType"]:checked')?.value || "";

  // 🔥 ALWAYS RESET FIRST
  resetConditional();

  // ===== REPLACE =====
  if(val === "replace"){
    hardShowSection(locationSection);
    replaceLocationSelect.classList.remove('hidden');
    replaceLocationSelect.disabled = false;
    replaceLocationSelect.required = true;
    return;
  }

  // ===== OTHER =====
  if(val === "other"){
    hardShowInput(otherExplain);
    return;
  }

  // ===== ADD =====
  if(val === "add"){
    // disable location select
    hardHideSection(locationSection);
    locationSelect.disabled = true;
    locationSelect.required = false;

    // ONLY PLACE newLocationName is enabled + required
    hardShowInput(newLocationName);
    newLocationName.required = true;

    // address required
    hardShowSection(addressSection);
    addressSection.querySelectorAll('input').forEach(i => i.required = true);

    // building required
    hardShowSection(buildingDetailsSection);
    const ta = buildingDetailsSection.querySelector('textarea');
    if(ta) ta.required = true;

    return;
  }

  // ===== DEFAULT (correct, sqft, remove) =====
  hardShowSection(locationSection);
}


/* -------------------------------------------
   CONTENTS COVERAGE
-------------------------------------------- */
contentsCoverageRadios.forEach(r=>{
  r.addEventListener("change", ()=>{
    const val = document.querySelector('input[name="contentsCoverage"]:checked')?.value;
    if(val === "yes"){
      hardShowInput(contentsValue);
      contentsValue.required = true;
    } else {
      hardHideInput(contentsValue);
    }
  });
});


/* -------------------------------------------
   ADDITIONAL INSURED
-------------------------------------------- */
addInsRadios.forEach(r=>{
  r.addEventListener('change', ()=>{
    const val = document.querySelector('input[name="addIns"]:checked')?.value;
    if(val === "yes"){
      hardShowSection(addInsInfoSection);
      hardShowSection(addInsFileSection);
      insInfo.required = true;
      insInfoRequiredStar?.classList.remove("hidden");
    } else {
      hardHideSection(addInsInfoSection);
      hardHideSection(addInsFileSection);
      insInfoRequiredStar?.classList.add("hidden");
    }
  });
});


/* -------------------------------------------
   BUILD PAYLOAD
-------------------------------------------- */
async function buildPayload(){
  let insuredFiles = [];
  if(fileUpload?.files?.length){
    insuredFiles = await filesToBase64(fileUpload);
  }

  return {
    organizationName: orgName.value,
    yourName: yourName.value,

    updateType: document.querySelector('input[name="updateType"]:checked')?.value || "",
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

    additionalInsured: document.querySelector('input[name="addIns"]:checked')?.value || "",
    insuredInfo: insInfo.value,
    insuredContractFiles: insuredFiles,

    notes: notes.value,
    confirmed: agree.checked,
    signature: fullName.value,

    submittedAt: new Date().toISOString()
  };
}


/* -------------------------------------------
   VALIDATION
-------------------------------------------- */
function validateForm(){
  if(!form.checkValidity()){
    form.reportValidity();
    return false;
  }
  return true;
}


/* -------------------------------------------
   PREVIEW
-------------------------------------------- */
function addPreviewRow(rows,label,value){
  if(!value || !value.trim()) return;
  rows.push(`
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(label)}</div>
      <div class="preview-value">${escapeHtml(value)}</div>
    </div>
  `);
}

function showPreviewModal(payload){
  const rows = [];

  addPreviewRow(rows,"Organization Name",payload.organizationName);
  addPreviewRow(rows,"Your Name",payload.yourName);
  addPreviewRow(rows,"Type of Change",payload.updateType);
  addPreviewRow(rows,"Location",payload.locationSelect);
  addPreviewRow(rows,"New Location Name",payload.newLocationName);

  addPreviewRow(rows,"Street",payload.address.street);
  addPreviewRow(rows,"City",payload.address.city);
  addPreviewRow(rows,"State",payload.address.state);
  addPreviewRow(rows,"ZIP",payload.address.zip);

  addPreviewRow(rows,"Building Details",payload.buildingDetails);
  addPreviewRow(rows,"Effective Date",payload.changeDate);
  addPreviewRow(rows,"Additional Insured",payload.additionalInsured);
  addPreviewRow(rows,"Insured Info",payload.insuredInfo);
  addPreviewRow(rows,"Notes",payload.notes);
  addPreviewRow(rows,"Signature",payload.signature);

  previewBody.innerHTML = rows.join("");
  previewModal.classList.remove("hidden");
}


/* -------------------------------------------
   EVENTS
-------------------------------------------- */
updateTypeRadios.forEach(r=>{
  r.addEventListener('change', handleUpdateTypeChange);
});

previewBtn.addEventListener("click", async ()=>{
  if(!validateForm()) return;
  const payload = await buildPayload();
  showPreviewModal(payload);
});

closePreview.addEventListener("click", ()=> previewModal.classList.add('hidden'));
editBtn.addEventListener("click", ()=> previewModal.classList.add('hidden'));

confirmSubmitBtn.addEventListener("click", ()=>{
  previewModal.classList.add('hidden');
  form.requestSubmit();
});


/* -------------------------------------------
   SUBMIT
-------------------------------------------- */
form.addEventListener("submit", async (ev)=>{
  ev.preventDefault();
  if(!validateForm()) return;

  setSubmitting(true);
  statusMsg.innerHTML = `<strong>Submitting your request…</strong><br/>Please wait and do not close this page.`;
  statusMsg.classList.remove('hidden');
  scrollToStatus();

  try {
    const payload = await buildPayload();

    const res = await fetch(endpointURL,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    if(!res.ok) throw new Error("Server error");

    statusMsg.innerHTML = `<strong>Submitted successfully.</strong>`;
    form.reset();
    resetConditional();
    handleUpdateTypeChange();

  } catch(err){
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${escapeHtml(err.message)}`;
  } finally {
    setSubmitting(false);
    scrollToStatus();
  }
});


/* -------------------------------------------
   INIT (CRITICAL)
-------------------------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  resetConditional();
  handleUpdateTypeChange();
});