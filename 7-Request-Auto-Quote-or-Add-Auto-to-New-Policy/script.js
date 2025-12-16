/* CONFIG */
const endpointURL = ""; // demo mode

/* CACHED DOM */
const autoForm = document.getElementById('autoForm');
const ownedRadios = document.querySelectorAll('input[name="ownedByOrg"]');

const vehicleList = document.getElementById('vehicleList');
const addVehicleBtn = document.getElementById('addVehicleBtn');

const optionalDocs = document.getElementById('optionalDocs');
const notes = document.getElementById('notes');

const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactPhone = document.getElementById('contactPhone');
const attest = document.getElementById('attest');
const ownershipWarning = document.getElementById('ownershipWarning');

const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');

const statusMsg = document.getElementById('statusMsg');

const vehiclesSection = document.getElementById('vehiclesSection');
const optionalDocsSection = document.getElementById('optionalDocs').closest('.section');
const notesSection = document.getElementById('notes').closest('.section');
const contactSection = document.getElementById('contactName').closest('.section');
const attestSection = document.getElementById('attest').closest('.section');

const submitBtn = document.getElementById('submitBtn');

/* UTILS */
function show(el){ if(!el) return; el.classList.remove('hidden'); el.style.display = ''; }
function hide(el){ if(!el) return; el.classList.add('hidden'); el.style.display = 'none'; }
function escapeHtml(s){ return (s===null||s===undefined)?'':String(s).replace(/[&<>'"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;',"\"":"&quot;","'":"&#39;"}[c])); }
function uniqueId(){ return 'v_' + Math.random().toString(36).slice(2,9); }

function setSectionDisabled(section, disabled = true) {
  if (!section) return;
  section.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = disabled;
  });
}

ownedRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const val = document.querySelector('input[name="ownedByOrg"]:checked')?.value;

    if (val === 'no') {
      show(ownershipWarning);

      setSectionDisabled(vehiclesSection, true);
      setSectionDisabled(optionalDocsSection, true);
      setSectionDisabled(notesSection, true);
      setSectionDisabled(contactSection, true);
      setSectionDisabled(attestSection, true);

      addVehicleBtn.disabled = true;
      previewBtn.disabled = true;
      submitBtn.disabled = true;

      // 🔥 LOCK OWNERSHIP CHOICE
      ownedRadios.forEach(r => r.disabled = true);

      ownershipWarning.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      hide(ownershipWarning);

      setSectionDisabled(vehiclesSection, false);
      setSectionDisabled(optionalDocsSection, false);
      setSectionDisabled(notesSection, false);
      setSectionDisabled(contactSection, false);
      setSectionDisabled(attestSection, false);
      
      addVehicleBtn.disabled = false;
      previewBtn.disabled = false;
      submitBtn.disabled = false;

      // 🔓 UNLOCK OWNERSHIP CHOICE
      ownedRadios.forEach(r => r.disabled = false);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  hide(ownershipWarning);
});

/* VEHICLE BLOCK TEMPLATE (create & handlers) */
function createVehicleBlock(data = {}) {
  const uid = uniqueId();
  const wrapper = document.createElement('div');
  wrapper.className = 'vehicle-card';
  wrapper.dataset.uid = uid;
  wrapper.style.marginTop = '12px';
  wrapper.innerHTML = `
    <div class="vehicle-card-header" style="display:flex;justify-content:space-between;align-items:center;">
      <div class="vehicle-title">Vehicle</div>
      <button type="button" class="btn secondary small remove-vehicle-btn">Remove</button>
    </div>

    <div class="vehicle-card-body" style="margin-top:8px;">
      <div style="display:flex;gap:8px;">
        <input class="answer veh-year" type="number" placeholder="Year *" value="${data.year||''}" style="flex:1;"/>
        <input class="answer veh-make" placeholder="Make *" value="${data.make||''}" style="flex:2;"/>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <input class="answer veh-model" placeholder="Model *" value="${data.model||''}" style="flex:2;"/>
        <input class="answer veh-vin" placeholder="VIN *" value="${data.vin||''}" style="flex:1;"/>
      </div>

      <div style="margin-top:8px;">
        <div class="sub-section-title">Where is the vehicle usually parked when not in use? <span class="required-star">*</span></div>
        <input class="answer veh-street" placeholder="Street address *" value="${data.street||''}" style="margin-top:6px;"/>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <input class="answer veh-city" placeholder="City *" value="${data.city||''}" style="flex:2;"/>
          <select class="answer veh-state" style="flex:1;">
            <option value="">-- State --</option>
            <option>CA</option><option>TX</option><option>NY</option><option>FL</option>
          </select>
          <input class="answer veh-zip" placeholder="ZIP *" value="${data.zip||''}" style="flex:1;"/>
        </div>
        <p class="intro" style="margin-top:6px;">Please enter full address: Street, City, State, ZIP.</p>
      </div>

      <div style="margin-top:10px;">
        <label class="sub-section-title">Vehicle Purpose <span class="required-star">*</span></label>
        <select class="answer veh-purpose" style="margin-top:6px;">
          <option value="">-- select --</option>
          <option>Transporting clients</option>
          <option>Employee operations</option>
          <option>Program services</option>
          <option>Outreach / field work</option>
          <option>Administrative use</option>
          <option>Agency errands</option>
          <option value="other">Other</option>
        </select>
        <input class="answer veh-purpose-other hidden" placeholder="Explain other purpose" style="margin-top:6px;"/>
      </div>

      <div style="margin-top:10px;">
        <label class="sub-section-title">Ownership Type <span class="required-star">*</span></label>
        <select class="answer veh-ownership" style="margin-top:6px;">
          <option value="">-- select --</option>
          <option value="owned">Owned</option>
          <option value="leased">Leased</option>
        </select>

        <input class="answer veh-lessor hidden" placeholder="Lessor name (required when leased)" style="margin-top:8px;"/>
      </div>

      <div style="margin-top:10px;">
        <label class="sub-section-title">Upload Registration (optional)</label>
        <input type="file" class="answer veh-regfile" style="margin-top:6px;"/>
      </div>

    </div>
  `;

  // events
  wrapper.querySelector('.remove-vehicle-btn').addEventListener('click', () => {
    wrapper.remove();
    renumberVehicles();
  });

  // purpose other toggle
  const purposeSel = wrapper.querySelector('.veh-purpose');
  const purposeOther = wrapper.querySelector('.veh-purpose-other');
  purposeSel.addEventListener('change', () => {
    if (purposeSel.value === 'other') {
      purposeOther.classList.remove('hidden');
      purposeOther.style.display = '';
      purposeOther.required = true;
    } else {
      purposeOther.classList.add('hidden');
      purposeOther.style.display = 'none';
      purposeOther.required = false;
      purposeOther.value = '';
    }
  });

  // ownership toggle
  const ownershipSel = wrapper.querySelector('.veh-ownership');
  const lessorInput = wrapper.querySelector('.veh-lessor');
  ownershipSel.addEventListener('change', () => {
    if (ownershipSel.value === 'leased') {
      lessorInput.classList.remove('hidden');
      lessorInput.style.display = '';
      lessorInput.required = true;
    } else {
      lessorInput.classList.add('hidden');
      lessorInput.style.display = 'none';
      lessorInput.required = false;
      lessorInput.value = '';
    }
  });

  return wrapper;
}

function renumberVehicles() {
  const cards = Array.from(vehicleList.querySelectorAll('.vehicle-card'));
  cards.forEach((c, i) => {
    const title = c.querySelector('.vehicle-title');
    if (title) title.textContent = `Vehicle #${i+1}`;
  });
}

/* initial one vehicle */
addVehicleBtn.addEventListener('click', () => {
  vehicleList.appendChild(createVehicleBlock());
  renumberVehicles();
  // scroll to last
  const last = vehicleList.lastElementChild;
  if (last) last.scrollIntoView({behavior:'smooth', block:'center'});
});

/* add initial row on load */
document.addEventListener('DOMContentLoaded', () => {
  vehicleList.appendChild(createVehicleBlock());
  renumberVehicles();
});

/* BUILD PAYLOAD */
function buildPayload() {
  const payload = {};
  payload.actionType = document.querySelector('input[name="actionType"]:checked')?.value || '';
  payload.ownedByOrg = document.querySelector('input[name="ownedByOrg"]:checked')?.value || '';
  payload.writtenAgreement = document.querySelector('input[name="writtenAgreement"]:checked')?.value || '';

  // vehicles
  payload.vehicles = [];
  const rows = Array.from(vehicleList.querySelectorAll('.vehicle-card'));
  for (const r of rows) {
    payload.vehicles.push({
      year: r.querySelector('.veh-year')?.value?.trim() || '',
      make: r.querySelector('.veh-make')?.value?.trim() || '',
      model: r.querySelector('.veh-model')?.value?.trim() || '',
      vin: r.querySelector('.veh-vin')?.value?.trim() || '',
      garaging: {
        street: r.querySelector('.veh-street')?.value?.trim() || '',
        city: r.querySelector('.veh-city')?.value?.trim() || '',
        state: r.querySelector('.veh-state')?.value || '',
        zip: r.querySelector('.veh-zip')?.value?.trim() || ''
      },
      purpose: r.querySelector('.veh-purpose')?.value || '',
      purposeOther: r.querySelector('.veh-purpose-other')?.value?.trim() || '',
      ownership: r.querySelector('.veh-ownership')?.value || '',
      lessor: r.querySelector('.veh-lessor')?.value?.trim() || '',
      registrationFileName: r.querySelector('.veh-regfile')?.files?.[0]?.name || ''
    });
  }

  payload.optionalDocs = [...optionalDocs.files].map(f => f.name);
  payload.notes = notes.value.trim();
  payload.contact = {
    name: contactName.value.trim(),
    email: contactEmail.value.trim(),
    phone: contactPhone.value.trim()
  };
  payload.attestation = !!attest.checked;
  payload.submittedAt = new Date().toISOString();

  return payload;
}

/* VALIDATION */
function validateForm() {
  const owned = document.querySelector('input[name="ownedByOrg"]:checked')?.value;

  if (owned === 'no') {
    return false;
  }
  // simple required checks
  if (!contactName.value.trim()) { alert('Please enter contact name.'); return false; }
  if (!contactEmail.value.trim()) { alert('Please enter contact email.'); return false; }
  if (!contactPhone.value.trim()) { alert('Please enter contact phone.'); return false; }
  if (!attest.checked) { alert('Please confirm the attestation.'); return false; }

  // vehicles required fields
  const rows = Array.from(vehicleList.querySelectorAll('.vehicle-card'));
  if (rows.length === 0) { alert('Please add at least one vehicle.'); return false; }

  for (const [idx, r] of rows.entries()) {
    const year = r.querySelector('.veh-year')?.value?.trim() || '';
    const make = r.querySelector('.veh-make')?.value?.trim() || '';
    const model = r.querySelector('.veh-model')?.value?.trim() || '';
    const vin = r.querySelector('.veh-vin')?.value?.trim() || '';
    const street = r.querySelector('.veh-street')?.value?.trim() || '';
    const city = r.querySelector('.veh-city')?.value?.trim() || '';
    const state = r.querySelector('.veh-state')?.value || '';
    const zip = r.querySelector('.veh-zip')?.value?.trim() || '';
    const purpose = r.querySelector('.veh-purpose')?.value || '';
    const ownership = r.querySelector('.veh-ownership')?.value || '';
    const lessor = r.querySelector('.veh-lessor')?.value?.trim() || '';

    if (!year || !make || !model || !vin) {
      alert(`Please fill required fields (Year/Make/Model/VIN) for vehicle ${idx+1}.`);
      return false;
    }
    if (!street || !city || !state || !zip) {
      alert(`Please provide where is the vehicle usually parked when not in use? (street/city/state/ZIP) for vehicle ${idx+1}.`);
      return false;
    }
    if (!purpose) {
      alert(`Please select vehicle purpose for vehicle ${idx+1}.`);
      return false;
    }
    if (!ownership) {
      alert(`Please select ownership type for vehicle ${idx+1}.`);
      return false;
    }
    if (ownership === 'leased' && !lessor) {
      alert(`Please enter lessor name for leased vehicle ${idx+1}.`);
      return false;
    }
  }

  return true;
}

/* PREVIEW */
function addPreviewRow(rows, label, value) {
  rows.push(`<div class="preview-row"><div class="preview-label">${escapeHtml(label)}</div><div class="preview-value">${escapeHtml(value||'(not provided)')}</div></div>`);
}

function showPreview(payload) {
  const rows = [];
  addPreviewRow(rows, 'Action', payload.actionType || '(not provided)');
  addPreviewRow(rows, 'Organization owns vehicle(s)?', payload.ownedByOrg || '(not provided)');

  if (payload.vehicles && payload.vehicles.length) {
    payload.vehicles.forEach((v, i) => {
      rows.push(`<h4 style="margin-top:12px;">Vehicle ${i+1}</h4>`);
      addPreviewRow(rows, 'Year', v.year);
      addPreviewRow(rows, 'Make', v.make);
      addPreviewRow(rows, 'Model', v.model);
      addPreviewRow(rows, 'VIN', v.vin);
      addPreviewRow(rows, 'Garaging', `${v.garaging.street} / ${v.garaging.city} / ${v.garaging.state} / ${v.garaging.zip}`);
      addPreviewRow(rows, 'Purpose', v.purpose === 'other' ? v.purposeOther : v.purpose);
      addPreviewRow(rows, 'Ownership', v.ownership);
      if (v.ownership === 'leased') addPreviewRow(rows, 'Lessor', v.lessor || '(not provided)');
    });
  }

  addPreviewRow(rows, 'Optional docs', payload.optionalDocs.join(', ') || '(none)');
  addPreviewRow(rows, 'Notes', payload.notes);
  addPreviewRow(rows, 'Contact name', payload.contact.name);
  addPreviewRow(rows, 'Contact email', payload.contact.email);
  addPreviewRow(rows, 'Contact phone', payload.contact.phone);
  addPreviewRow(rows, 'Attestation', payload.attestation ? 'Confirmed' : 'Not confirmed');

  previewBody.innerHTML = rows.join('');
  show(previewModal);
}

/* Preview button */
previewBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  if (!validateForm()) return;
  const payload = buildPayload();
  showPreview(payload);
});

/* modal handlers */
closePreview.addEventListener('click', () => hide(previewModal));
editBtn.addEventListener('click', () => hide(previewModal));

confirmSubmitBtn.addEventListener('click', () => {
  hide(previewModal);
  autoForm.dispatchEvent(new Event('submit'));
});

/* SUBMIT (demo) */
autoForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (!validateForm()) return;
  const payload = buildPayload();

  if (!endpointURL) {
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
    statusMsg.setAttribute('aria-hidden','false');
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
    return;
  }

  (async () => {
    try {
      const res = await fetch(endpointURL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Server error');
      statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
      statusMsg.classList.remove('hidden');
    } catch (err) {
      statusMsg.innerHTML = `<strong>Submission failed:</strong> ${escapeHtml(err.message)}`;
      statusMsg.classList.remove('hidden');
    }
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
  })();
});