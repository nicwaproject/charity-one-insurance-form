/* CONFIG */
const endpointURL = ""; // set when ready

/* ELEMENTS */
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

/* UTILS */
function show(el){ el && el.classList.remove('hidden'); }
function hide(el){ el && el.classList.add('hidden'); }
function escapeHtml(s){ return (s==null?'':String(s)).replace(/[&<>'"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;',"'" :'&#39;','"':'&quot;'}[c])); }

/* CLASS CODE OPTIONS (exact as requested) */
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

/* Create a single payroll block */
function createPayrollBlock(data = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'payroll-block';
  wrapper.style = 'border:1px solid var(--muted); padding:12px; margin-top:10px; border-radius:8px;';

  // header with remove button and title (will renumber)
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

  // events
  const removeBtn = wrapper.querySelector('.remove-block-btn');
  const classSelect = wrapper.querySelector('.class-code-select');
  const dutyWrapper = wrapper.querySelector('.duty-wrapper');
  const dutyInput = wrapper.querySelector('.duty-input');
  const payrollInput = wrapper.querySelector('.payroll-input');

  // populate if data provided
  if (data.classCode) classSelect.value = data.classCode;
  if (data.duty) dutyInput.value = data.duty;
  if (data.payroll) payrollInput.value = data.payroll;

  // change handler
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

  // initial state for duty input
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

/* renumber blocks titles: show "Class #n" only when >1 */
function renumberBlocks(){
  const items = Array.from(payrollList.querySelectorAll('.payroll-block'));
  items.forEach((it, idx) => {
    const titleEl = it.querySelector('.payroll-title');
    if (items.length > 1) titleEl.textContent = `Class #${idx+1}`;
    else titleEl.textContent = `Class code`;
  });
}

/* add new block */
addPayrollBtn.addEventListener('click', () => {
  payrollList.appendChild(createPayrollBlock());
  renumberBlocks();
  // scroll into view
  const last = payrollList.lastElementChild;
  last && last.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* start with one block */
(function init(){
  payrollList.appendChild(createPayrollBlock());
  renumberBlocks();
})();

/* Build payload from form */
function buildPayload(){
  const blocks = Array.from(payrollList.querySelectorAll('.payroll-block')).map(b => {
    const classCode = b.querySelector('.class-code-select').value || '';
    const duty = b.querySelector('.duty-input') ? b.querySelector('.duty-input').value.trim() : '';
    const payroll = b.querySelector('.payroll-input').value || '';
    const fullTime = b.querySelector('.full-time').value || '';
    const partTime = b.querySelector('.part-time').value || '';

    return { 
      classCode, 
      duty, 
      fullTimeEmployees: fullTime,
      partTimeEmployees: partTime,
      payroll 
    };
  });

  return {
    organizationName: orgName.value.trim(),
    payrollByClass: blocks,
    additionalNotes: additionalNotes.value.trim(),
    finalConfirmation: document.getElementById('finalConfirm').checked,
    submittedAt: new Date().toISOString()
  };
}

/* Validation */
function validateForm(){
  // organization required
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
      alert(`Please provide job duty description for entry #${i+1} (Not sure).`);
      dutyInput && dutyInput.focus();
      return false;
    }
    if(payroll === '' || payroll === null){
      alert(`Please enter estimated payroll for entry #${i+1}.`);
      b.querySelector('.payroll-input').focus();
      return false;
    }
    if(Number(payroll) < 0){
      alert(`Estimated payroll must be 0 or greater for entry #${i+1}.`);
      b.querySelector('.payroll-input').focus();
      return false;
    }
  }

  const finalConfirm = document.getElementById('finalConfirm');
    if (!finalConfirm.checked) {
      alert('You must confirm the accuracy of the information.');
      finalConfirm.focus();
      return false;
    }

  return true;
}

/* PREVIEW: build human readable rows */
function showPreviewModal(payload){
  const rows = [];
  rows.push(`<div style="margin-bottom:8px;"><strong>Organization:</strong> ${escapeHtml(payload.organizationName || '(not provided)')}</div>`);

  payload.payrollByClass.forEach((p, i) => {
    rows.push(`
      <div class="vehicle-card">
      <div><strong>Class #${i+1}</strong></div>
      <div style="margin-top:6px;"><strong>Class code:</strong> ${escapeHtml(p.classCode || '(not provided)')}</div>
      ${p.duty ? `<div><strong>Job duty:</strong> ${escapeHtml(p.duty)}</div>` : ''}
      <div><strong># Full Time Employees:</strong> ${escapeHtml(p.fullTimeEmployees || '(not provided)')}</div>
      <div><strong># Part Time Employees:</strong> ${escapeHtml(p.partTimeEmployees || '(not provided)')}</div>
      <div><strong>Estimated payroll:</strong> $${Number(p.payroll).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
    </div>
    `);
  });

  if(payload.additionalNotes) rows.push(`<div style="margin-top:12px;"><strong>Notes:</strong> ${escapeHtml(payload.additionalNotes)}</div>`);
  rows.push(`<div style="margin-top:12px;color:#667;"><small>Submitted at ${escapeHtml(payload.submittedAt)}</small></div>`);

  previewBody.innerHTML = rows.join('');
  show(previewModal);
  closePreview.focus();
}

/* Preview handlers */
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
  form.dispatchEvent(new Event('submit'));
});

/* Submit (demo) */
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if(!validateForm()) return;

  const payload = buildPayload();

  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
    statusMsg.setAttribute('aria-hidden','false');
    window.scrollTo({ top: statusMsg.offsetTop - 20, behavior: 'smooth' });
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
    statusMsg.classList.remove('hidden');
  } catch(err) {
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${escapeHtml(err.message)}`;
    statusMsg.classList.remove('hidden');
  }
});