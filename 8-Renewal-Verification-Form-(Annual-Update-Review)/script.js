const form = document.getElementById("renewalForm");
const steps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".step");

const nextStep1 = document.getElementById("nextStep1");
const nextStep2 = document.getElementById("nextStep2");
const backStep2 = document.getElementById("backStep2");
const backStep3 = document.getElementById("backStep3");

const statusMsg = document.getElementById("statusMsg");

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

/* ================== CONDITIONAL YES/NO ================== */
function bindConditional(radioName, textareaId){
  document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
    r.addEventListener("change", () => {
      const ta = document.getElementById(textareaId);
      if (r.value === "yes") {
        ta.classList.remove("hidden");
        ta.required = true;
      } else {
        ta.classList.add("hidden");
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
        field.focus();
        alert("Please confirm before continuing.");
        return false;
      }
    } else {
      if (!field.value.trim()) {
        field.focus();
        alert("Please complete all required fields.");
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

/* ================== SUBMIT ================== */
form.addEventListener("submit", e => {
  e.preventDefault();

  if (!validateStep(3)) return;

  statusMsg.innerHTML = "<strong>Renewal Verification submitted successfully (demo mode).</strong>";
  statusMsg.classList.remove("hidden");
  window.scrollTo({ top: statusMsg.offsetTop - 40, behavior: "smooth" });
});

/* ================== INIT (LOCK STEPS) ================== */
goToStep(1); // ✅ Kunci agar selalu mulai dari Step 1