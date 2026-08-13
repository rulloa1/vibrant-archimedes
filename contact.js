(() => {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const steps = [...form.querySelectorAll(".fstep")];
  const indicators = [...document.querySelectorAll("#steps .st")];
  const nextButton = document.getElementById("nextBtn");
  const backButton = document.getElementById("backBtn");
  const submitButton = document.getElementById("submitBtn");
  const actions = document.getElementById("actions");
  const success = document.getElementById("success");
  const recap = document.getElementById("recap");
  const chips = [...document.querySelectorAll("#typeChips .chip")];
  let currentStep = 0;

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => step.classList.toggle("on", stepIndex === currentStep));
    indicators.forEach((indicator, indicatorIndex) => {
      indicator.classList.toggle("active", indicatorIndex === currentStep);
      indicator.classList.toggle("done", indicatorIndex < currentStep);
    });
    backButton.style.display = currentStep ? "inline-flex" : "none";
    nextButton.style.display = currentStep === steps.length - 1 ? "none" : "inline-flex";
    submitButton.style.display = currentStep === steps.length - 1 ? "inline-flex" : "none";
  };

  const setFieldError = (field, hasError) => {
    const wrapper = field.closest(".field") || field.parentElement;
    if (wrapper) wrapper.classList.toggle("err", hasError);
  };

  const validateStep = (stepIndex) => {
    let valid = true;
    const step = steps[stepIndex];
    step.querySelectorAll("[data-required]").forEach((field) => {
      const value = field.value.trim();
      const requiresEmail = field.hasAttribute("data-email");
      const requiresPhone = field.hasAttribute("data-phone");
      const validEmail = !requiresEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const validPhone = !requiresPhone || value.replace(/\D/g, "").length >= 10;
      const hasError = !value || !validEmail || !validPhone;
      setFieldError(field, hasError);
      if (hasError) valid = false;
    });

    const chipGroup = step.querySelector("[data-required-chips]");
    if (chipGroup) {
      const hasSelection = chipGroup.querySelector(".chip.active");
      const wrapper = chipGroup.closest(".field");
      if (wrapper) wrapper.classList.toggle("err", !hasSelection);
      if (!hasSelection) valid = false;
    }
    return valid;
  };

  chips.forEach((chip) => {
    chip.setAttribute("role", "checkbox");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-checked", "false");
    const toggle = () => {
      const selected = chip.classList.toggle("active");
      chip.setAttribute("aria-checked", String(selected));
      const wrapper = chip.closest(".field");
      if (selected && wrapper) wrapper.classList.remove("err");
    };
    chip.addEventListener("click", toggle);
    chip.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });

  nextButton.addEventListener("click", () => {
    if (validateStep(currentStep)) setStep(currentStep + 1);
  });

  backButton.addEventListener("click", () => setStep(currentStep - 1));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(currentStep)) return;

    const data = new FormData(form);
    const services = chips.filter((chip) => chip.classList.contains("active")).map((chip) => chip.dataset.val);
    const details = [
      `Name: ${data.get("name") || "Not provided"}`,
      `Company: ${data.get("company") || "Not provided"}`,
      `Email: ${data.get("email") || "Not provided"}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Services: ${services.join(", ") || "Not provided"}`,
      `County: ${data.get("county") || "Not provided"}`,
      `Approx. size: ${data.get("size") || "Not provided"}`,
      `Budget: ${data.get("budget") || "Not provided"}`,
      `Timeline: ${data.get("timeline") || "Not provided"}`,
      `Project details: ${data.get("details") || "Not provided"}`,
    ].join("\n");

    const subject = `Bid request — ${data.get("name") || "New project inquiry"}`;
    window.location.href = `mailto:bids@dunriteconstruct.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;

    recap.textContent = `${services.join(", ") || "Project"} in ${data.get("county") || "your area"} · ${data.get("budget") || "budget to be confirmed"}`;
    success.querySelector("h3").textContent = "Bid Request Ready";
    success.querySelector("p").textContent = "Your email app should open with the completed bid request. Review and send it to reach a DunRite estimator.";
    form.style.display = "none";
    actions.style.display = "none";
    success.classList.add("on");
  });

  setStep(0);
})();
