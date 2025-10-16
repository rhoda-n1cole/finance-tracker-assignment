/**
 * Storage Module - Handles localStorage operations and data persistence
 * Manages saving/loading of records, settings, and theme preferences
 */

// Storage keys
export const STORAGE_KEYS = {
    RECORDS: 'sft:data',
    SETTINGS: 'sft:settings',
    THEME: 'sft:theme'
};

// Default settings
export const DEFAULT_SETTINGS = {
    baseCurrency: '$',
    budgetCap: 1000,
    alt1Symbol: '€',
    alt1Rate: 0.93,
    alt2Symbol: '£',
    alt2Rate: 0.80,
    theme: 'light'
};

/**
 * Saves records to localStorage
 * @param {Array} records - Array of financial records
 */
export const saveRecords = (records) => {
    try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
        return true;
    } catch (error) {
        console.error('Error saving records to localStorage:', error);
        return false;
    }
};

/**
 * Loads records from localStorage
 * @returns {Array} Array of financial records
 */
export const loadRecords = () => {
    try {
        const storedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
        return storedRecords ? JSON.parse(storedRecords) : [];
    } catch (error) {
        console.error('Error loading records from localStorage:', error);
        return [];
    }
};

/**
 * Saves settings to localStorage
 * @param {Object} settings - Settings object
 */
export const saveSettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings to localStorage:', error);
        return false;
    }
};

/**
 * Loads settings from localStorage
 * @returns {Object} Settings object
 */
export const loadSettings = () => {
    try {
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading settings from localStorage:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Saves theme preference to localStorage
 * @param {string} theme - Theme name ('light' or 'dark')
 */
export const saveTheme = (theme) => {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        return true;
    } catch (error) {
        console.error('Error saving theme to localStorage:', error);
        return false;
    }
};

/**
 * Loads theme preference from localStorage
 * @returns {string} Theme name
 */
export const loadTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_SETTINGS.theme;
    } catch (error) {
        console.error('Error loading theme from localStorage:', error);
        return DEFAULT_SETTINGS.theme;
    }
};

/**
 * Exports all data as JSON string
 * @param {Array} records - Records to export
 * @returns {string} JSON string
 */
export const exportData = (records) => {
    return JSON.stringify(records, null, 2);
};

/**
 * Downloads data as JSON file
 * @param {Array} records - Records to download
 */
export const downloadData = (records) => {
    const json = exportData(records);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_tracker_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
};

/**
 * Validates and imports JSON data
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Result object with success status and data/error
 */
export const importData = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array.');
        }
        
        if (data.length === 0) {
            return { success: true, data: [], message: 'Import successful but no records were found.' };
        }

        // Basic structural validation
        const isValid = data.every(record =>
            record.id && 
            typeof record.description === 'string' && 
            typeof record.amount === 'number' && 
            record.date &&
            record.category
        );

        if (!isValid) {
            throw new Error('JSON structure is invalid or missing required fields.');
        }

        return { success: true, data, message: `Successfully imported ${data.length} records.` };
    } catch (error) {
        console.error('Import validation failed:', error);
        return { success: false, data: null, message: error.message };
    }
};

/**
 * Clears all stored data
 */
export const clearAllData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.RECORDS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.THEME);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
};
