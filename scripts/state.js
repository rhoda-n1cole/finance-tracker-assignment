/**
 * State Module - Manages application state and data operations
 * Handles CRUD operations, sorting, and state updates
 */

import { saveRecords, saveSettings } from './storage.js';

// Default categories
export const CATEGORIES = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

// Application state
let records = [];
let settings = {};
let currentSort = { key: 'date', direction: 'desc' };

/**
 * Initializes the application state
 * @param {Array} initialRecords - Initial records array
 * @param {Object} initialSettings - Initial settings object
 */
export const initializeState = (initialRecords, initialSettings) => {
    records = initialRecords || [];
    settings = initialSettings || {};
};

/**
 * Gets current records
 * @returns {Array} Current records array
 */
export const getRecords = () => [...records];

/**
 * Gets current settings
 * @returns {Object} Current settings object
 */
export const getSettings = () => ({ ...settings });

/**
 * Gets current sort configuration
 * @returns {Object} Current sort object
 */
export const getCurrentSort = () => ({ ...currentSort });

/**
 * Adds a new record
 * @param {Object} recordData - Record data object
 * @returns {Object} Created record with ID and timestamps
 */
export const addRecord = (recordData) => {
    const now = new Date().toISOString();
    const newId = 'txn_' + crypto.randomUUID();
    
    const newRecord = {
        id: newId,
        description: recordData.description.trim(),
        amount: parseFloat(recordData.amount),
        category: recordData.category,
        date: recordData.date,
        createdAt: now,
        updatedAt: now
    };
    
    records.unshift(newRecord);
    records = sortRecords(records, currentSort.key, currentSort.direction);
    saveRecords(records);
    
    return newRecord;
};

/**
 * Updates an existing record
 * @param {string} id - Record ID
 * @param {Object} recordData - Updated record data
 * @returns {Object|null} Updated record or null if not found
 */
export const updateRecord = (id, recordData) => {
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const now = new Date().toISOString();
    const updatedRecord = {
        ...records[index],
        description: recordData.description.trim(),
        amount: parseFloat(recordData.amount),
        category: recordData.category,
        date: recordData.date,
        updatedAt: now
    };
    
    records[index] = updatedRecord;
    records = sortRecords(records, currentSort.key, currentSort.direction);
    saveRecords(records);
    
    return updatedRecord;
};

/**
 * Deletes a record by ID
 * @param {string} id - Record ID
 * @returns {Object|null} Deleted record or null if not found
 */
export const deleteRecord = (id) => {
    const recordIndex = records.findIndex(r => r.id === id);
    if (recordIndex === -1) return null;
    
    const deletedRecord = records[recordIndex];
    records = records.filter(r => r.id !== id);
    saveRecords(records);
    
    return deletedRecord;
};

/**
 * Updates application settings
 * @param {Object} newSettings - New settings object
 */
export const updateSettings = (newSettings) => {
    settings = { ...settings, ...newSettings };
    saveSettings(settings);
};

/**
 * Sorts records by specified key and direction
 * @param {Array} recordsArray - Array of records to sort
 * @param {string} key - Sort key
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted records array
 */
export const sortRecords = (recordsArray, key, direction) => {
    const sorted = [...recordsArray].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        if (typeof valA === 'number') {
            comparison = valA - valB;
        } else {
            comparison = String(valA).localeCompare(String(valB));
        }

        return direction === 'asc' ? comparison : comparison * -1;
    });

    currentSort = { key, direction };
    return sorted;
};

/**
 * Sets the current sort configuration
 * @param {string} key - Sort key
 * @param {string} direction - Sort direction
 */
export const setSort = (key, direction) => {
    currentSort = { key, direction };
    records = sortRecords(records, key, direction);
    saveRecords(records);
};

/**
 * Gets dashboard statistics
 * @returns {Object} Dashboard statistics object
 */
export const getDashboardStats = () => {
    const totalRecords = records.length;
    const totalSpent = records.reduce((sum, r) => sum + r.amount, 0);
    const avgSpent = totalRecords > 0 ? totalSpent / totalRecords : 0;

    // Category analysis
    const categoryCounts = records.reduce((counts, r) => {
        counts[r.category] = (counts[r.category] || 0) + 1;
        return counts;
    }, {});

    const categoryAmounts = records.reduce((amounts, r) => {
        amounts[r.category] = (amounts[r.category] || 0) + r.amount;
        return amounts;
    }, {});

    const topCategoryByCount = Object.keys(categoryCounts).length > 0 ? 
        Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b) : 'N/A';

    const topCategoryByAmount = Object.keys(categoryAmounts).length > 0 ? 
        Object.keys(categoryAmounts).reduce((a, b) => 
            categoryAmounts[a] > categoryAmounts[b] ? a : b) : 'N/A';

    return {
        totalRecords,
        totalSpent,
        avgSpent,
        topCategoryByCount,
        topCategoryByAmount,
        categoryCounts,
        categoryAmounts
    };
};

/**
 * Gets spending trend for the last 7 days
 * @returns {Object} Trend data with labels and amounts
 */
export const getSevenDayTrend = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTotals = {};
    const labels = [];
    
    // Initialize 7 days (including today and tomorrow to catch future-dated transactions)
    for (let i = 6; i >= -1; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        dailyTotals[dateStr] = 0;
        labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
    }

    // Aggregate spending
    records.forEach(r => {
        const date = r.date;
        if (dailyTotals.hasOwnProperty(date)) {
            dailyTotals[date] += r.amount;
        }
    });

    return {
        labels: Object.keys(dailyTotals).map(k => labels[Object.keys(dailyTotals).indexOf(k)]),
        amounts: Object.values(dailyTotals)
    };
};

/**
 * Gets budget information
 * @returns {Object} Budget information object
 */
export const getBudgetInfo = () => {
    const totalSpent = records.reduce((sum, r) => sum + r.amount, 0);
    const budgetCap = settings.budgetCap || 0;
    const remaining = budgetCap - totalSpent;
    const isOverBudget = remaining < 0;

    return {
        budgetCap,
        totalSpent,
        remaining: Math.abs(remaining),
        isOverBudget
    };
};

/**
 * Finds a record by ID
 * @param {string} id - Record ID
 * @returns {Object|null} Found record or null
 */
export const findRecordById = (id) => {
    return records.find(r => r.id === id) || null;
};

/**
 * Filters records based on search criteria
 * @param {RegExp} searchRegex - Regular expression for filtering
 * @returns {Array} Filtered records array
 */
export const filterRecords = (searchRegex) => {
    if (!searchRegex) return records;
    
    return records.filter(r => 
        searchRegex.test(r.description) || 
        searchRegex.test(r.category) ||
        searchRegex.test(r.amount.toString())
    );
};
