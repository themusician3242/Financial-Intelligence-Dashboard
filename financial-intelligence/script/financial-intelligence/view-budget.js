import { budgetEntries } from "http://127.0.0.1:8080/script/globals.js";

// Cache DOM elements
const budgetPopup = document.getElementById("budget-popup");
const addPopup = document.getElementById("add-popup");
const editPopup = document.getElementById("edit-popup");
const confirmPopupEdit = document.getElementById("confirm-popup-edit");
const confirmPopupDelete = document.getElementById("confirm-popup-delete");

// Initialize mutable variables
let selectedBudgetId = null;
let currentBudgetEntry = null;

// Input fields for add/edit forms
const inputFields = {
    typeAdd: document.getElementById("budget-type-add"),
    amountAdd: document.getElementById("budget-amount-add"),
    categoryAdd: document.getElementById("budget-category-add"),
    dateAdd: document.getElementById("budget-date-add"),
    notesAdd: document.getElementById("budget-notes-add"),
    typeEdit: document.getElementById("budget-type-edit"),
    amountEdit: document.getElementById("budget-amount-edit"),
    categoryEdit: document.getElementById("budget-category-edit"),
    dateEdit: document.getElementById("budget-date-edit"),
    notesEdit: document.getElementById("budget-notes-edit"),
    idInputEdit: document.getElementById("budget-id-input-edit"),
    idInputDelete: document.getElementById("budget-id-input-delete")
};

// Buttons
const buttons = {
    viewBudget: document.getElementById("view-budget"),
    addBudget: document.getElementById("add-budget"),
    editBudget: document.getElementById("edit-budget"),
    deleteBudget: document.getElementById("delete-budget"),
    saveBudgetAdd: document.getElementById("save-budget-add"),
    saveBudgetEdit: document.getElementById("save-budget-edit"),
    cancelAdd: document.getElementById("cancel-add"),
    cancelEdit: document.getElementById("cancel-edit"),
    confirmEdit: document.getElementById("confirm-edit"),
    confirmDelete: document.getElementById("confirm-delete"),
    closePopup: document.getElementById("close-popup"),
    closePopupEdit: document.getElementById("close-popup-edit"),
    closePopupDelete: document.getElementById("close-popup-delete")
};

// Event listener management
const eventListeners = new Map();

function updateEventListener(element, event, handler) {
    // Remove existing listener if any
    if (eventListeners.has(element)) {
        element.removeEventListener(event, eventListeners.get(element));
    }
    
    // Add new listener and store it
    element.addEventListener(event, handler);
    eventListeners.set(element, handler);
}

// Show/Hide Popup Functions
function showPopup(popup) {
    if (popup) popup.style.display = "block";
}

function hidePopup(popup) {
    if (popup) popup.style.display = "none";
}

// Load Budget Data
export function loadBudgetData() {
    const budgetTable = document.querySelector("#budget-table tbody");
    if (!budgetTable) {
        console.error("Budget table body not found");
        return;
    }

    budgetTable.innerHTML = "";

    if (!Array.isArray(budgetEntries) || budgetEntries.length === 0) {
        console.log("No budget entries to display");
        return;
    }

    budgetEntries.forEach(entry => {
        if (!entry || !entry.amount || !entry.category || !entry.date) {
            console.warn("Invalid budget entry:", entry);
            return;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.type}</td>
            <td>$${parseFloat(entry.amount).toFixed(2)}</td>
            <td>${entry.category}</td>
            <td>${entry.date}</td>
            <td>${entry.notes || "N/A"}</td>
        `;
        budgetTable.appendChild(row);
    });
}

// Add New Budget Entry
export function addNewBudgetEntry() {
    const type = inputFields.typeAdd.value;
    const amount = parseFloat(inputFields.amountAdd.value);
    const category = inputFields.categoryAdd.value.trim();
    const date = inputFields.dateAdd.value;
    const notes = inputFields.notesAdd.value.trim();

    if (!type || isNaN(amount) || amount <= 0 || !category || !date) {
        alert("Please fill in all required fields with valid values.");
        return;
    }

    const newEntry = {
        id: budgetEntries.length + 1,
        type,
        amount,
        category,
        date,
        notes
    };

    budgetEntries.push(newEntry);
    localStorage.setItem("budgetEntries", JSON.stringify(budgetEntries));
    loadBudgetData();
}

// Edit Budget Entry
export function editBudgetEntry() {
    const id = parseInt(inputFields.idInputEdit.value);
    const entry = budgetEntries.find(item => item.id === id);

    if (!entry) {
        alert("No budget entry selected for editing."); // ✅ Shows only ONCE
        return false; // ✅ Stops further execution
    }

    inputFields.typeEdit.value = entry.type;
    inputFields.amountEdit.value = entry.amount;
    inputFields.categoryEdit.value = entry.category;
    inputFields.dateEdit.value = entry.date;
    inputFields.notesEdit.value = entry.notes;

    return true; // ✅ Indicates success

}


// Update Budget Entry
export function updateBudgetEntry() {
    const id = parseInt(inputFields.idInputEdit.value);
    let entryIndex = budgetEntries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
        alert("Error: Entry not found.");
        return;
    }

    budgetEntries[entryIndex] = {
        id,
        type: inputFields.typeEdit.value.trim(),
        amount: parseFloat(inputFields.amountEdit.value),
        category: inputFields.categoryEdit.value.trim(),
        date: inputFields.dateEdit.value.trim(),
        notes: inputFields.notesEdit.value.trim()
    };

    localStorage.setItem("budgetEntries", JSON.stringify(budgetEntries));
    loadBudgetData(); // ✅ Updates UI instantly
}


// Delete Budget Entry
export function deleteBudgetEntry() {
    const id = parseInt(inputFields.idInputDelete.value);
    const index = budgetEntries.findIndex(item => item.id === id);
    
    if (index === -1) {
        alert("Invalid ID. No matching entry found.");
        return; // ✅ Stops execution immediately (PREVENTS MULTIPLE ALERTS)
    }

    budgetEntries.splice(index, 1);
    
    // ✅ Renumber remaining entries
    budgetEntries.forEach((entry, i) => entry.id = i + 1);

    // ✅ Save & Refresh
    localStorage.setItem("budgetEntries", JSON.stringify(budgetEntries));
    loadBudgetData();
}

// Load saved budget entries from localStorage
function loadSavedBudgetEntries() {
    const savedEntries = localStorage.getItem("budgetEntries");
    if (savedEntries) {
        try {
            const parsed = JSON.parse(savedEntries);
            if (Array.isArray(parsed)) {
                budgetEntries.length = 0; // Clear existing entries
                budgetEntries.push(...parsed);
            }
        } catch (error) {
            console.error("Error loading saved budget entries:", error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    loadSavedBudgetEntries();
    loadBudgetData();
});


