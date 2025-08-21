import { openForecastPopup, resetForecast, showForecastIncomeForm, confirmForecastIncome, confirmForecastExpenses } from "http://127.0.0.1:8080/script/financial-intelligence/perform-budget-forecast.js";
import { addNewBudgetEntry, updateBudgetEntry, editBudgetEntry, loadBudgetData, deleteBudgetEntry } from "http://127.0.0.1:8080/script/financial-intelligence/view-budget.js";
import { initializeCharts, showGraph } from "http://127.0.0.1:8080/script/financial-intelligence/financial-display.js";
import { calculateFinancials } from "http://127.0.0.1:8080/script/financial-intelligence/update-financials.js";
import { deleteExpenseEntry, editExpenseEntry, updateExpenseEntry, addNewExpenseEntry} from "http://127.0.0.1:8080/script/financial-intelligence/expense-database.js";


const popups = {
    add: document.getElementById("add-popup"),
    edit: document.getElementById('edit-popup'), // new
    confirmEdit: document.getElementById("confirm-popup-edit"),
    confirmDelete: document.getElementById("confirm-popup-delete"),
    budgetPopup: document.getElementById("budget-popup"),
    pullFinancials: document.getElementById('pull-financials-popup'),
    forecast: document.getElementById("perform-forecast"),
    forecastIncome: document.getElementById('forecast-income-popup'),
    forecastExpense: document.getElementById("forecast-expense-popup"),
    forecastConfirmExpenseAdd: document.getElementById("forecast-confirm-expense-add"),
    forecastConfirmExpenseEdit: document.getElementById("forecast-confirm-expense-edit"),
    confirmExpenseIdEdit: document.getElementById("confirm-expense-id-edit"),
    confirmExpenseIdDelete: document.getElementById("confirm-expense-id-delete"),
};

const buttons = {
    addBudget: document.getElementById("add-budget"),
    editBudget: document.getElementById("edit-budget"),
    deleteBudget: document.getElementById("delete-budget"),

    saveBudgetAdd: document.getElementById("save-budget-add"),
    saveBudgetEdit: document.getElementById("save-budget-edit"),

    cancelAdd: document.getElementById("cancel-add"),
    cancelEdit: document.getElementById("cancel-edit"),

    confirmEdit: popups.confirmEdit.querySelector("#confirm-edit"),
    confirmDelete: popups.confirmDelete.querySelector("#confirm-delete"),

    viewBudget: document.getElementById("view-budget"),

    pullFinancials: document.getElementById('pull-budget-financials'),
    closePullFinancials: document.getElementById('close-pull-financials'),

    closePopup: document.getElementById("close-popup"),
    closePopupEdit: document.getElementById("close-popup-edit"),
    closePopupDelete: document.getElementById("close-popup-delete"),

    openForecast: document.getElementById('open-forecast'),
    resetForecast: document.getElementById('reset-forecast'),
    closeForecast: document.getElementById('close-forecast'),

    forecastIncomeBtn: document.getElementById('forecast-income-btn'),
    confirmIncomeBtn: document.getElementById("confirm-income"),
    closeIncomeBtn: document.getElementById("close-income"),

    forecastExpenseBtn: document.getElementById("forecast-expense-btn"),
    closeExpenseBtn: document.getElementById("close-expense"),

    addExpense: document.getElementById('add-forecast-expense'),
    editExpense: document.getElementById('edit-forecast-expense'),
    deleteExpense: document.getElementById('delete-forecast-expense'),

    confirmExpense: document.getElementById('confirm-expense'),

    saveExpenseAdd: document.getElementById("save-expense-add"),
    saveExpenseEdit: document.getElementById("save-expense-edit"),

    cancelExpenseAdd: document.getElementById("cancel-expense-add"),
    cancelExpenseEdit: document.getElementById("cancel-expense-edit"),

    confirmExpenseEditButton: document.getElementById("confirm-expense-edit-button"),
    confirmExpenseDeleteButton: document.getElementById("confirm-expense-delete-button"),

    closePopupExpenseEditButton: document.getElementById("close-popup-expense-edit-button"),
    closePopupExpenseDeleteButton: document.getElementById("close-popup-expense-delete-button"),
};

// 📌 Input Fields
export const inputFields = {
    idInputEdit: popups.confirmEdit.querySelector("#budget-id-input-edit"),
    idInputDelete: popups.confirmDelete.querySelector("#budget-id-input-delete"),

    // ADD
    typeAdd: document.getElementById("budget-type-add"),
    amountAdd: document.getElementById("budget-amount-add"),
    categoryAdd: document.getElementById("budget-category-add"),
    dateAdd: document.getElementById("budget-date-add"),
    notesAdd: document.getElementById("budget-notes-add"),
    popupTitleAdd: document.getElementById("popup-title-add"),

    // EDIT
    typeEdit: document.getElementById("budget-type-edit"),
    amountEdit: document.getElementById("budget-amount-edit"),
    categoryEdit: document.getElementById("budget-category-edit"),
    dateEdit: document.getElementById("budget-date-edit"),
    notesEdit: document.getElementById("budget-notes-edit"),
    popupTitleEdit: document.getElementById("popup-title-edit"),

    budgetTableBody: document.querySelector("#budget-table tbody"),
    expenseTableBody: document.querySelector('#forecast-expense-table tbody')
};

export const inputFieldsExpenses = {
    idInputEdit: popups.confirmExpenseIdEdit.querySelector("#expense-id-input-edit"),
    idInputDelete: popups.confirmExpenseIdDelete.querySelector("#expense-id-input-delete"),

    // ADD
    typeAdd: document.getElementById("expense-type-add"),
    amountAdd: document.getElementById("expense-amount-add"),
    categoryAdd: document.getElementById("expense-category-add"),
    dateAdd: document.getElementById("expense-date-add"),
    notesAdd: document.getElementById("expense-notes-add"),
    recurringAdd: document.getElementById("expense-recurring-add"), // Added recurring checkbox
    popupTitleAdd: document.getElementById("popup-title-expense-add"),

    // EDIT
    typeEdit: document.getElementById("expense-type-edit"),
    amountEdit: document.getElementById("expense-amount-edit"),
    categoryEdit: document.getElementById("expense-category-edit"),
    dateEdit: document.getElementById("expense-date-edit"),
    notesEdit: document.getElementById("expense-notes-edit"),
    recurringEdit: document.getElementById("expense-recurring-edit"), // Added recurring checkbox
    popupTitleEdit: document.getElementById("popup-title-expense-edit"),

    expenseTableBody: document.querySelector("#forecast-expense-table tbody"),
};

export function updateEventListener(element, event, handler) {
    if (element) {
        element.replaceWith(element.cloneNode(true)); // ✅ Removes ALL previous listeners
        element = document.getElementById(element.id); // ✅ Re-fetch the new node
        element.addEventListener(event, handler);
    }
}

// ✅ Show & Hide Popups
export function showPopup(popup) {
    popup.classList.add("active");
}

export function hidePopup(popup) {
    popup.classList.remove("active");
}

// ✅ Attach Event Listeners
export function attachEventListeners() {
    console.log("Attaching event listeners");

    // ✅ Budget Event Listeners
    updateEventListener(buttons.viewBudget, "click", () => {
        loadBudgetData();
        showPopup(popups.budgetPopup);
    });

    // Add Budget
    updateEventListener(buttons.addBudget, "click", () => {
        showPopup(popups.add);
    });
    updateEventListener(buttons.saveBudgetAdd, "click", () => {
        addNewBudgetEntry();
        hidePopup(popups.add);
    });
    updateEventListener(buttons.cancelAdd, "click", () => {
        hidePopup(popups.add);
    });

    // Edit Budget
    updateEventListener(buttons.editBudget, "click", () => {
        inputFields.idInputEdit.value = ""; // ✅ Reset field
        showPopup(popups.confirmEdit);
    });
    
    updateEventListener(buttons.confirmEdit, "click", () => {
        if (editBudgetEntry()) { // Ensure a valid entry is selected
            showPopup(popups.edit);
            hidePopup(popups.confirmEdit);
        }
    });
    updateEventListener(buttons.saveBudgetEdit, "click", () => {
        updateBudgetEntry();
        hidePopup(popups.edit);
    });
    updateEventListener(buttons.cancelEdit, "click", () => {
        hidePopup(popups.edit);
    });
    updateEventListener(buttons.closePopupEdit, "click", () => {
        hidePopup(popups.confirmEdit);
    });

    updateEventListener(buttons.pullFinancials, "click", () => {
        showPopup(popups.pullFinancials);
    })

    updateEventListener(buttons.closePullFinancials, "click", () => {
        hidePopup(popups.pullFinancials);
    })

    // Delete Budget
    updateEventListener(buttons.deleteBudget, "click", () => {
        showPopup(popups.confirmDelete);
    });
    updateEventListener(buttons.confirmDelete, "click", () => {
        deleteBudgetEntry();
        hidePopup(popups.confirmDelete);
    });
    updateEventListener(buttons.closePopupDelete, "click", () => {
        hidePopup(popups.confirmDelete);
    });

    // Close Main Budget Popup
    updateEventListener(buttons.closePopup, "click", () => {
        hidePopup(popups.budgetPopup);
    });

    // ✅ Forecast Popup Controls
    updateEventListener(buttons.openForecast, "click", openForecastPopup);
    updateEventListener(buttons.closeForecast, "click", () => hidePopup(popups.forecast));
    updateEventListener(buttons.resetForecast, "click", resetForecast);
    
    // ✅ Forecast Income Events
    updateEventListener(buttons.forecastIncomeBtn, "click", showForecastIncomeForm);
    updateEventListener(buttons.confirmIncomeBtn, "click", confirmForecastIncome);
    updateEventListener(buttons.closeIncomeBtn, "click", () => hidePopup(popups.forecastIncome));

    // ✅ Forecast Expense Events
    updateEventListener(buttons.forecastExpenseBtn, "click", () => showPopup(popups.forecastExpense));
    updateEventListener(buttons.closeExpenseBtn, "click", () => hidePopup(popups.forecastExpense));

    // ✅ Financial Charts & Updates
    updateEventListener(document.getElementById("tnw-btn"), "click", () => showGraph("tnw-container"));
    updateEventListener(document.getElementById("income-btn"), "click", () => showGraph("income-container"));
    updateEventListener(document.getElementById("expense-btn"), "click", () => showGraph("expense-container"));
    updateEventListener(document.getElementById("update-financials"), "click", () => {
        initializeCharts();
        calculateFinancials();
    });

    // ✅ Expense Management Events
    updateEventListener(buttons.addExpense, "click", () => {
        showPopup(popups.forecastConfirmExpenseAdd);
    });
    updateEventListener(buttons.editExpense, "click", () => {
        showPopup(popups.confirmExpenseIdEdit);
    });
    updateEventListener(buttons.deleteExpense, "click", () => {
        showPopup(popups.confirmExpenseIdDelete);
    });
    updateEventListener(buttons.saveExpenseAdd, "click", () => {
        addNewExpenseEntry();
        hidePopup(popups.forecastConfirmExpenseAdd);
    });
    updateEventListener(buttons.saveExpenseEdit, "click", () => {
        updateExpenseEntry();
        hidePopup(popups.forecastConfirmExpenseEdit);
    });
    updateEventListener(buttons.cancelExpenseAdd, "click", () => {
        hidePopup(popups.forecastConfirmExpenseAdd);
    });
    updateEventListener(buttons.cancelExpenseEdit, "click", () => {
        hidePopup(popups.forecastConfirmExpenseEdit);
    });
    updateEventListener(buttons.confirmExpense, "click", confirmForecastExpenses);
    updateEventListener(buttons.confirmExpenseEditButton, "click", () => {
        editExpenseEntry();
        hidePopup(popups.confirmExpenseIdEdit);
        showPopup(popups.forecastConfirmExpenseEdit);
    });
    updateEventListener(buttons.confirmExpenseDeleteButton, "click", () => {
        deleteExpenseEntry();
        hidePopup(popups.confirmExpenseIdDelete);
    });
    updateEventListener(buttons.closePopupExpenseEditButton, "click", () => {
        hidePopup(popups.confirmExpenseIdEdit);
    });
    updateEventListener(buttons.closePopupExpenseDeleteButton, "click", () => {
        hidePopup(popups.confirmExpenseIdDelete);
    });
}


// ✅ Initialize Event Listeners Once
document.addEventListener("DOMContentLoaded", () => {
    if (!window.eventListenersInitialized) {
        window.eventListenersInitialized = true;
        attachEventListeners(); // ✅ Now runs only once
    }
});