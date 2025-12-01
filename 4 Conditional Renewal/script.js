/* CONFIG */
const endpointURL = ""; // set to your server endpoint when ready

/* Cached DOM */
const changeTypeGroup = document.getElementById('changeTypeGroup');
const addVehicleSection = document.getElementById('addVehicleSection');
const removeVehicleSection = document.getElementById('removeVehicleSection');
const updateVehicleSection = document.getElementById('updateVehicleSection');
const otherChangeSection = document.getElementById('otherChangeSection');

const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleList = document.getElementById('vehicleList');

const symbolsAck = document.getElementById('symbolsAck');

const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactPhone = document.getElementById('contactPhone');

const finalConfirm = document.getElementById('finalConfirm');

const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
const previewBtn = document.getElementById('previewBtn');

const statusMsg = document.getElementById('statusMsg');
const autoForm = document.getElementById('autoForm');

/* Helpers */
function show(el){ if(el) el.classList.remove('hidden'); }
function hide(el){ if(el) el.classList.add('hidden'); }
function escapeHtml(str){ return (str+'').replace(/[&<>"]/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

/* --------------------------
   Change type logic (show/hide)
---------------------------*/
function evaluateChangeTypeSections(){
  const checked = Array.from(document.querySelectorAll('input[name="changeType"]'))
    .filter(cb => cb.checked).map(cb => cb.value);

  // Add Vehicle
  if(checked.includes('add')) show(addVehicleSection); else hide(addVehicleSection);

  // Remove Vehicle
  if(checked.includes('remove')) show(removeVehicleSection); else hide(removeVehicleSection);

  // Update Vehicle
  if(checked.includes('update')) show(updateVehicleSection); else hide(updateVehicleSection);

  // Other
  if(checked.includes('other')) show(otherChangeSection); else hide(otherChangeSection);
}

document.querySelectorAll('input[name="changeType"]').forEach(cb => {
  cb.addEventListener('change', evaluateChangeTypeSections);
});
evaluateChangeTypeSections();

/* --------------------------
   Vehicle row template & handlers
---------------------------*/
// Create unique ID for radio grouping
function uniqueId() {
  return 'id_' + Math.random().toString(36).substring(2, 9);
}

// Create one vehicle form row
function createVehicleRow(data = {}) {
  const uid = uniqueId();

  const wrapper = document.createElement('div');
  wrapper.className = "vehicle-row";
  wrapper.style.marginTop = "20px";

  wrapper.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;">
      <div class="sub-section-title">Vehicle <span class="required-star">*</span></div>
      <button type="button" class="btn secondary small remove-vehicle-btn">Remove</button>
    </div>

    <div style="margin-top:8px;">

      <input class="answer veh-year" type="number" placeholder="Year *" value="${data.year || ''}">

      <input class="answer veh-make" placeholder="Make *" style="margin-top:8px;" value="${data.make || ''}">

      <input class="answer veh-model" placeholder="Model *" style="margin-top:8px;" value="${data.model || ''}">

      <input class="answer veh-vin" placeholder="VIN *" style="margin-top:8px;" value="${data.vin || ''}">

      <textarea class="answer veh-garaging" placeholder="Garaging address *" style="margin-top:8px;">${data.garaging || ''}</textarea>

      <label class="sub-section-title" style="margin-top:12px;">Primary use <span class="required-star">*</span></label>
      <select class="answer veh-primary-use" style="margin-top:6px;">
        <option value="">-- select --</option>
        <option value="Agency administration"${data.primaryUse === 'Agency administration' ? ' selected' : ''}>Agency administration</option>
        <option value="Client transport"${data.primaryUse === 'Client transport' ? ' selected' : ''}>Client transport</option>
        <option value="Deliveries or pickups"${data.primaryUse === 'Deliveries or pickups' ? ' selected' : ''}>Deliveries or pickups</option>
        <option value="Maintenance or service"${data.primaryUse === 'Maintenance or service' ? ' selected' : ''}>Maintenance or service</option>
        <option value="Other agency use"${data.primaryUse === 'Other agency use' ? ' selected' : ''}>Other agency use</option>
      </select>

      <label class="sub-section-title" style="margin-top:12px;">Ownership <span class="required-star">*</span></label>
      <select class="answer veh-ownership" style="margin-top:6px;">
        <option value="">-- select --</option>
        <option value="Owned"${data.ownership === 'Owned' ? ' selected' : ''}>Owned</option>
        <option value="Financed"${data.ownership === 'Financed' ? ' selected' : ''}>Financed</option>
        <option value="Leased"${data.ownership === 'Leased' ? ' selected' : ''}>Leased</option>
      </select>

      <input class="answer veh-lienholder" placeholder="Lienholder / lessor name (optional)" style="margin-top:8px;" value="${data.lienholder || ''}">

      <div style="margin-top:12px;">
        <label class="sub-section-title">Is this vehicle used to transport clients, participants, or residents? <span class="required-star">*</span></label>

        <div style="margin:6px 0; font-size:14px;">
          <label><input type="radio" name="client-trans-${uid}" value="Yes"> Yes</label>
          <label style="margin-left:12px;"><input type="radio" name="client-trans-${uid}" value="No"> No</label>
        </div>

        <textarea 
          class="answer veh-client-transport-notes" 
          placeholder="Notes about client transport (optional)" 
          style="margin-top:8px; display:none;"></textarea>
      </div>

      <label class="sub-section-title" style="margin-top:12px;">Estimated usage (optional)</label>
      <select class="answer veh-estimated-usage" style="margin-top:6px;">
        <option value="">-- select --</option>
        <option value="Local only"${data.estimatedUsage === 'Local only' ? ' selected' : ''}>Local only</option>
        <option value="Within state"${data.estimatedUsage === 'Within state' ? ' selected' : ''}>Within state</option>
        <option value="Multi state travel"${data.estimatedUsage === 'Multi state travel' ? ' selected' : ''}>Multi state travel</option>
      </select>

      <label class="sub-section-title" style="margin-top:12px;">Effective date to add <span class="required-star">*</span></label>
      <input class="answer veh-effdate" type="date" style="margin-top:6px;" value="${data.effdate || ''}">

      <div style="margin-top:12px;">
        <input type="file" class="answer veh-doc">
        <div class="intro">Upload supporting document (optional)</div>
      </div>
    </div>
  `;

  // ADD EVENT: toggle client-transport notes
  wrapper.querySelectorAll(`input[name="client-trans-${uid}"]`).forEach(radio => {
    radio.addEventListener('change', () => {
      const showNotes = radio.value === 'Yes';
      wrapper.querySelector('.veh-client-transport-notes').style.display = showNotes ? 'block' : 'none';
    });
  });

  // ADD EVENT: remove row
  wrapper.querySelector('.remove-vehicle-btn').addEventListener('click', () => {
    wrapper.remove();
  });

  return wrapper;
}

addVehicleBtn.addEventListener('click', ()=>{
  const row = createVehicleRow();
  vehicleList.appendChild(row);
  // scroll to new row
  row.scrollIntoView({behavior:'smooth', block:'center'});
});

// initialize with one blank row for UX
vehicleList.appendChild(createVehicleRow());

  // REMOVE VEHICLE: toggle "Other reason" field
  document.getElementById('removeReason').addEventListener('change', function() {
    const isOther = this.value === 'other';
    const otherField = document.getElementById('removeReasonOtherContainer');
    const otherInput = document.getElementById('removeReasonOther');

    if (isOther) {
      otherField.classList.remove('hidden');
      otherInput.setAttribute('required', 'true');
    } else {
      otherField.classList.add('hidden');
      otherInput.removeAttribute('required');
      otherInput.value = '';
    }
  });

  /* --------------------------
   UPDATE VEHICLE — Show field if "Other change"
---------------------------*/
const updateType = document.getElementById("updateType");
const updateTypeOtherContainer = document.getElementById("updateTypeOtherContainer");
const updateTypeOther = document.getElementById("updateTypeOther");

if (updateType) {
  updateType.addEventListener("change", () => {
    if (updateType.value === "other_change") {
      updateTypeOtherContainer.classList.remove("hidden");
      updateTypeOther.setAttribute("required", "true");
    } else {
      updateTypeOtherContainer.classList.add("hidden");
      updateTypeOther.removeAttribute("required");
      updateTypeOther.value = "";
    }
  });
}

/* --------------------------
   UPDATE VEHICLE — Show client transport notes only if Yes
---------------------------*/
const transportRadios = document.querySelectorAll("input[name='update_client_transport']");
const notesContainer = document.getElementById("updateClientTransportNotesContainer");

transportRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "yes") {
      notesContainer.classList.remove("hidden");
    } else {
      notesContainer.classList.add("hidden");
      document.getElementById("updateClientTransportNotes").value = "";
    }
  });
});

/* --------------------------
   Preview logic
---------------------------*/
function collectVisibleSectionsForPreview() {
  const rows = [];

  // Acknowledgment (Symbols)
  rows.push({
    label: 'Acknowledgment (Symbols 7/8/9)',
    value: symbolsAck && symbolsAck.checked ? 'Acknowledged' : '(not acknowledged)'
  });

  // Change types selected
  const changeTypes = Array.from(document.querySelectorAll('input[name="changeType"]'))
    .filter(cb => cb.checked).map(cb => cb.parentElement ? cb.parentElement.textContent.trim() : cb.value);
  rows.push({
    label: 'Change types selected',
    value: changeTypes.length ? changeTypes.join(', ') : '(none)'
  });

  // Add vehicles (read dynamic rows)
  if (!addVehicleSection.classList.contains('hidden')) {
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    if (vehicleRows.length) {
      vehicleRows.forEach((vr, i) => {
        const year = vr.querySelector('.veh-year')?.value?.trim() || '';
        const make = vr.querySelector('.veh-make')?.value?.trim() || '';
        const model = vr.querySelector('.veh-model')?.value?.trim() || '';
        const vin = vr.querySelector('.veh-vin')?.value?.trim() || '';
        const garaging = vr.querySelector('.veh-garaging')?.value?.trim() || '';
        const primaryUse = vr.querySelector('.veh-primary-use')?.value || '';
        const ownership = vr.querySelector('.veh-ownership')?.value || '';
        const lienholder = vr.querySelector('.veh-lienholder')?.value?.trim() || '';
        const estUsage = vr.querySelector('.veh-estimated-usage')?.value || '';
        const effdate = vr.querySelector('.veh-effdate')?.value || '';
        const clientNotes = vr.querySelector('.veh-client-transport-notes')?.value?.trim() || '';

        const label = `Vehicle ${i + 1}`;
        const value =
          `Year: ${year || '(n/a)'}; ` +
          `Make: ${make || '(n/a)'}; ` +
          `Model: ${model || '(n/a)'}; ` +
          `VIN: ${vin || '(n/a)'}; ` +
          `Garaging: ${garaging || '(n/a)'}; ` +
          `Primary use: ${primaryUse || '(n/a)'}; ` +
          `Ownership: ${ownership || '(n/a)'}; ` +
          `Lienholder: ${lienholder || '(n/a)'}; ` +
          `Estimated usage: ${estUsage || '(n/a)'}; ` +
          `Client notes: ${clientNotes || '(n/a)'}; ` +
          `Effective: ${effdate || '(n/a)'}`;

        rows.push({ label, value });
      });
    } else {
      rows.push({ label: 'Add vehicles', value: '(no vehicles added)' });
    }
  }

  // Remove vehicle
  if (!removeVehicleSection.classList.contains('hidden')) {
    const which = document.getElementById('remove_vehicle_id')?.value?.trim() || '';
    const rdate = document.getElementById('remove_effective_date')?.value || '';
    const reason = document.getElementById('removeReason')?.value || '';
    const reasonOther = document.getElementById('removeReasonOther')?.value?.trim() || '';

    rows.push({ label: 'Remove vehicle - which', value: which || '(not provided)' });
    rows.push({ label: 'Remove effective date', value: rdate || '(not provided)' });
    rows.push({ label: 'Remove reason', value: reason || '(not provided)' });
    if (reason === 'other' || reason === 'Other') {
      rows.push({ label: 'Remove reason - other', value: reasonOther || '(not provided)' });
    }
  }

  // Update vehicle
  if (!updateVehicleSection.classList.contains('hidden')) {
    const updateId = document.getElementById('updateVehicleId')?.value?.trim() || '';
    const updateTypeVal = document.getElementById('updateType')?.value || '';
    const updateTypeOtherVal = document.getElementById('updateTypeOther')?.value?.trim() || '';
    const updatedInfo = document.getElementById('updateDetails')?.value?.trim() || '';
    const updEffDate = document.getElementById('updateEffectiveDate')?.value || '';
    const transportRad = updateVehicleSection.querySelector('input[name="update_client_transport"]:checked');
    const transportVal = transportRad ? transportRad.value : '';
    const transportNotes = document.getElementById('updateClientTransportNotes')?.value?.trim() || '';

    rows.push({ label: 'Update vehicle - which', value: updateId || '(not provided)' });
    rows.push({ label: 'Update type', value: updateTypeVal || '(not provided)' });
    if (updateTypeVal === 'other_change' || updateTypeVal === 'Other') {
      rows.push({ label: 'Update type - other', value: updateTypeOtherVal || '(not provided)' });
    }
    rows.push({ label: 'Updated information', value: updatedInfo || '(not provided)' });
    rows.push({ label: 'Update effective date', value: updEffDate || '(not provided)' });
    rows.push({ label: 'Transport clients', value: transportVal || '(not provided)' });
    if (transportVal === 'yes' || transportVal === 'Yes') {
      rows.push({ label: 'Transport notes', value: transportNotes || '(not provided)' });
    }
  }

  // Other change
  if (!otherChangeSection.classList.contains('hidden')) {
    const otherDesc = document.getElementById('otherChangeDescription')?.value?.trim() || '';
    const otherEff = document.getElementById('otherChangeEffectiveDate')?.value || '';
    rows.push({ label: 'Other change description', value: otherDesc || '(not provided)' });
    rows.push({ label: 'Other change effective date', value: otherEff || '(not provided)' });
  }

  // Primary contact
  rows.push({ label: 'Contact name', value: contactName?.value?.trim() || '(not provided)' });
  rows.push({ label: 'Contact email', value: contactEmail?.value?.trim() || '(not provided)' });
  rows.push({ label: 'Contact phone', value: contactPhone?.value?.trim() || '(not provided)' });

  // Final confirmation
  rows.push({
    label: 'Final confirmation',
    value: finalConfirm && finalConfirm.checked ? 'Confirmed' : '(not confirmed)'
  });

  return rows;
}



function showPreviewModal() {
  const rows = collectVisibleSectionsForPreview();
  const html = rows.map(r => `
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(r.label)}</div>
      <div class="preview-value">${escapeHtml(r.value)}</div>
    </div>
  `).join('');
  previewBody.innerHTML = html;
  show(previewModal);
}

/* Preview triggers */
previewBtn.addEventListener('click', (ev)=>{
  ev.preventDefault();
  // minimal checks
  if(!symbolsAck.checked){
    if(!confirm('Acknowledgment is not checked. Show preview anyway?')) return;
  }
  if(!Array.from(document.querySelectorAll('input[name="changeType"]')).some(cb=>cb.checked)){
    if(!confirm('No change type selected. Show preview anyway?')) return;
  }
  showPreviewModal();
});
closePreview.addEventListener('click', ()=> hide(previewModal));
editBtn.addEventListener('click', ()=> hide(previewModal));

/* --------------------------
   Build payload & validation
---------------------------*/
function buildPayload() {
  const payload = {};

  // Acknowledgment + change types
  payload.symbolsAck = !!(symbolsAck && symbolsAck.checked);
  payload.changeTypes = Array.from(document.querySelectorAll('input[name="changeType"]'))
    .filter(cb => cb.checked).map(cb => cb.value);

  // Add vehicles
  payload.addVehicles = [];
  if (!addVehicleSection.classList.contains('hidden')) {
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    vehicleRows.forEach(vr => {
      payload.addVehicles.push({
        year: vr.querySelector('.veh-year')?.value?.trim() || '',
        make: vr.querySelector('.veh-make')?.value?.trim() || '',
        model: vr.querySelector('.veh-model')?.value?.trim() || '',
        vin: vr.querySelector('.veh-vin')?.value?.trim() || '',
        garaging: vr.querySelector('.veh-garaging')?.value?.trim() || '',
        primaryUse: vr.querySelector('.veh-primary-use')?.value || '',
        ownership: vr.querySelector('.veh-ownership')?.value || '',
        lienholder: vr.querySelector('.veh-lienholder')?.value?.trim() || '',
        estimatedUsage: vr.querySelector('.veh-estimated-usage')?.value || '',
        clientTransportNotes: vr.querySelector('.veh-client-transport-notes')?.value?.trim() || '',
        effectiveDate: vr.querySelector('.veh-effdate')?.value || '',
        documentName: vr.querySelector('.veh-doc')?.files?.[0]?.name || ''
      });
    });
  }

  // Remove vehicle
  if (!removeVehicleSection.classList.contains('hidden')) {
    payload.removeVehicle = {
      which: document.getElementById('remove_vehicle_id')?.value?.trim() || '',
      effectiveDate: document.getElementById('remove_effective_date')?.value || '',
      reason: document.getElementById('removeReason')?.value || '',
      reasonOther: document.getElementById('removeReasonOther')?.value?.trim() || '',
      supportingDocumentName: document.getElementById('remove_supporting_document')?.files?.[0]?.name || ''
    };
  }

  // Update vehicle
  if (!updateVehicleSection.classList.contains('hidden')) {
    const transportRad = updateVehicleSection.querySelector('input[name="update_client_transport"]:checked');
    payload.updateVehicle = {
      which: document.getElementById('updateVehicleId')?.value?.trim() || '',
      updateType: document.getElementById('updateType')?.value || '',
      updateTypeOther: document.getElementById('updateTypeOther')?.value?.trim() || '',
      updatedInformation: document.getElementById('updateDetails')?.value?.trim() || '',
      transportClients: transportRad ? transportRad.value : '',
      transportNotes: document.getElementById('updateClientTransportNotes')?.value?.trim() || '',
      effectiveDate: document.getElementById('updateEffectiveDate')?.value || '',
      supportingDocumentName: document.getElementById('updateSupportingDoc')?.files?.[0]?.name || ''
    };
  }

  // Other change
  if (!otherChangeSection.classList.contains('hidden')) {
    payload.otherChange = {
      description: document.getElementById('otherChangeDescription')?.value?.trim() || '',
      effectiveDate: document.getElementById('otherChangeEffectiveDate')?.value || '',
      supportingDocumentName: document.getElementById('otherChangeDocument')?.files?.[0]?.name || ''
    };
  }

  // Contact + final confirm + timestamp
  payload.contact = {
    name: contactName?.value?.trim() || '',
    email: contactEmail?.value?.trim() || '',
    phone: contactPhone?.value?.trim() || ''
  };

  payload.finalConfirm = !!(finalConfirm && finalConfirm.checked);
  payload.submittedAt = new Date().toISOString();

  return payload;
}



/* Minimal validation rules */
function validateForm(){
  // symbols ack
  if(!symbolsAck.checked){ alert('Please acknowledge the symbols statement.'); return false; }

  // change type
  if(!Array.from(document.querySelectorAll('input[name="changeType"]')).some(cb=>cb.checked)){
    alert('Please select at least one change type.'); return false;
  }

  // primary contact
  if(!contactName.value.trim()){ alert('Please enter contact name.'); return false; }
  if(!contactEmail.value.trim()){ alert('Please enter contact email.'); return false; }
  if(!contactPhone.value.trim()){ alert('Please enter contact phone.'); return false; }

  // if add selected, ensure at least one vehicle with required fields
  if(!addVehicleSection.classList.contains('hidden')){
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    if(vehicleRows.length === 0){ alert('Please add at least one vehicle or uncheck Add a vehicle.'); return false; }
    for(const vr of vehicleRows){
      const year = vr.querySelector('.veh-year').value.trim();
      const make = vr.querySelector('.veh-make').value.trim();
      const model = vr.querySelector('.veh-model').value.trim();
      const vin = vr.querySelector('.veh-vin').value.trim();
      const garaging = vr.querySelector('.veh-garaging').value.trim();
      const eff = vr.querySelector('.veh-effdate').value;
      if(!year || !make || !model || !vin || !garaging || !eff){
        alert('Please fill required fields for each vehicle: Year, Make, Model, VIN, Garaging, Effective date.');
        return false;
      }
    }
  }

  // if remove selected, which and date required
  if(!removeVehicleSection.classList.contains('hidden')){
    if(!document.getElementById('removeWhich').value.trim()){ alert('Please indicate which vehicle to remove.'); return false; }
    if(!document.getElementById('removeDate').value){ alert('Please provide effective date for removal.'); return false; }
  }

  // if update selected, correction type and updated info required
  if(!updateVehicleSection.classList.contains('hidden')){
    if(!document.getElementById('correctionType').value){ alert('Please select a correction type.'); return false; }
    if(!document.getElementById('updatedInfo').value.trim()){ alert('Please provide the updated information.'); return false; }
  }

  // final confirmation
  if(!finalConfirm.checked){ alert('Please confirm the information provided.'); return false; }

  return true;
}

/* Submit flows */
autoForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  if(!validateForm()) return;

  const payload = buildPayload();

  // if no endpoint, show JSON in statusMsg
  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
    statusMsg.setAttribute('aria-hidden','false');
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
    return;
  }

  // otherwise post
  (async ()=>{
    try {
      const res = await fetch(endpointURL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('Server error');
      statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
      statusMsg.classList.remove('hidden');
    } catch(err){
      statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
      statusMsg.classList.remove('hidden');
    }
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
  })();
});

/* Confirm submit from preview modal */
confirmSubmitBtn.addEventListener('click', async ()=>{
  hide(previewModal);
  if(!validateForm()) return;
  const payload = buildPayload();

  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
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
  } catch(err){
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
    statusMsg.classList.remove('hidden');
  }
});

/* Initialize */
evaluateChangeTypeSections();