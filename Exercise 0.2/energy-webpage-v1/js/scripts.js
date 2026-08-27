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

  function buildResultGroup(groupTitle, items) {
    const group = document.createElement("div");
    group.className = "result-group";

    const groupHeading = document.createElement("h4");
    groupHeading.className = "result-group-title";
    groupHeading.textContent = groupTitle;
    group.appendChild(groupHeading);

    const grid = document.createElement("div");
    grid.className = "result-grid";

    items.forEach(([label, value]) => {
      const card = document.createElement("div");
      card.className = "result-card";

      const labelEl = document.createElement("span");
      labelEl.className = "result-label";
      labelEl.textContent = label;

      const valueEl = document.createElement("span");
      valueEl.className = "result-value";
      valueEl.textContent = value;

      card.appendChild(labelEl);
      card.appendChild(valueEl);
      grid.appendChild(card);
    });

    group.appendChild(grid);
    return group;
  }

  function renderResults(results) {
    resultsPanel.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Estimated Energy Use & Cost";
    resultsPanel.appendChild(heading);

    resultsPanel.appendChild(
      buildResultGroup("Energy Consumption", [
        ["Daily", `${results.dailyKwh.toFixed(2)} kWh`],
        ["Monthly", `${results.monthlyKwh.toFixed(2)} kWh`],
        ["Yearly", `${results.yearlyKwh.toFixed(2)} kWh`],
      ])
    );

    resultsPanel.appendChild(
      buildResultGroup("Estimated Cost", [
        ["Daily", `$${results.dailyCost.toFixed(2)}`],
        ["Monthly", `$${results.monthlyCost.toFixed(2)}`],
        ["Yearly", `$${results.yearlyCost.toFixed(2)}`],
      ])
    );
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
