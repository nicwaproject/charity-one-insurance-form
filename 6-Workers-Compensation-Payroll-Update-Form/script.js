/* -------------------------------------------
   CONFIG
-------------------------------------------- */
const endpointURL = "https://default0ba07df5470948529c6e5a4eeb907c.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/29cd09bfb6704ad7ad837e08817eff70/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=630QdvUTuo6R0RwBvnZ3r9PgfPD2s9v0qo9KEJvBI90"; // set when ready


/* -------------------------------------------
   ELEMENTS
-------------------------------------------- */
const form = document.getElementById('payrollForm');
const payrollList = document.getElementById('payrollList');
const addPayrollBtn = document.getElementById('addPayrollBtn');

const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');

const statusMsg = document.getElementById('statusMsg');

const orgName = document.getElementById('orgName');
const additionalNotes = document.getElementById('additionalNotes');
const finalConfirm = document.getElementById('finalConfirm');


/* -------------------------------------------
   UTILS
-------------------------------------------- */
function show(el){ el && el.classList.remove('hidden'); }
function hide(el){ el && el.classList.add('hidden'); }

function escapeHtml(s){
  return (s==null?'':String(s)).replace(/[&<>'"]/g, c=> ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function setSubmitting(isSubmitting){
  if(!statusMsg) return;
  if(isSubmitting){
    statusMsg.innerHTML = `<strong>Submitting your request…</strong><br/>Please wait and do not close this page.`;
    show(statusMsg);
  }
}


/* -------------------------------------------
   CLASS CODE OPTIONS
-------------------------------------------- */
const CLASS_OPTIONS = [
  "8810 Clerical",
  "8742 Outside Sales",
  "8823 STRTP/Residential Care for Children",
  "9101 School Staff with Driving Exposure",
  "9079 Home Support Services",
  "9085 Residential Care for Developmentally Disabled",
  "8868 Schools/Teachers",
  "9050 Janitorial",
  "Not sure"
];


/* -------------------------------------------
   CREATE PAYROLL BLOCK
-------------------------------------------- */
function createPayrollBlock(data = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'payroll-block';
  wrapper.style = 'border:1px solid var(--muted); padding:12px; margin-top:10px; border-radius:8px;';

  wrapper.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div class="sub-section-title payroll-title">Class code</div>
      <button type="button" class="btn secondary small remove-block-btn">Remove</button>
    </div>

    <div style="margin-top:8px;">
      <label class="muted-small">Class code <span class="required-star">*</span></label>
      <select class="answer class-code-select" required>
        <option value="">— Select class code —</option>
        ${CLASS_OPTIONS.map(o => `<option ${o===data.classCode ? 'selected':''}>${o}</option>`).join('')}
      </select>

      <div class="two-col" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
        <div>
          <label class="muted-small"># of Full Time Employees <span class="required-star">*</span></label>
          <input type="number" class="answer full-time" required>
        </div>
        <div>
          <label class="muted-small"># of Part Time Employees <span class="required-star">*</span></label>
          <input type="number" class="answer part-time" required>
        </div>
      </div>

      <div class="duty-wrapper hidden" style="margin-top:8px;">
        <label class="muted-small">Job duty description <span class="required-star">*</span></label>
        <input type="text" class="answer duty-input" placeholder="Brief job description (required when 'Not sure')" />
      </div>

      <div style="margin-top:8px;">
        <label class="muted-small">Estimated annual payroll (USD) <span class="required-star">*</span></label>
        <input type="number" min="0" step="0.01" class="answer payroll-input" placeholder="0.00" required />
      </div>
    </div>
  `;

  const removeBtn = wrapper.querySelector('.remove-block-btn');
  const classSelect = wrapper.querySelector('.class-code-select');
  const dutyWrapper = wrapper.querySelector('.duty-wrapper');
  const dutyInput = wrapper.querySelector('.duty-input');

  // populate
  if (data.classCode) classSelect.value = data.classCode;
  if (data.duty) dutyInput.value = data.duty;
  if (data.payroll) wrapper.querySelector('.payroll-input').value = data.payroll;

  classSelect.addEventListener('change', () => {
    if (classSelect.value === 'Not sure') {
      dutyWrapper.classList.remove('hidden');
      dutyInput.required = true;
      dutyInput.disabled = false;
    } else {
      dutyWrapper.classList.add('hidden');
      dutyInput.required = false;
      dutyInput.disabled = true;
      dutyInput.value = '';
    }
    renumberBlocks();
  });

  removeBtn.addEventListener('click', () => {
    wrapper.remove();
    renumberBlocks();
  });

  // initial state
  if (classSelect.value === 'Not sure') {
    dutyWrapper.classList.remove('hidden');
    dutyInput.required = true;
    dutyInput.disabled = false;
  } else {
    dutyWrapper.classList.add('hidden');
    dutyInput.required = false;
    dutyInput.disabled = true;
  }

  return wrapper;
}


/* -------------------------------------------
   RENUMBER BLOCKS
-------------------------------------------- */
function renumberBlocks(){
  const items = Array.from(payrollList.querySelectorAll('.payroll-block'));
  items.forEach((it, idx) => {
    const titleEl = it.querySelector('.payroll-title');
    titleEl.textContent = items.length > 1 ? `Class #${idx+1}` : `Class code`;
  });
}


/* -------------------------------------------
   ADD BLOCK
-------------------------------------------- */
addPayrollBtn.addEventListener('click', () => {
  payrollList.appendChild(createPayrollBlock());
  renumberBlocks();
  payrollList.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


/* -------------------------------------------
   INIT WITH ONE BLOCK
-------------------------------------------- */
(function init(){
  payrollList.appendChild(createPayrollBlock());
  renumberBlocks();
})();


/* -------------------------------------------
   BUILD PAYLOAD
-------------------------------------------- */
function buildPayload(){
  const blocks = Array.from(payrollList.querySelectorAll('.payroll-block')).map(b => {
    return { 
      classCode: b.querySelector('.class-code-select').value || '',
      duty: b.querySelector('.duty-input')?.value.trim() || '',
      fullTimeEmployees: b.querySelector('.full-time').value || '',
      partTimeEmployees: b.querySelector('.part-time').value || '',
      payroll: b.querySelector('.payroll-input').value || ''
    };
  });

  return {
    organizationName: orgName.value.trim(),
    payrollByClass: blocks,
    additionalNotes: additionalNotes.value.trim(),
    finalConfirmation: finalConfirm.checked,
    submittedAt: new Date().toISOString()
  };
}


/* -------------------------------------------
   VALIDATION
-------------------------------------------- */
function validateForm(){
  if(!orgName.value.trim()){
    alert('Please enter Organization Name.');
    orgName.focus();
    return false;
  }

  const blocks = Array.from(payrollList.querySelectorAll('.payroll-block'));
  if(blocks.length === 0){
    alert('Please add at least one class code entry.');
    return false;
  }

  for(const [i, b] of blocks.entries()){
    const classCode = b.querySelector('.class-code-select').value;
    const payroll = b.querySelector('.payroll-input').value;
    const dutyInput = b.querySelector('.duty-input');

    if(!classCode){
      alert(`Please select class code for entry #${i+1}.`);
      b.querySelector('.class-code-select').focus();
      return false;
    }

    if(classCode === 'Not sure' && (!dutyInput || !dutyInput.value.trim())){
      alert(`Please provide job duty description for entry #${i+1}.`);
      dutyInput?.focus();
      return false;
    }

    if(payroll === '' || Number(payroll) < 0){
      alert(`Please enter valid estimated payroll for entry #${i+1}.`);
      b.querySelector('.payroll-input').focus();
      return false;
    }
  }

  if(!finalConfirm.checked){
    alert('You must confirm the accuracy of the information.');
    finalConfirm.focus();
    return false;
  }

  return true;
}


/* -------------------------------------------
   PREVIEW
-------------------------------------------- */
function showPreviewModal(payload){
  const rows = [];
  rows.push(`<div style="margin-bottom:8px;"><strong>Organization:</strong> ${escapeHtml(payload.organizationName)}</div>`);

  payload.payrollByClass.forEach((p, i) => {
    rows.push(`
      <div class="vehicle-card">
        <div><strong>Class #${i+1}</strong></div>
        <div><strong>Class code:</strong> ${escapeHtml(p.classCode)}</div>
        ${p.duty ? `<div><strong>Job duty:</strong> ${escapeHtml(p.duty)}</div>` : ''}
        <div><strong># Full Time:</strong> ${escapeHtml(p.fullTimeEmployees)}</div>
        <div><strong># Part Time:</strong> ${escapeHtml(p.partTimeEmployees)}</div>
        <div><strong>Estimated payroll:</strong> $${Number(p.payroll).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      </div>
    `);
  });

  if(payload.additionalNotes){
    rows.push(`<div style="margin-top:12px;"><strong>Notes:</strong> ${escapeHtml(payload.additionalNotes)}</div>`);
  }

  previewBody.innerHTML = rows.join('');
  show(previewModal);
  closePreview.focus();
}


/* -------------------------------------------
   PREVIEW EVENTS
-------------------------------------------- */
previewBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  if(!validateForm()) return;
  const payload = buildPayload();
  showPreviewModal(payload);
});

closePreview.addEventListener('click', ()=> hide(previewModal));
editBtn.addEventListener('click', ()=> hide(previewModal));

confirmSubmitBtn.addEventListener('click', ()=>{
  hide(previewModal);
  form.requestSubmit();   // ✅ proper submit
});


/* -------------------------------------------
   SUBMIT
-------------------------------------------- */
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if(!validateForm()) return;

  setSubmitting(true);

  const payload = buildPayload();

  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    show(statusMsg);
    return;
  }

  try {
    const res = await fetch(endpointURL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    if(!res.ok) throw new Error('Server error');

    statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
    show(statusMsg);

    form.reset();
    payrollList.innerHTML = '';
    payrollList.appendChild(createPayrollBlock());
    renumberBlocks();

  } catch(err) {
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${escapeHtml(err.message)}`;
    show(statusMsg);
  }
});