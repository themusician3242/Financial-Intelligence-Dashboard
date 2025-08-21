import { 
    forecastElements,
    expenseEntries,
} from "http://127.0.0.1:8080/script/globals.js";
import {
    getFinancials,
    getLastFriday, 
} from "http://127.0.0.1:8080/script/financial-intelligence/update-financials.js";

import {showPopup, hidePopup} from "http://127.0.0.1:8080/script/financial-intelligence/attacheventlisteners.js";
import {generateTNWData} from "http://127.0.0.1:8080/script/financial-intelligence/financial-display.js";


// ✅ Forecast Data Storage
export let forecastExpenses = [];
let forecastedTNW = null;

// ✅ Cache Forecast Popups & Buttons
const forecastPopup = document.getElementById("perform-forecast");

// ✅ Initialize Forecast Elements
function initializeForecastElements() {
    forecastElements.tnw = document.getElementById("forecast-tnw");
    forecastElements.abi = document.getElementById("forecast-abi");
    forecastElements.ans = document.getElementById("forecast-ans");
    forecastElements.aws = document.getElementById("forecast-aws");
    forecastElements.prds = document.getElementById("forecast-prds");
    forecastElements.status = document.getElementById("forecast-status");
    forecastElements.startDate = document.getElementById("forecast-start-date");
    forecastElements.endDate = document.getElementById("forecast-end-date");
}

// ✅ Open Forecast Popup & Initialize Data
export function openForecastPopup() {
    console.log("📊 Opening Forecast Popup...");
    if (!forecastPopup) {
        console.error("Forecast popup element not found!");
        return;
    }
    forecastPopup.classList.add('active');
    initializeForecastChart();
    updateForecastSummary();
}

// ✅ Initialize TNW Forecast Chart
let forecastChart = null;

function initializeForecastChart() {
    console.log("📊 Initializing Forecast Chart...");
    const forecastCanvas = document.getElementById("forecastChart");
    if (!forecastCanvas) {
        console.error("⚠️ Forecast Chart canvas not found!");
        return;
    }
    
    let forecastCtx = forecastCanvas.getContext("2d");

    if (forecastChart) {
        forecastChart.destroy();
    }

    let { tnwData, dateLabels } = generateTNWData("bimonthly");

    forecastChart = new Chart(forecastCtx, {
        type: "line",
        data: {
            labels: dateLabels,
            datasets: [{
                label: "TNW Forecast",
                data: tnwData,
                borderColor: "#00BFFF",
                backgroundColor: "rgba(0, 191, 255, 0.2)",
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: "#00BFFF",
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } }
            },
            plugins: { legend: { labels: { color: "white" } } }
        }
    });
}

// ✅ Show Forecast Income Form
export function showForecastIncomeForm() {
    console.log("💰 Opening Forecast Income Form...");
    const incomePopup = document.getElementById("forecast-income-popup");
    if (!incomePopup) {
        console.error("Forecast income popup not found!");
        return;
    }
    showPopup(document.getElementById('forecast-income-popup'));
}

// ✅ Get Next Valid Forecast Date (If Not Provided)
function getValidForecastDate(userInputDate) {
    let today = new Date();
    let forecastDate = userInputDate ? new Date(userInputDate) : new Date(today); 

    if (!userInputDate) {
        forecastDate.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
    }

    while (forecastDate.getDay() !== 5) {
        forecastDate.setDate(forecastDate.getDate() + 1);
    }

    console.log(`📅 Adjusted Forecast Date: ${forecastDate.toDateString()}`);
    return forecastDate;
}

// ✅ Calculate Biweekly Periods for Forecasting
function getNumBiweeklyPeriodsForecast(forecastDate) {
    if (!forecastDate) {
        console.error("No forecast date provided to getNumBiweeklyPeriodsForecast");
        return 1;
    }

    let referenceStartDate = getLastFriday();
    referenceStartDate.setHours(0, 0, 0, 0);
    forecastDate.setHours(0, 0, 0, 0);

    // Calculate days between reference date and forecast date
    const daysDifference = Math.round((forecastDate - referenceStartDate) / (24 * 60 * 60 * 1000));
    
    // For forecasting, we want to count the exact number of complete biweekly periods
    const numBiweeklyPeriodsForecast = Math.max(1, Math.ceil(daysDifference / 14));

    console.log(`📆 Forecast Biweekly Periods:
        - Reference Start Date: ${referenceStartDate.toDateString()}
        - Forecast Date: ${forecastDate.toDateString()}
        - Days Until Forecast: ${daysDifference}
        - Forecast Periods: ${numBiweeklyPeriodsForecast}
    `);

    return numBiweeklyPeriodsForecast;
}

// ✅ Process Forecast Income Data for Biweekly Growth
function processForecastIncome() {
    console.log("🔄 Processing Forecast Income...");

    const dateInput = document.getElementById("forecast-date");
    const useExistingABI = document.getElementById("use-existing-abi")?.checked || false;
    let forecastDate = getValidForecastDate(dateInput.value);

    let { totalIncome, numBiweeklyPeriods } = getFinancials();
    
    let forecastDates = [];
    let forecastAmounts = [];

    // ✅ Validate Inputs
    if (!forecastDate) {
        console.warn("⚠️ Invalid forecast income parameters:", { forecastDate });
        return { forecastDates: [], forecastAmounts: [] };
    }

    try {
        // ✅ Get reference dates
        let lastFriday = getLastFriday();
        let targetDate = new Date(forecastDate);

        // ✅ Format initial start date
        let currentDate = new Date(lastFriday);
        let formattedStartDate = currentDate.toISOString().split('T')[0];

        // ✅ Get initial TNW
        let { TNW: initialTNW } = getFinancials();

        // ✅ Use forecast-specific period calculation
        let numBiweeklyPeriodsForecast = getNumBiweeklyPeriodsForecast(targetDate);
        let newIncome = parseFloat(document.getElementById("forecast-income-amount")?.value) || 0;

        // ✅ Calculate total income per biweekly period
        let selectedTotalIncome = useExistingABI 
            ? totalIncome 
            : (newIncome / numBiweeklyPeriods) * numBiweeklyPeriodsForecast;    

        let biweeklyIncome = selectedTotalIncome / numBiweeklyPeriodsForecast;

        // ✅ Generate TNW for each Biweekly Period
        let runningTNW = initialTNW;
        forecastDates.push(formattedStartDate);
        forecastAmounts.push(runningTNW);

        for (let i = 1; i <= numBiweeklyPeriodsForecast; i++) {
            currentDate.setDate(currentDate.getDate() + 14); // Move forward by 14 days
            let formattedDate = currentDate.toISOString().split('T')[0];

            runningTNW += biweeklyIncome; // Add biweekly income
            forecastDates.push(formattedDate);
            forecastAmounts.push(runningTNW);
        }

        console.log("✅ Processed Forecast Income Data:", {
            initialTNW,
            numBiweeklyPeriodsForecast,
            biweeklyIncome,
            forecastDates,
            forecastAmounts
        });

        return { 
            forecastDates, 
            forecastAmounts
        };
    } catch (error) {
        console.error("⚠️ Error processing forecast income:", error);
        return { forecastDates: [], forecastAmounts: [] };
    }
}

// ✅ Process Forecast Expenses & Ensure Data is Always Returned
function processForecastExpenses() {
    console.log("🔄 Processing Forecast Expenses...");

    let forecastDates = [];
    let forecastAmounts = [];
    let totalNeeds = 0;
    let totalWants = 0;
    let totalExpenses = 0;
    let cumulativeTNW = [];

    // Get initial TNW
    let { TNW } = getFinancials();
    let currentTNW = TNW;

    // ✅ Validate expense entries
    if (!expenseEntries || !Array.isArray(expenseEntries)) {
        console.warn("⚠️ No valid expense entries found");
        return { 
            forecastDates: [], 
            forecastAmounts: [], 
            totalNeeds: 0, 
            totalWants: 0, 
            totalExpenses: 0,
            cumulativeTNW: []
        };
    }

    // Sort entries by date first
    const sortedEntries = [...expenseEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEntries.forEach(expense => {
        if (!expense.date || !expense.amount || !expense.type) {
            console.warn("⚠️ Invalid expense entry:", expense);
            return;
        }

        let expenseDate = new Date(expense.date);
        let amount = parseFloat(expense.amount);

        if (isNaN(amount) || isNaN(expenseDate.getTime())) {
            console.warn("⚠️ Invalid expense data:", { date: expense.date, amount: expense.amount });
            return;
        }

        // Format date as YYYY-MM-DD for chart
        let formattedDate = expenseDate.toISOString().split('T')[0];
        
        // Update TNW for this expense
        currentTNW = currentTNW - amount;
        
        // ✅ Add to forecast arrays
        forecastDates.push(formattedDate);
        forecastAmounts.push(-amount); // Negative to indicate expense deductions
        cumulativeTNW.push(currentTNW);

        // ✅ Calculate totals based on expense type
        if (expense.type === "Needs") {
            totalNeeds += amount;
        } else if (expense.type === "Wants") {
            totalWants += amount;
        }
        totalExpenses += amount;
    });

    console.log("✅ Processed Forecast Data:", { 
        dates: forecastDates,
        amounts: forecastAmounts,
        cumulativeTNW,
        entryCount: forecastDates.length,
        totalNeeds,
        totalWants,
        totalExpenses
    });

    return { 
        forecastDates, 
        forecastAmounts, 
        totalNeeds, 
        totalWants, 
        totalExpenses,
        cumulativeTNW
    };
}

// ✅ Get Financial Data for Forecasting
function getForecastFinancials(forecastDate = null) {
    console.log("🔄 Fetching Financial Data for Forecast...");

    let { TNW, avgBiweeklyIncome, avgNeedsSpending, avgWantsSpending, totalNeeds, totalWants } = getFinancials();

    // Use forecast-specific period calculation
    let numBiweeklyPeriodsForecast = forecastDate ? getNumBiweeklyPeriodsForecast(forecastDate) : 1;

    console.log(`📆 Forecast Periods Counted: ${numBiweeklyPeriodsForecast}`);

    return { TNW, avgBiweeklyIncome, avgNeedsSpending, avgWantsSpending, numBiweeklyPeriodsForecast, totalNeeds, totalWants };
}

// ✅ Get Recurrence Factor (Days Between Recurring Expenses)
function getRecurrenceFactor(type) {
    switch (type) {
        case "Weekly": return 7;
        case "Biweekly": return 14;
        case "Monthly": return 30;
        case "Annually": return 365;
        default: return 0;
    }
}

// ✅ Update Forecast Chart with Biweekly Forecasting
function updateForecastChart() {
    console.log("📊 Updating Forecast Chart...");

    // ✅ Generate Base TNW Data & Labels
    let { tnwData, dateLabels } = generateTNWData("bimonthly");
    
    // ✅ Get Expense & Income Forecast Data
    let { forecastDates: expenseDates, cumulativeTNW: expenseTNW } = processForecastExpenses();
    let { forecastDates: incomeDates, forecastAmounts: incomeTNW } = processForecastIncome();

    console.log("🟢 Initial TNW Data:", tnwData);
    console.log("📅 Expense Dates:", expenseDates);
    console.log("💰 Expense TNW:", expenseTNW);
    console.log("📅 Income Dates:", incomeDates);
    console.log("💰 Income TNW:", incomeTNW);

    // ✅ Create a mapping of TNW values to their corresponding dates
    let tnwMap = new Map();

    // ✅ Apply Expense Forecast TNW Updates
    if (expenseDates && expenseTNW && expenseDates.length > 0) {
        expenseDates.forEach((date, index) => {
            console.log(`🔻 Mapping Expense TNW: ${date} -> ${expenseTNW[index]}`);
            tnwMap.set(date, expenseTNW[index]);
        });
    }

    // ✅ Apply Income Forecast TNW Updates (overwrites if date already exists)
    if (incomeDates && incomeTNW && incomeDates.length > 0) {
        incomeDates.forEach((date, index) => {
            console.log(`🔺 Mapping Income TNW: ${date} -> ${incomeTNW[index]}`);
            tnwMap.set(date, incomeTNW[index]);  // Overwrites with latest income forecast
        });
    }

    // ✅ Merge and Sort All Dates Chronologically
    let allDates = [...new Set([...dateLabels, ...expenseDates, ...incomeDates])]
        .filter(date => date)  // Remove undefined/null dates
        .sort((a, b) => new Date(a) - new Date(b));

    // ✅ Generate Updated TNW Data (Aligning with Sorted Dates)
    let updatedTNWData = allDates.map(date => {
        if (tnwMap.has(date)) {
            return tnwMap.get(date);
        }
        let labelIndex = dateLabels.indexOf(date);
        return labelIndex !== -1 ? tnwData[labelIndex] : null;
    });

    console.log("🔵 Final Updated Dates:", allDates);
    console.log("🔵 Final Updated TNW Data:", updatedTNWData);

    // ✅ Update Chart
    forecastChart.data.labels = allDates;
    forecastChart.data.datasets[0].data = updatedTNWData;
    forecastChart.update();

    console.log("✅ Forecast Chart Updated Successfully!");
}

// ✅ Calculate Final TNW with Income and Expense Adjustments
function calculateFinalTNW(TNWincome = 0, TNWexpense = 0) {
    console.log("🧮 Calculating Final TNW...");

    let { TNW: baseTNW } = getFinancials();

    // ✅ Ensure we always start from base TNW on first calculation
    if (forecastedTNW === null) {
        forecastedTNW = baseTNW;
    }

    console.log("📊 TNW Calculation Components BEFORE:", {
        baseTNW,
        TNWincome,
        TNWexpense,
        forecastedTNW
    });

    // ✅ Adjust TNW based on income and expenses
    forecastedTNW += TNWincome;
    forecastedTNW -= TNWexpense;

    console.log("✅ Final TNW AFTER Adjustments:", forecastedTNW);
    return forecastedTNW;
}


// ✅ Update Forecast Summary UI
function updateForecastSummary(reset = false) { // Add reset flag
    console.log("📈 Updating Forecast Summary...");

    let { avgBiweeklyIncome, totalNeeds, totalWants, numBiweeklyPeriodsForecast } = getFinancials() || {};

    // ✅ Reset TNW to its original value when needed
    if (reset) {
        forecastedTNW = getFinancials().TNW;
    }

    // ✅ Use forecasted TNW if available, otherwise fallback to base TNW
    let TNW = forecastedTNW !== null ? forecastedTNW : getFinancials().TNW;

    let lastFriday = getLastFriday();
    let formattedLastFriday = lastFriday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    let totalCosts = totalNeeds + totalWants;
    let status = avgBiweeklyIncome > totalCosts 
        ? "Sustainable Profit ✅" 
        : avgBiweeklyIncome >= totalCosts 
        ? "Breakeven ⚠" 
        : "Shutdown 🔴";

    console.log("🔍 Forecast Summary Values:", {
        TNW,
        avgBiweeklyIncome,
        totalNeeds,
        totalWants,
        numBiweeklyPeriodsForecast,
        status
    });

    requestAnimationFrame(() => {
        forecastElements.tnw.textContent = `$${TNW.toFixed(2)}`;
        forecastElements.abi.textContent = `$${avgBiweeklyIncome.toFixed(2)}`;
        forecastElements.ans.textContent = `$${totalNeeds.toFixed(2)}`;
        forecastElements.aws.textContent = `$${totalWants.toFixed(2)}`;
        forecastElements.prds.textContent = numBiweeklyPeriodsForecast;
        forecastElements.status.textContent = status;
        forecastElements.startDate.textContent = formattedLastFriday;
    });

    console.log("✅ Forecast Summary Updated!");
}

// ✅ Confirm Income Forecast & Update UI
export function confirmForecastIncome() {
    console.log("✅ Confirming Forecast Income...");

    const useExistingABI = document.getElementById("use-existing-abi")?.checked || false;
    const subtractANS = document.getElementById("subtract-ans")?.checked || false;
    const subtractAWS = document.getElementById("subtract-aws")?.checked || false;
    const incomeInput = document.getElementById("forecast-income-amount");
    const dateInput = document.getElementById("forecast-date");

    if (!incomeInput || !dateInput) {
        console.error("⚠️ Required input elements not found!");
        return;
    }

    if (!dateInput.value) {
        alert("⚠️ Please enter a valid forecast date.");
        return;
    }

    let forecastDate = getValidForecastDate(dateInput.value);
    if (!forecastDate) {
        alert("⚠️ Invalid forecast date provided.");
        return;
    }

    // Get exact values from main interface
    let { avgBiweeklyIncome, avgNeedsSpending, avgWantsSpending } = getFinancials();
    let numBiweeklyPeriodsForecast = getNumBiweeklyPeriodsForecast(forecastDate);
    
    // Calculate new income
    let newIncome = parseFloat(incomeInput.value) || 0;
    let newBiweeklyIncome = useExistingABI ? avgBiweeklyIncome : newIncome;
    
    // Calculate new TNW with income adjustments
    let TNWincome = newBiweeklyIncome * numBiweeklyPeriodsForecast;
    
    // Apply deductions if selected
    if (subtractANS) TNWincome -= avgNeedsSpending;
    if (subtractAWS) TNWincome -= avgWantsSpending;

    // Calculate final TNW using the new function
    let finalTNW = calculateFinalTNW(TNWincome, 0);

    // Update chart and UI
    updateForecastChart();
    updateForecastFromIncome(finalTNW, newBiweeklyIncome, numBiweeklyPeriodsForecast);

    hidePopup(document.getElementById('forecast-income-popup'));
}

// ✅ Confirm Forecast Expenses
export function confirmForecastExpenses() {
    console.log("✅ Confirming Forecast Expenses...");

    let { totalNeeds, totalWants, totalExpenses } = processForecastExpenses();

    // Calculate final TNW using the new function
    let finalTNW = calculateFinalTNW(0, totalExpenses);

    // Update UI with new values
    updateForecastAfterExpense(finalTNW, totalNeeds, totalWants);
    
    // Update chart
    updateForecastChart();

    hidePopup(document.getElementById('forecast-expense-popup'));
}

// ✅ Update Forecast from Income Confirmation
function updateForecastFromIncome(newTNW, newBiweeklyIncome, numBiweeklyPeriodsForecast) {
    console.log("🔄 Updating Forecast UI Directly from Confirmed Income...");

    let { avgNeedsSpending, avgWantsSpending } = getForecastFinancials();

    let lastFriday = getLastFriday(); // Get Date Object
    let formattedLastFriday = lastFriday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    const dateInput = document.getElementById("forecast-date");

    let forecastDate = getValidForecastDate(dateInput.value);
    let formattedForecastDate = forecastDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    let totalAvgCosts = avgNeedsSpending + avgWantsSpending;
    let status = newBiweeklyIncome > totalAvgCosts 
        ? "Sustainable Profit ✅" 
        : newBiweeklyIncome >= avgNeedsSpending 
        ? "Breakeven ⚠" 
        : "Shutdown 🔴";

    requestAnimationFrame(() => {
        forecastElements.tnw.textContent = `$${newTNW.toFixed(2)}`;
        forecastElements.prds.textContent = numBiweeklyPeriodsForecast;
        forecastElements.abi.textContent = `$${newBiweeklyIncome.toFixed(2)}`;
        forecastElements.status.textContent = status;
        forecastElements.startDate.textContent = formattedLastFriday;
        forecastElements.endDate.textContent = formattedForecastDate;
    });
}

// ✅ Update Forecast After Expense
function updateForecastAfterExpense(newTNW, totalNeeds, totalWants) {
    console.log("🔄 Updating Forecast UI After Expense...");

    // Get updated financial data
    let { avgBiweeklyIncome } = getForecastFinancials();
    
    // ✅ Ensure cumulative expenses are being considered
    let totalAvgCosts = totalNeeds + totalWants;

    // ✅ Determine Financial Status
    let status = avgBiweeklyIncome > totalAvgCosts 
        ? "Sustainable Profit ✅" 
        : avgBiweeklyIncome >= totalNeeds
        ? "Breakeven ⚠" 
        : "Shutdown 🔴";

    // ✅ Update UI Elements
    requestAnimationFrame(() => {
        forecastElements.tnw.textContent = `$${newTNW.toFixed(2)}`;
        forecastElements.ans.textContent = `$${totalNeeds.toFixed(2)}`;
        forecastElements.aws.textContent = `$${totalWants.toFixed(2)}`;
        forecastElements.status.textContent = status;
    });

    // ✅ Debugging Logs
    console.log("✅ Forecast UI Updated After Expense!", {
        TNWexpense: newTNW,
        BiweeklyIncome: avgBiweeklyIncome,
        NeedsSpending: totalNeeds,
        WantsSpending: totalWants,
        Status: status
    });
}

// ✅ Reset Forecast to Default Values
export function resetForecast() {
    console.log("🔄 Resetting Forecast to Default Values...");
    forecastedTNW = null; // Clear previous forecast TNW
    updateForecastSummary();
    initializeForecastChart();
}

// ✅ Initialize Event Listeners on Page Load
document.addEventListener("DOMContentLoaded", function () {
    console.log("🌍 Document Loaded - Initializing Forecast System...");
    initializeForecastElements();
});