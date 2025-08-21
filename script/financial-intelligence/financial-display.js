import { budgetEntries } from "http://127.0.0.1:8080/script/globals.js";
import { attachEventListeners } from "http://127.0.0.1:8080/script/financial-intelligence/attacheventlisteners.js";
import { getFinancials } from "http://127.0.0.1:8080/script/financial-intelligence/update-financials.js";


// Cache DOM elements
const chartButtons = {
    tnwBtn: document.getElementById("tnw-btn"),
    incomeBtn: document.getElementById("income-btn"),
    expenseBtn: document.getElementById("expense-btn")
};

// ✅ Extract Budget Data
function getBudgetData() {
    console.log("getBudgetData function called");

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCategories = {};
    let expenseCategories = {};

    if (!budgetEntries || budgetEntries.length === 0) {
        return {
            totalIncome: 0,
            totalExpenses: 0,
            incomeCategories: { "No Data": 1 },
            expenseCategories: { "No Data": 1 }
        };
    }

    budgetEntries.forEach(entry => {
        if (entry.type === "Income") {
            totalIncome += entry.amount;
            incomeCategories[entry.category] = (incomeCategories[entry.category] || 0) + entry.amount;
        } else {
            totalExpenses += entry.amount;
            expenseCategories[entry.category] = (expenseCategories[entry.category] || 0) + entry.amount;
        }
    });

    return { totalIncome, totalExpenses, incomeCategories, expenseCategories };
}

// ✅ Generate X-Axis Labels (Time Intervals)
export function generateXTicks(view) {
    console.log("generateXTicks function called");

    let now = new Date();
    let xTicks = [];

    const timeIntervals = {
        "biweekly": 12 * 60 * 60 * 1000,  // 12 hours
        "monthly": 24 * 60 * 60 * 1000,   // 1 day
        "bimonthly": 2 * 24 * 60 * 60 * 1000, // 2 days
        "quarterly": 3 * 24 * 60 * 60 * 1000, // 3 days
        "semi-annually": 7 * 24 * 60 * 60 * 1000, // 1 week
        "annually": 14 * 24 * 60 * 60 * 1000 // 2 weeks
    };

    let interval = timeIntervals[view] || timeIntervals["bimonthly"]; // Default to bimonthly

    for (let i = 0; i < 24; i++) {
        let day = new Date(now.getTime() + i * interval);
        xTicks.push(`${day.getDate()}/${day.getMonth() + 1}`);
    }

    return xTicks;
}

// ✅ Generate TNW Data for Chart (Handles Income, Expenses, and Inflows)
export function generateTNWData(view) {
    console.log("generateTNWData function called");

    let { fixedCapital } = getFinancials();
    let transactions = [...budgetEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    let tnwData = [0];  // ✅ TNW starts at 0, we build it dynamically
    let dateLabels = [0];
    let cumulativeTNW = fixedCapital;  // ✅ Start tracking TNW from zero

    transactions.forEach(entry => {
        let amountChange = entry.amount;
        let sign = entry.type === "Income" ? "+" : entry.type === "Inflow" ? "↑" : "-";

        // ✅ Correct calculation: Only track net changes
        if (entry.type === "Income" || entry.type === "Inflow") {
            cumulativeTNW += amountChange;  // ✅ Income & Inflow ADD to TNW
        } else {
            cumulativeTNW -= amountChange;  // ✅ Expenses SUBTRACT from TNW
        }

        tnwData.push(cumulativeTNW);  // ✅ Store updated TNW
        dateLabels.push(`${sign}(${entry.date}, $${amountChange.toFixed(2)})`);
    });

    console.log("✅ Final TNW Data for Chart:", tnwData);
    return { tnwData, dateLabels };
}

// ✅ Chart Variables
let tnwChart = null;
let incomeChart = null;
let expenseChart = null;

// ✅ Initialize Charts
export function initializeCharts() {
    console.log("initializeCharts function called");

    try {
        // ✅ Destroy Existing Charts (Fix Canvas Overlap)
        if (tnwChart) tnwChart.destroy();
        if (incomeChart) incomeChart.destroy();
        if (expenseChart) expenseChart.destroy();

        let tnwCtx = document.getElementById("tnwChart")?.getContext("2d");
        let incomeCtx = document.getElementById("incomeChart")?.getContext("2d");
        let expenseCtx = document.getElementById("expenseChart")?.getContext("2d");

        if (!tnwCtx || !incomeCtx || !expenseCtx) {
            console.error("Chart canvases not found in DOM.");
            return;
        }

        let { tnwData, dateLabels } = generateTNWData("bimonthly");

        // ✅ Create TNW Chart
        tnwChart = new Chart(tnwCtx, {
            type: "line",
            data: {
                labels: dateLabels,
                datasets: [{
                    label: "Total Net Worth",
                    data: tnwData,
                    borderColor: "#00FF41",
                    backgroundColor: "rgba(0, 255, 0, 0.05)",
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: "#00FF41",
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

        let { incomeCategories, expenseCategories } = getBudgetData();

        // ✅ Create Income Pie Chart
        incomeChart = new Chart(incomeCtx, {
            type: "pie",
            data: {
                labels: Object.keys(incomeCategories),
                datasets: [{
                    data: Object.values(incomeCategories),
                    backgroundColor: [
                        "#DC3545", "#17A2B8", "#007BFF", "#28A745", "#FFC107", "#6C757D", "#6610F2", 
                        "#E83E8C", "#FD7E14", "#20C997", "#343A40", "#FF5733", "#33FF57", "#3357FF", 
                        "#FF33A1", "#A133FF", "#33FFF5", "#F5FF33", "#8D33FF", "#FF8D33", "#33FF8D", 
                        "#FF3333", "#3333FF", "#FF8D8D", "#8DFF8D", "#8D8DFF", "#A1FF33", "#FF33E8", 
                        "#E8FF33", "#33E8FF", "#FF5733", "#5733FF", "#33FF57", "#FF33A1", "#A133FF", 
                        "#33FFF5", "#F5FF33", "#8D33FF", "#FF8D33", "#33FF8D", "#FF3333", "#3333FF", 
                        "#FF8D8D", "#8DFF8D", "#8D8DFF", "#A1FF33", "#FF33E8", "#E8FF33", "#33E8FF", 
                        "#1F75FE", "#FF69B4", "#FFD700", "#40E0D0", "#D2691E", "#00FA9A", "#B22222", 
                        "#FF4500", "#6A5ACD", "#4682B4", "#9ACD32", "#32CD32", "#BDB76B", "#ADFF2F"
                    ]                
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "white" } } }
            }
        });

        // ✅ Create Expense Pie Chart
        expenseChart = new Chart(expenseCtx, {
            type: "pie",
            data: {
                labels: Object.keys(expenseCategories),
                datasets: [{
                    data: Object.values(expenseCategories),
                    backgroundColor: [
                        "#DC3545", "#17A2B8", "#007BFF", "#28A745", "#FFC107", "#6C757D", "#6610F2", 
                        "#E83E8C", "#FD7E14", "#20C997", "#343A40", "#FF5733", "#33FF57", "#3357FF", 
                        "#FF33A1", "#A133FF", "#33FFF5", "#F5FF33", "#8D33FF", "#FF8D33", "#33FF8D", 
                        "#FF3333", "#3333FF", "#FF8D8D", "#8DFF8D", "#8D8DFF", "#A1FF33", "#FF33E8", 
                        "#E8FF33", "#33E8FF", "#FF5733", "#5733FF", "#33FF57", "#FF33A1", "#A133FF", 
                        "#33FFF5", "#F5FF33", "#8D33FF", "#FF8D33", "#33FF8D", "#FF3333", "#3333FF", 
                        "#FF8D8D", "#8DFF8D", "#8D8DFF", "#A1FF33", "#FF33E8", "#E8FF33", "#33E8FF", 
                        "#1F75FE", "#FF69B4", "#FFD700", "#40E0D0", "#D2691E", "#00FA9A", "#B22222", 
                        "#FF4500", "#6A5ACD", "#4682B4", "#9ACD32", "#32CD32", "#BDB76B", "#ADFF2F"
                    ]                
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "white" } } }
            }
        });

    } catch (error) {
        console.error("Error initializing charts:", error);
    }
}

// ✅ Handle Graph Selection
export function showGraph(graphId) {
    console.log("showGraph function called");

    const containers = ["tnw-container", "income-container", "expense-container"];
    containers.forEach(id => {
        document.getElementById(id)?.classList.toggle("hidden", id !== graphId);
    });
}

// ✅ Initialize Event Listeners
function initializeChartEventListeners() {
    if (chartButtons.tnwBtn) {
        chartButtons.tnwBtn.addEventListener("click", () => showGraph("tnw-container"));
    }
    if (chartButtons.incomeBtn) {
        chartButtons.incomeBtn.addEventListener("click", () => showGraph("income-container"));
    }
    if (chartButtons.expenseBtn) {
        chartButtons.expenseBtn.addEventListener("click", () => showGraph("expense-container"));
    }
}

// ✅ Load Charts When Page Loads
document.addEventListener("DOMContentLoaded", function () {
    initializeCharts();
    initializeChartEventListeners();
});
