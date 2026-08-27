document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
    });
  });

  initCalculator();
});

/* ===== Appliance Energy Cost Calculator ===== */
function initCalculator() {
  const form = document.getElementById("calculator-form");
  if (!form) {
    return; // calculator is only present on the Home page
  }

  const applianceSelect = document.getElementById("appliance-select");
  const wattsInput = document.getElementById("watts-input");
  const hoursInput = document.getElementById("hours-input");
  const priceInput = document.getElementById("price-input");
  const resultsPanel = document.getElementById("calculator-results");

  const errorEls = {
    watts: document.getElementById("watts-error"),
    hours: document.getElementById("hours-error"),
    price: document.getElementById("price-error"),
  };

  applianceSelect.addEventListener("change", () => {
    const selectedOption = applianceSelect.options[applianceSelect.selectedIndex];
    const presetWatts = selectedOption.getAttribute("data-watts");
    if (presetWatts) {
      wattsInput.value = presetWatts;
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleCalculate();
  });

  function clearFieldErrors() {
    Object.values(errorEls).forEach((el) => {
      el.textContent = "";
    });
  }

  function validateInputs() {
    const watts = parseFloat(wattsInput.value);
    const hours = parseFloat(hoursInput.value);
    const price = parseFloat(priceInput.value);
    let isValid = true;

    clearFieldErrors();

    if (!wattsInput.value || isNaN(watts) || watts <= 0 || watts > 10000) {
      errorEls.watts.textContent = "Enter a wattage between 1 and 10000.";
      isValid = false;
    }

    if (!hoursInput.value || isNaN(hours) || hours < 0 || hours > 24) {
      errorEls.hours.textContent = "Enter hours per day between 0 and 24.";
      isValid = false;
    }

    if (!priceInput.value || isNaN(price) || price < 0 || price > 200) {
      errorEls.price.textContent = "Enter a price between 0 and 200 cents/kWh.";
      isValid = false;
    }

    return { isValid, watts, hours, price };
  }

  function calculateEnergyUsage(watts, hoursPerDay, priceCentsPerKwh) {
    const dailyKwh = (watts * hoursPerDay) / 1000;
    const monthlyKwh = dailyKwh * 30;
    const yearlyKwh = dailyKwh * 365;

    const pricePerKwh = priceCentsPerKwh / 100;
    const dailyCost = dailyKwh * pricePerKwh;
    const monthlyCost = monthlyKwh * pricePerKwh;
    const yearlyCost = yearlyKwh * pricePerKwh;

    return { dailyKwh, monthlyKwh, yearlyKwh, dailyCost, monthlyCost, yearlyCost };
  }

  function renderResults(results) {
    resultsPanel.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Estimated Energy Use & Cost";
    resultsPanel.appendChild(heading);

    const rows = [
      ["Daily energy use", `${results.dailyKwh.toFixed(2)} kWh`],
      ["Monthly energy use", `${results.monthlyKwh.toFixed(2)} kWh`],
      ["Yearly energy use", `${results.yearlyKwh.toFixed(2)} kWh`],
      ["Daily cost", `$${results.dailyCost.toFixed(2)}`],
      ["Monthly cost", `$${results.monthlyCost.toFixed(2)}`],
      ["Yearly cost", `$${results.yearlyCost.toFixed(2)}`],
    ];

    const list = document.createElement("dl");
    list.className = "result-list";

    rows.forEach(([label, value]) => {
      const dt = document.createElement("dt");
      dt.className = "result-label";
      dt.textContent = label;

      const dd = document.createElement("dd");
      dd.className = "result-value";
      dd.textContent = value;

      list.appendChild(dt);
      list.appendChild(dd);
    });

    resultsPanel.appendChild(list);
  }

  function renderInvalidState() {
    resultsPanel.innerHTML = "";
    const message = document.createElement("p");
    message.className = "calculator-error";
    message.textContent = "Please fix the highlighted fields above and calculate again.";
    resultsPanel.appendChild(message);
  }

  function handleCalculate() {
    const { isValid, watts, hours, price } = validateInputs();

    if (!isValid) {
      renderInvalidState();
      return;
    }

    const results = calculateEnergyUsage(watts, hours, price);
    renderResults(results);
  }
}
