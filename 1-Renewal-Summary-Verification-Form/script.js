/* ===============================
   CONFIG
================================= */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bd86f6a973404632b3bccd8c51619ed8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ztAl-nf6IOROh3E8w7n2Uy7R_IehtuFxq9tBHjrcz2o";

/* ===============================
   ELEMENTS
================================= */
const form = document.getElementById('reviewForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');

const reviewedRadios = form.elements['reviewed'];
const financingSection = document.getElementById('secFinancing');
const financingRadios = document.querySelectorAll('input[name="financing"]');
const financingNoMsg = document.getElementById('financingNoMsg');

const pleaseReviewMsg = document.getElementById('pleaseReviewMsg');
const section3 = document.getElementById('sec3');
const filesInput = document.getElementById('files');

/* ===============================
   UI HELPERS
================================= */
function show(el){
  if(!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
}

function hide(el){
  if(!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
}

function scrollToStatus(){
  statusMsg?.scrollIntoView({ behavior:'smooth', block:'center' });
}

function setSubmittingState(isSubmitting){
  if(!submitBtn) return;
  submitBtn.disabled = isSubmitting;
  submitBtn.innerText = isSubmitting ? 'Submitting…' : 'Submit';
  submitBtn.style.opacity = isSubmitting ? '0.7' : '1';
  submitBtn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
}

/* ===============================
   REVIEWED → FINANCING LOGIC (FIXED)
================================= */
function updateBranching(){
  const reviewedVal =
    document.querySelector('input[name="reviewed"]:checked')?.value;

  // reset financing state
  hide(financingSection);
  hide(financingNoMsg);
  financingRadios.forEach(r => r.checked = false);

  if(!reviewedVal){
    hide(pleaseReviewMsg);
    section3.style.display = '';
    return;
  }

  if(reviewedVal === 'no'){
    show(pleaseReviewMsg);
    section3.style.display = 'none';
    return;
  }

  // reviewed === yes
  hide(pleaseReviewMsg);
  section3.style.display = '';
  show(financingSection); // ✅ THIS WAS MISSING BEFORE
}

Array.from(reviewedRadios).forEach(r =>
  r.addEventListener('change', updateBranching)
);
updateBranching();

/* ===============================
   FINANCING RADIO LOGIC
================================= */
financingRadios.forEach(r=>{
  r.addEventListener('change', ()=>{
    const val =
      document.querySelector('input[name="financing"]:checked')?.value;
    val === 'no' ? show(financingNoMsg) : hide(financingNoMsg);
  });
});

/* ===============================
   BUILD PAYLOAD
================================= */
async function buildPayload(){
  const files = Array.from(filesInput.files || []);

  const filesBase64 = await Promise.all(
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

  return {
    orgName: form.orgName.value.trim(),
    reviewed: document.querySelector('input[name="reviewed"]:checked')?.value || '',
    financingPreference:
      document.querySelector('input[name="financing"]:checked')?.value || '',
    changes: form.changes.value.trim(),
    changeType: form.changeType?.value || '',
    agree: !!form.agree.checked,
    fullName: form.fullName.value.trim(),
    files: filesBase64,
    submittedAt: new Date().toISOString()
  };
}

/* ===============================
   VALIDATION
================================= */
function validateForm(){
  const reviewedVal =
    document.querySelector('input[name="reviewed"]:checked')?.value;
  const financingVal =
    document.querySelector('input[name="financing"]:checked')?.value;

  if(!form.orgName.value.trim()){
    alert('Please enter Organization Name.');
    return false;
  }

  if(!reviewedVal){
    alert('Please confirm whether you reviewed the Summary.');
    return false;
  }

  if(reviewedVal === 'yes' && !form.changes.value.trim()){
    alert('Please describe any changes or type "No changes."');
    return false;
  }

  if(reviewedVal === 'yes' && !financingVal){
    alert('Please select whether financing is needed.');
    return false;
  }

  if(!form.agree.checked){
    alert('Please confirm the accuracy.');
    return false;
  }

  if(!form.fullName.value.trim()){
    alert('Please type your full name.');
    return false;
  }

  return true;
}

/* ===============================
   PREVIEW MODAL
================================= */
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const previewBtn = document.getElementById('previewBtn');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');

function escapeHtml(str){
  return (str+'').replace(/[&<>"]/g, s =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[s]
  );
}

function showPreviewModal(payload){
  previewBody.innerHTML = `
    <div class="preview-row"><b>Organization:</b> ${escapeHtml(payload.orgName)}</div>
    <div class="preview-row"><b>Reviewed Summary:</b> ${payload.reviewed}</div>
    <div class="preview-row"><b>Financing Preference:</b> ${payload.financingPreference || 'N/A'}</div>
    <div class="preview-row"><b>Changes:</b> ${escapeHtml(payload.changes)}</div>
    <div class="preview-row"><b>Submitted By:</b> ${escapeHtml(payload.fullName)}</div>
  `;
  previewModal.classList.remove('hidden');
}

previewBtn.addEventListener('click', async e=>{
  e.preventDefault();
  if(!validateForm()) return;
  const payload = await buildPayload();
  showPreviewModal(payload);
});

closePreview.addEventListener('click', ()=> previewModal.classList.add('hidden'));
editBtn.addEventListener('click', ()=> previewModal.classList.add('hidden'));

confirmSubmitBtn.addEventListener('click', ()=>{
  previewModal.classList.add('hidden');
  form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
});

/* ===============================
   FORM SUBMIT
================================= */
form.addEventListener('submit', async ev=>{
  ev.preventDefault();

  if(!validateForm()) return;

  setSubmittingState(true);
  show(statusMsg);
  statusMsg.style.borderLeftColor = '#cbd5e1';
  statusMsg.innerHTML = `
  <strong>Submitting your request…</strong><br/>
    Please wait and do not close this page.
  `;
  scrollToStatus();

  try {
    const payload = await buildPayload();

    const res = await fetch(endpointURL,{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });

    if(!res.ok) throw new Error('Server error');

    statusMsg.style.borderLeftColor = 'green';
    statusMsg.innerHTML = `<strong>Submitted successfully.</strong>`;
    form.reset();
    updateBranching();

  } catch(err){
    statusMsg.style.borderLeftColor = 'red';
    statusMsg.innerHTML = `<strong>Error:</strong> ${escapeHtml(err.message)}`;
  } finally {
    setSubmittingState(false);
    scrollToStatus();
  }
});
