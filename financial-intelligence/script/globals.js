// Global Variables and Exports

// Financial Intelligence
export let budgetEntries = JSON.parse(localStorage.getItem("budgetEntries")) || [];
export let expenseEntries = JSON.parse(localStorage.getItem("expenseEntries")) || [];
export var forecastedTNW = null;
export let existingFHSA = 8000;
export let existingRRSP = 12000;

// Forecast Elements
export const forecastElements = {
    tnw: null,
    abi: null,
    ans: null,
    aws: null,
    prds: null,
    status: null,
    startDate: null,
    endDate: null
};

// Background Images
export const bgImages = [
    "Images/goal-bg/image-1.jpg", "Images/goal-bg/image-2.jpg",
    "Images/goal-bg/image-3.jpg", "Images/goal-bg/image-4.jpg",
    "Images/goal-bg/image-5.jpg", "Images/goal-bg/image-6.jpg",
    "Images/goal-bg/image-7.jpg", "Images/goal-bg/image-8.jpg",
    "Images/goal-bg/image-9.jpg", "Images/goal-bg/image-10.jpg",
    "Images/goal-bg/image-11.jpg", "Images/goal-bg/image-12.jpg",
    "Images/goal-bg/image-13.jpg", "Images/goal-bg/image-14.jpg",
    "Images/goal-bg/image-15.jpg", "Images/goal-bg/image-16.jpg",
    "Images/goal-bg/image-17.jpg", "Images/goal-bg/image-18.jpg",
    "Images/goal-bg/image-19.jpg", "Images/goal-bg/image-20.jpg"
];

// Navigation State
export let navigationContainerButtonsPressed = false;

// Utility Functions
export function getNumBiweeklyPeriodsDefault() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weeks = Math.floor((today - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    return Math.floor(weeks / 2); // Biweekly periods
}

export function getLastFriday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
}

// Local Storage Functions
export function saveExpenseToLocalStorage() {
    localStorage.setItem("expenseEntries", JSON.stringify(expenseEntries));
}

export function loadExpenseFromLocalStorage() {
    if (!Array.isArray(expenseEntries)) {
        console.error("Corrupted expenseEntries data. Resetting...");
        expenseEntries = [];
    } else {
        // Remove invalid entries
        expenseEntries = expenseEntries.filter(entry => 
            entry &&
            entry.amount !== null &&
            !isNaN(entry.amount) &&
            entry.category.trim() !== "" &&
            entry.date.trim() !== ""
        );
    }
}