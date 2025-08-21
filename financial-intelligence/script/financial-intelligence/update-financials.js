import { 
    budgetEntries, 
    expenseEntries, 
    existingFHSA, 
    existingRRSP,
    getNumBiweeklyPeriodsDefault 
} from "http://127.0.0.1:8080/script/globals.js";

// ✅ Get Last Friday for Biweekly Periods
export function getLastFriday() {
    let today = new Date();
    let dayOfWeek = today.getDay();
    let daysToLastFriday = (dayOfWeek >= 5) ? dayOfWeek - 5 : 7 - (5 - dayOfWeek);
    let lastFriday = new Date(today);
    lastFriday.setDate(today.getDate() - daysToLastFriday);
    return lastFriday;
}

// ✅ Function to Calculate Financial Indicators
export function calculateFinancials() {
    console.log("📊 Running Financial Calculations...");

    let fixedCapital = 2818.66;
    let totalIncome = 0;
    let totalInflows = 0;
    let totalExpenses = 0;
    let totalNeeds = 0;
    let totalWants = 0;
    let incomeAmount = 0;
    let needsTransactions = 0;
    let wantsTransactions = 0;

    // ✅ Determine Default Biweekly Periods
    let numBiweeklyPeriods = getNumBiweeklyPeriodsDefault();
    console.log(`📆 Default Biweekly Periods Counted: ${numBiweeklyPeriods}`);

    // ✅ Fixed Base Income

    // ✅ Process Budget Entries
    budgetEntries.forEach(entry => {
        if (entry.type === "Income") {
            totalIncome += entry.amount;
            incomeAmount++;
        } else if (entry.type === "Needs") {
            totalNeeds += entry.amount;
            needsTransactions++;
        } else if (entry.type === "Wants") {
            totalWants += entry.amount;
            wantsTransactions++;
        } else if (entry.type === "Inflow") {
            totalInflows += entry.amount;
        }
    });

    // ✅ Total Income & Biweekly Income Calculation
    let avgBiweeklyIncome = (totalIncome / incomeAmount);

    console.log(`💰 Total Income: $${totalIncome.toFixed(2)}`);

    // ✅ Total Expenses Calculation
    totalExpenses = totalNeeds + totalWants;
    console.log(`📉 Total Expenses: $${totalExpenses.toFixed(2)}`);

    // ✅ Total Net Worth Calculation (Rolling Over Time)
    let TNW = fixedCapital + (totalIncome + totalInflows) - totalExpenses;

    // ✅ Investment Allocations (Dynamic Accumulation)
    let FHSA = (avgBiweeklyIncome * 0.3 ) + existingFHSA;
    let RRSP = (avgBiweeklyIncome * 0.2 ) + existingRRSP;
    let emergencyFunds = avgBiweeklyIncome * 0.1;
    let TFSA = avgBiweeklyIncome * 0.1;

    // ✅ Average Spending Calculation
    let avgNeedsSpending = needsTransactions > 0 ? totalNeeds / needsTransactions : 0;
    let avgWantsSpending = wantsTransactions > 0 ? totalWants / wantsTransactions : 0;    

    // ✅ Disposable Income Calculation
    let disposableIncome = totalIncome - ((FHSA - existingFHSA) + (RRSP - existingRRSP) + emergencyFunds + TFSA) - avgNeedsSpending - avgWantsSpending;

    // ✅ Needs Expenses Status
    let needsExpensesStatus = "Pending";
        if (totalNeeds <= 0.2 * TNW) {
            needsExpensesStatus = "Sustainable ✅";
            document.getElementById('needs-expenses-status').style.color = 'lightgreen';
        } else if (totalNeeds >= 0.2 * TNW && totalNeeds < 0.3 * TNW) {
            needsExpensesStatus = "Breakeven ⚠";
            document.getElementById('needs-expenses-status').style.color = 'yellow';
        } else if (totalNeeds >= 0.3 * TNW) {
            needsExpensesStatus = "Shutdown 🔴";
            document.getElementById('needs-expenses-status').style.color = 'red';
        }
    
    // ✅ Wants Expenses Status
    let wantsExpensesStatus = "Pending";
        if (totalWants <= 0.1 * TNW) {
            wantsExpensesStatus = "Sustainable ✅";
            document.getElementById('wants-expenses-status').style.color = 'lightgreen';
        } else if (totalWants >= 0.1 * TNW && totalWants < 0.2 * TNW) {
            wantsExpensesStatus = "Breakeven ⚠";
            document.getElementById('wants-expenses-status').style.color = 'yellow';
        } else if (totalWants >= 0.2 * TNW) {
            wantsExpensesStatus = "Shutdown 🔴";
            document.getElementById('wants-expenses-status').style.color = 'red';
        }
    

    // ✅ Update UI Dynamically
    document.getElementById("tnw").textContent = `$${TNW.toFixed(2)}`;
    document.getElementById("avg-biweekly-income").textContent = `$${avgBiweeklyIncome.toFixed(2)}`;
    document.getElementById("fhsa").textContent = `$${FHSA.toFixed(2)}`;
    document.getElementById("rrsp").textContent = `$${RRSP.toFixed(2)}`;
    document.getElementById("emergency-funds").textContent = `$${emergencyFunds.toFixed(2)}`;
    document.getElementById("tfsa-investments").textContent = `$${TFSA.toFixed(2)}`;
    document.getElementById("financial-inflows").textContent = `$${totalInflows.toFixed(2)}`;
    document.getElementById("total-needs-spending").textContent = `$${totalNeeds.toFixed(2)}`;
    document.getElementById("total-wants-spending").textContent = `$${totalWants.toFixed(2)}`;
    document.getElementById("disposable-income").textContent = `$${disposableIncome.toFixed(2)}`;
    document.getElementById('needs-expenses-status').textContent = needsExpensesStatus;
    document.getElementById('wants-expenses-status').textContent = wantsExpensesStatus;

    console.log("✅ Financial Calculations Complete.");
}

// ✅ Function to Get Financial Data (Returns an Object)
export function getFinancials() {
    console.log("🔍 Fetching Financial Data...");

    let fixedCapital = 2818.66;
    let totalIncome = 0;
    let totalInflows = 0;
    let totalExpenses = 0;
    let totalNeeds = 0;
    let totalWants = 0;
    let incomeAmount = 0;
    let needsTransactions = 0;
    let wantsTransactions = 0;

    // ✅ Determine Default Biweekly Periods
    let numBiweeklyPeriods = getNumBiweeklyPeriodsDefault();
    console.log(`📆 Default Biweekly Periods Counted: ${numBiweeklyPeriods}`);

    // ✅ Fixed Base Income

    // ✅ Process Budget Entries
    budgetEntries.forEach(entry => {
        if (entry.type === "Income") {
            totalIncome += entry.amount;
            incomeAmount++;
        } else if (entry.type === "Needs") {
            totalNeeds += entry.amount;
            needsTransactions++;
        } else if (entry.type === "Wants") {
            totalWants += entry.amount;
            wantsTransactions++;
        } else if (entry.type === "Inflow") {
            totalInflows += entry.amount;
        }
    });

    // ✅ Total Income & Biweekly Income Calculation
    let avgBiweeklyIncome = (totalIncome / incomeAmount);

    console.log(`💰 Total Income: $${totalIncome.toFixed(2)}`);

    // ✅ Total Expenses Calculation
    totalExpenses = totalNeeds + totalWants;
    console.log(`📉 Total Expenses: $${totalExpenses.toFixed(2)}`);

    // ✅ Total Net Worth Calculation (Rolling Over Time)
    let TNW = fixedCapital + (totalIncome + totalInflows) - totalExpenses;

    // ✅ Investment Allocations (Dynamic Accumulation)
    let FHSA = (avgBiweeklyIncome * 0.3 ) + existingFHSA;
    let RRSP = (avgBiweeklyIncome * 0.2 ) + existingRRSP;
    let emergencyFunds = avgBiweeklyIncome * 0.1;
    let TFSA = avgBiweeklyIncome * 0.1;

    // ✅ Average Spending Calculation
    let avgNeedsSpending = needsTransactions > 0 ? totalNeeds / needsTransactions : 0;
    let avgWantsSpending = wantsTransactions > 0 ? totalWants / wantsTransactions : 0;    

    // ✅ Disposable Income Calculation
    let disposableIncome = totalIncome - ((FHSA - existingFHSA) + (RRSP - existingRRSP) + emergencyFunds + TFSA) - avgNeedsSpending - avgWantsSpending;

    // ✅ Needs Expenses Status
    let needsExpensesStatus = "Pending";
        if (totalNeeds <= 0.2 * TNW) {
            needsExpensesStatus = "Sustainable ✅";
            document.getElementById('needs-expenses-status').style.color = 'lightgreen';
        } else if (totalNeeds >= 0.2 * TNW && totalNeeds < 0.3 * TNW) {
            needsExpensesStatus = "Breakeven ⚠";
            document.getElementById('needs-expenses-status').style.color = 'yellow';
        } else if (totalNeeds >= 0.3 * TNW) {
            needsExpensesStatus = "Shutdown 🔴";
            document.getElementById('needs-expenses-status').style.color = 'red';
        }
    
    // ✅ Wants Expenses Status
    let wantsExpensesStatus = "Pending";
        if (totalWants <= 0.1 * TNW) {
            wantsExpensesStatus = "Sustainable ✅";
            document.getElementById('wants-expenses-status').style.color = 'lightgreen';
        } else if (totalWants >= 0.1 * TNW && totalWants < 0.2 * TNW) {
            wantsExpensesStatus = "Breakeven ⚠";
            document.getElementById('wants-expenses-status').style.color = 'yellow';
        } else if (totalWants >= 0.2 * TNW) {
            wantsExpensesStatus = "Shutdown 🔴";
            document.getElementById('wants-expenses-status').style.color = 'red';
        }
    
    return {
        TNW, 
        totalIncome,
        totalExpenses,
        totalNeeds,
        totalWants,
        fixedCapital,
        avgBiweeklyIncome,
        FHSA,
        RRSP,
        emergencyFunds,
        TFSA,
        avgNeedsSpending,
        avgWantsSpending,
        disposableIncome,
        numBiweeklyPeriods,
        needsExpensesStatus,
        wantsExpensesStatus
    };
}

// ✅ Run Calculation on Page Load
document.addEventListener("DOMContentLoaded", calculateFinancials);