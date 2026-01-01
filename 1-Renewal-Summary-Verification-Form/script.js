/* CONFIG */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bd86f6a973404632b3bccd8c51619ed8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ztAl-nf6IOROh3E8w7n2Uy7R_IehtuFxq9tBHjrcz2o";

/* ELEMENTS */
const form = document.getElementById('reviewForm');
const reviewedRadios = form.elements['reviewed'];
const pleaseReviewMsg = document.getElementById('pleaseReviewMsg');
const section3 = document.getElementById('sec3');
const filesInput = document.getElementById('files');
const statusMsg = document.getElementById('statusMsg');

const financingSection = document.getElementById('secFinancing');
const financingRadios = document.querySelectorAll('input[name="financing"]');
const financingNoMsg = document.getElementById('financingNoMsg');

/* VISIBILITY HELPERS */
function show(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
}

function hide(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden', 'true');
}

function setRequired(radios, required) {
  radios.forEach(r => r.required = required);
}

// Submitting Helper
function setSubmittingState(isSubmitting) {
  if (!submitBtn) return;

  submitBtn.disabled = isSubmitting;
  submitBtn.innerText = isSubmitting ? 'Submitting…' : 'Submit';
  submitBtn.style.opacity = isSubmitting ? '0.7' : '1';
  submitBtn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
}

function scrollToStatus() {
  if (!statusMsg) return;
  statusMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Branching logic: if reviewed=no -> show message & hide section3 */
function updateBranching(){
  const checked = Array.from(reviewedRadios).find(r=>r.checked);
  if(!checked){
    pleaseReviewMsg.classList.add('hidden');
    pleaseReviewMsg.setAttribute('aria-hidden','true');
    section3.style.display = '';
    return;
  }
  if(checked.value === 'no'){
    pleaseReviewMsg.classList.remove('hidden');
    pleaseReviewMsg.setAttribute('aria-hidden','false');
    section3.style.display = 'none';
  } else {
    pleaseReviewMsg.classList.add('hidden');
    pleaseReviewMsg.setAttribute('aria-hidden','true');
    section3.style.display = '';
  }
}

/* Reviewed logic */
reviewedRadios.forEach(r => {
  r.addEventListener('change', () => {
    const val = document.querySelector('input[name="reviewed"]:checked')?.value;

    // reset financing section
    hide(financingSection);
    hide(financingNoMsg);
    financingRadios.forEach(f => f.checked = false);

    if (val === 'yes') {
      hide(pleaseReviewMsg);
      show(financingSection);
      setRequired(financingRadios, true);
    }

    if (val === 'no') {
      show(pleaseReviewMsg);
      setRequired(financingRadios, false);
    }
  });
});

/* Financing logic */
financingRadios.forEach(r => {
  r.addEventListener('change', () => {
    const val = document.querySelector('input[name="financing"]:checked')?.value;

    if (val === 'no') {
      show(financingNoMsg);
    } else {
      hide(financingNoMsg);
    }
  });
});

/* File constraints */
filesInput.addEventListener('change', (e)=>{
  const files = Array.from(e.target.files || []);
  const maxFiles = 5;
  const maxSize = 8 * 1024 * 1024; // 8 MB
  if(files.length > maxFiles){
    alert(`Please select up to ${maxFiles} files only.`);
    filesInput.value = "";
    return;
  }
  for(const f of files){
    if(f.size > maxSize){
      alert(`The file "${f.name}" exceeds the maximum size of 8MB.`);
      filesInput.value = "";
      return;
    }
  }
});

/* watch radios */
Array.from(reviewedRadios).forEach(r => r.addEventListener('change', updateBranching));
updateBranching();

//* BUILD PAYLOAD – Renewal Verification Form */
async function buildPayload() {
  const files = Array.from(filesInput.files || []);

  const filesBase64 = await Promise.all(
    files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            content: reader.result.split(',')[1] // BASE64 ONLY
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );

  return {
    orgName: form.orgName.value.trim(),
    reviewed: document.querySelector('input[name="reviewed"]:checked')?.value || '',
    financingPreference: document.querySelector('input[name="financing"]:checked')?.value || '',
    changes: form.changes.value.trim(),
    changeType: form.changeType?.value || '',
    agree: !!form.agree.checked,
    fullName: form.fullName.value.trim(),
    files: filesBase64,
    submittedAt: new Date().toISOString()
  };
}

/* validation */
function validateForm(quiet=false){
  const reviewedVal = Array.from(reviewedRadios).find(r => r.checked)?.value;
  const financingVal = document.querySelector('input[name="financing"]:checked')?.value;

  if(!form.orgName.value.trim()){
    if(!quiet) alert('Please enter Organization Name.');
    form.orgName.focus();
    return false;
  }
  const checked = Array.from(reviewedRadios).find(r=>r.checked);
  if(!checked){
    if(!quiet) alert('Please confirm whether you reviewed the Summary (Yes/No).');
    return false;
  }
  if(checked.value === 'yes'){
    if(!form.changes.value.trim()){
      if(!quiet) alert('Please describe any changes or type "No changes."');
      form.changes.focus();
      return false;
    }
  }
  if(!form.agree.checked){
    if(!quiet) alert('Please confirm the accuracy by checking "I agree".');
    return false;
  }
  if(!form.fullName.value.trim()){
    if(!quiet) alert('Please type your full name as signature.');
    form.fullName.focus();
    return false;
  }
  if(filesInput.files.length > 5){
    if(!quiet) alert('Please upload up to 5 files only.');
    return false;
  }

  if (reviewedVal === 'yes' && !financingVal) {
  alert('Please select whether you would like us to arrange financing terms.');
  return false;
  }

  return true;
}

/* Preview modal logic */
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');

function escapeHtml(str){ return (str+'').replace(/[&<>"]/g, (s)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s])); }

function showPreviewModal(payload){
  const rows = [];
  function addRow(label, value){
    const safe = value === undefined || value === null || value === '' ? '<span style="color:#9aa5b1;font-style:italic;">(not provided)</span>' : escapeHtml(String(value));
    rows.push(`<div class="preview-row"><div class="preview-label">${escapeHtml(label)}</div><div class="preview-value">${safe}</div></div>`);
  }
  addRow('Organization Name', payload.orgName);
  addRow('Reviewed the Summary?', payload.reviewed === 'yes' ? 'Yes' : (payload.reviewed === 'no' ? 'No' : ''));
  addRow('Changes (if any)', payload.changes || 'No changes.');
  if (payload.financingPreference) {
    addPreviewRow(rows, "Financing arrangement requested", payload.financingPreference);
  }
  addRow('Type of change (optional)', payload.changeType || '(not provided)');
  const filesList = (payload.files && payload.files.length) ? payload.files.map(f=>escapeHtml(f.name)).join(', ') : '(no files)';
  addRow('Uploaded files', filesList);
  addRow('Confirmed accuracy', payload.agree ? 'I agree' : 'Not confirmed');
  addRow('Signature (Full name)', payload.fullName);
  addRow('Submitted at', payload.submittedAt);
  previewBody.innerHTML = rows.join('');
  previewModal.classList.remove('hidden');
  closePreview.focus();
}

closePreview.addEventListener('click', closePreviewModal);
editBtn.addEventListener('click', closePreviewModal);
function closePreviewModal(){ previewModal.classList.add('hidden'); document.getElementById('previewBtn').focus(); }

confirmSubmitBtn.addEventListener('click', async ()=>{
  previewModal.classList.add('hidden');
  document.getElementById('reviewForm').dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
});

/* Preview button */
document.getElementById('previewBtn').addEventListener('click', (ev)=>{
  ev.preventDefault();
  const ok = validateForm(true);
  if(!ok) return;
  const payload = buildPayload();
  showPreviewModal(payload);
});

/* form submit */
form.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  statusMsg.classList.add('hidden'); statusMsg.setAttribute('aria-hidden','true');

  // === set submitting state ===
  setSubmittingState(true);

  // === show loading message ===
  statusMsg.classList.remove('hidden');
  statusMsg.setAttribute('aria-hidden','false');
  statusMsg.style.borderLeftColor = '#cbd5e1';
  statusMsg.innerHTML = `
    <strong>Submitting your information…</strong><br/>
    Please wait a moment and do not close this page.
  `;
  scrollToStatus();
  
  const checked = Array.from(reviewedRadios).find(r=>r.checked);
  if(!checked){
    alert('Please confirm whether you reviewed the Summary (Yes/No).');
    return;
  }
  if(checked.value === 'no'){
    alert('Please review the Summary first, then re-open the form and submit.');
    return;
  }

  const valid = validateForm();
  if(!valid) return;

  if(!endpointURL){
    const payload = buildPayload();
    statusMsg.classList.remove('hidden'); statusMsg.setAttribute('aria-hidden','false');
    statusMsg.style.borderLeftColor = 'var(--dark-blue)';
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong> Preview data:<pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload,null,2))}</pre><div style="margin-top:8px;color:var(--muted);">Provide a backend submission endpoint to enable real submissions.</div>`;
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior: 'smooth'});
    return;
  }
  
  try {
  const payload = await buildPayload();

  const res = await fetch(endpointURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Server returned ' + res.status);

  statusMsg.classList.remove('hidden');
  statusMsg.style.borderLeftColor = 'green';
  statusMsg.innerHTML = `<strong>Submitted successfully.</strong>`;

  form.reset();
  updateBranching();

  } catch (err) {
    statusMsg.classList.remove('hidden');
    statusMsg.style.borderLeftColor = 'red';
    statusMsg.innerHTML = `<strong>Submission error:</strong> ${escapeHtml(err.message)}`;
  } finally {
  // restore button state
  setSubmittingState(false);
  scrollToStatus();
  }
});