import { 
    expenseEntries, 
    saveExpenseToLocalStorage, 
    loadExpenseFromLocalStorage 
} from "http://127.0.0.1:8080/script/globals.js";

import { 
    inputFieldsExpenses
} from "http://127.0.0.1:8080/script/financial-intelligence/attacheventlisteners.js";

// Load expenses from localStorage on initialization
loadExpenseFromLocalStorage();

export function updateExpenseEntries(newEntries) {
    expenseEntries.length = 0; // ✅ Clears array without breaking `const`
    expenseEntries.push(...newEntries); // ✅ Updates array without reassigning
    localStorage.setItem("expenseEntries", JSON.stringify(expenseEntries));
}

function loadExpenses() {
    if (!inputFieldsExpenses.expenseTableBody) {
        console.error("Budget table body not found");
        return;
    }

    inputFieldsExpenses.expenseTableBody.innerHTML = ""; 

    // ✅ Filter out invalid entries
    let validEntries = expenseEntries.filter(entry =>
        entry &&
        entry.amount !== null &&
        !isNaN(entry.amount) &&
        entry.category.trim() !== "" &&
        entry.date.trim() !== ""
    );

    console.log("Valid Entries:", validEntries); // 🔥 Debugging step

    if (validEntries.length === 0) {
        console.warn("No valid expense entries to display.");
    }

    console.log("Budget Entries Loaded:", expenseEntries);

    console.log("Table Before Adding Rows:", inputFieldsExpenses.expenseTableBody.innerHTML);

    // ✅ Display valid entries
    validEntries.forEach(entry => {
        console.log("Creating Row for Entry:", entry);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.type}</td>
            <td>$${parseFloat(entry.amount).toFixed(2)}</td>
            <td>${entry.category || "N/A"}</td>
            <td>${entry.date || "N/A"}</td>
            <td>${entry.notes || "N/A"}</td>
            <td>${entry.recurring}</td>
        `;

    console.log("Appending Row:", row.innerHTML);
    inputFieldsExpenses.expenseTableBody.appendChild(row);
    
    saveExpenseToLocalStorage();
});
}

// ✅ Add New Budget Entry
export function addNewExpenseEntry() {
    let type = inputFieldsExpenses.typeAdd.value.trim();
    let amount = parseFloat(inputFieldsExpenses.amountAdd.value);
    let category = inputFieldsExpenses.categoryAdd.value.trim();
    let date = inputFieldsExpenses.dateAdd.value.trim();
    let notes = inputFieldsExpenses.notesAdd.value.trim();
    let recurring = inputFieldsExpenses.recurringAdd.value.trim(); // ✅ Store as "Yes" or "No"

    // ✅ Debugging logs
    console.log("Type:", type);
    console.log("Amount:", amount);
    console.log("Category:", category);
    console.log("Date:", date);
    console.log("Notes:", notes);
    console.log("Recurring:", recurring);

    // ✅ Ensure valid input
    if (!type || isNaN(amount) || amount <= 0 || !category || !date) {
        alert("Please enter valid expense details.");
        return;
    }

    let newEntry = {
        id: expenseEntries.length + 1,
        type,
        amount,
        category,
        date,
        notes,
        recurring // ✅ Now included in the object
    };

    expenseEntries.push(newEntry);
    saveExpenseToLocalStorage();
    loadExpenses();
}

export function updateExpenseEntry() {
    const id = parseInt(inputFieldsExpenses.idInputEdit.value); // Get ID from Edit Form
    let entryIndex = expenseEntries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
        alert("Error: Entry not found.");
        return;
    }

    // ✅ Update entry with new values from the Edit form
    expenseEntries[entryIndex] = {
        id,
        type: inputFieldsExpenses.typeEdit.value.trim(),
        amount: parseFloat(inputFieldsExpenses.amountEdit.value),
        category: inputFieldsExpenses.categoryEdit.value.trim(),
        date: inputFieldsExpenses.dateEdit.value.trim(),
        notes: inputFieldsExpenses.notesEdit.value.trim(),
        recurring:inputFieldsExpenses.recurringEdit.value.trim()
    };

    // ✅ Save the updated data to localStorage
    loadExpenses(); // Refresh the UI

    console.log(`Entry Updated:`, expenseEntries[entryIndex]);
}

// ✅ Edit Budget Entry
export function editExpenseEntry() {
    const id = parseInt(inputFieldsExpenses.idInputEdit.value);
    const entry = expenseEntries.find(item => item.id === id);
    
    if (entry) {
        inputFieldsExpenses.popupTitleEdit.textContent = "Edit Expense Item";
        inputFieldsExpenses.typeEdit.value = entry.type;
        inputFieldsExpenses.amountEdit.value = entry.amount;
        inputFieldsExpenses.categoryEdit.value = entry.category;
        inputFieldsExpenses.dateEdit.value = entry.date;
        inputFieldsExpenses.notesEdit.value = entry.notes;
        inputFieldsExpenses.recurringEdit.value = entry.recurring;
    } else {
        alert("Invalid ID. No matching entry found.");
    }
}

// ✅ Delete Expense Entry
export function deleteExpenseEntry() {
    const id = parseInt(inputFieldsExpenses.idInputDelete.value);
    const index = expenseEntries.findIndex(item => item.id === id);
    if (index !== -1) {
        expenseEntries.splice(index, 1); // Removes the entry without reassigning
    }    
    // Renumber IDs
    expenseEntries.forEach((item, index) => item.id = index + 1);
    saveExpenseToLocalStorage();
    loadExpenses(); // Use loadExpenses instead of loadBudgetData
}

updateExpenseEntries(expenseEntries.filter(entry => 
    entry.amount !== null && entry.category !== "" && entry.date !== ""
));

localStorage.setItem("expenseEntries", JSON.stringify(expenseEntries));

// ✅ Initialize Once on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    // Remove any existing event listeners first
    if (window.expenseEventListenersInitialized) {
        return; // Prevent multiple initializations
    }
    window.expenseEventListenersInitialized = true;
    loadExpenses();
});