/**
 * Main Application Entry Point
 * Initializes the Student Finance Tracker application
 */

import { 
    loadRecords, 
    saveRecords, 
    loadSettings, 
    saveSettings, 
    loadTheme, 
    saveTheme,
    downloadData,
    importData
} from './storage.js';

import {
    initializeState,
    getRecords,
    getSettings,
    getCurrentSort,
    addRecord,
    updateRecord,
    deleteRecord,
    updateSettings,
    setSort,
    getDashboardStats,
    getSevenDayTrend,
    getBudgetInfo,
    findRecordById,
    filterRecords,
    CATEGORIES
} from './state.js';

import {
    validateForm,
    validateFieldRealtime,
    sanitizeAndValidateForm
} from './validators.js';

import {
    compileRegex,
    searchRecords,
    validateRegexPattern
} from './search.js';

import { UI } from './ui.js';

/**
 * Application Controller Class
 */
class FinanceTrackerApp {
    constructor() {
        this.currentSearchRegex = null;
        this.deleteCallback = null;
        this.init();
    }

    /**
     * Initializes the application
     */
    init() {
        this.loadApplicationState();
        this.initializeEventListeners();
        this.initializeUI();
    }

    /**
     * Loads application state from localStorage
     */
    loadApplicationState() {
        const records = loadRecords();
        const settings = loadSettings();
        const theme = loadTheme();
        
        initializeState(records, settings);
        UI.setTheme(theme);
    }

    /**
     * Initializes all event listeners
     */
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const newTheme = UI.toggleTheme();
            saveTheme(newTheme);
            UI.updateStatus(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated.`, 'polite');
        });

        // Navigation - Handle all buttons with data-view attribute
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-view')) {
                const view = e.target.dataset.view;
                
                // Only switch if it's a different view
                const currentActive = document.querySelector('.nav-link.active');
                if (currentActive && currentActive.dataset.view === view) {
                    return; // Already on this view
                }
                
                UI.switchView(view);
                
                // Initialize form with categories when switching to form view
                if (view === 'form') {
                    // Only load form if categories are not already populated
                    const categorySelect = document.getElementById('category');
                    if (categorySelect && categorySelect.options.length <= 1) {
                        UI.loadForm(null, CATEGORIES);
                    }
                }
            }
        });

        // Form handling
        this.initializeFormHandlers();

        // Records table/cards handling
        this.initializeRecordsHandlers();

        // Search handling
        this.initializeSearchHandlers();

        // Settings handling
        this.initializeSettingsHandlers();

        // Modal handling
        this.initializeModalHandlers();
    }

    /**
     * Initializes form event handlers
     */
    initializeFormHandlers() {
        const form = document.getElementById('transaction-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Real-time validation for description
        document.getElementById('description').addEventListener('input', (e) => {
            this.handleDescriptionInput(e.target.value);
        });

        // Cancel button
        document.getElementById('form-cancel-btn').addEventListener('click', () => {
            UI.switchView('records');
        });
    }

    /**
     * Handles form submission
     */
    handleFormSubmit() {
        try {
            const formData = {
                id: document.getElementById('record-id').value,
                description: document.getElementById('description').value,
                amount: document.getElementById('amount').value,
                category: document.getElementById('category').value,
                date: document.getElementById('date').value
            };

            const { data: sanitizedData, validation } = sanitizeAndValidateForm(formData);

        if (validation.isValid) {
            if (sanitizedData.id) {
                // Update existing record
                const updatedRecord = updateRecord(sanitizedData.id, sanitizedData);
                if (updatedRecord) {
                    UI.updateStatus(`Transaction "${updatedRecord.description}" updated.`, 'polite');
                }
            } else {
                // Add new record
                const newRecord = addRecord(sanitizedData);
                UI.updateStatus(`New transaction "${newRecord.description}" added.`, 'polite');
            }

            this.refreshUI();
            UI.switchView('records');
        } else {
            UI.showFormErrors(validation.errors);
            if (validation.warnings.duplicateWords) {
                const advancedCheckElement = document.getElementById('advanced-check');
                if (advancedCheckElement) {
                    advancedCheckElement.textContent = validation.warnings.duplicateWords;
                }
            }
            UI.updateStatus('Form validation failed. Please correct the errors.', 'assertive');
        }
        } catch (error) {
            console.error('Form submission error:', error);
            UI.updateStatus('An unexpected error occurred. Please try again.', 'assertive');
        }
    }

    /**
     * Handles real-time description input validation
     * @param {string} value - Current input value
     */
    handleDescriptionInput(value) {
        const result = validateFieldRealtime('description', value);
        
        // Clear previous errors
        document.getElementById('desc-error').textContent = '';
        document.getElementById('description').classList.remove('invalid-input');
        const advancedCheckElement = document.getElementById('advanced-check');
        if (advancedCheckElement) {
            advancedCheckElement.textContent = '';
        }

        if (!result.isValid) {
            document.getElementById('desc-error').textContent = result.message;
            document.getElementById('description').classList.add('invalid-input');
        }

        if (result.warning) {
            const advancedCheckElement = document.getElementById('advanced-check');
            if (advancedCheckElement) {
                advancedCheckElement.textContent = result.warning;
            }
        }
    }

    /**
     * Initializes records table/cards event handlers
     */
    initializeRecordsHandlers() {
        // Click handlers for edit/delete buttons
        const recordsTableBody = document.getElementById('records-table-body');
        if (recordsTableBody) {
            recordsTableBody.addEventListener('click', (e) => {
                this.handleRecordAction(e);
            });
        }

        const recordsCardsContainer = document.getElementById('records-cards-container');
        if (recordsCardsContainer) {
            recordsCardsContainer.addEventListener('click', (e) => {
                this.handleRecordAction(e);
            });
        }

        // Sorting handlers
        document.querySelectorAll('.records-table th').forEach(th => {
            if (th.dataset.sortKey) {
                th.addEventListener('click', () => {
                    const key = th.dataset.sortKey;
                    const currentSort = getCurrentSort();
                    const direction = (key === currentSort.key && currentSort.direction === 'desc') ? 'asc' : 'desc';
                    
                    setSort(key, direction);
                    this.refreshRecordsView();
                });
            }
        });
    }

    /**
     * Handles record action (edit/delete)
     * @param {Event} e - Click event
     */
    handleRecordAction(e) {
        const action = e.target.dataset.action;
        const id = e.target.dataset.id;
        
        if (action === 'edit') {
            const record = findRecordById(id);
            if (record) {
                UI.loadForm(record, CATEGORIES);
            }
        } else if (action === 'delete') {
            const record = findRecordById(id);
            if (record) {
                UI.showModal(
                    `Are you sure you want to delete the transaction: "${record.description}"?`,
                    () => this.confirmDelete(id)
                );
            }
        }
    }

    /**
     * Confirms and executes record deletion
     * @param {string} id - Record ID to delete
     */
    confirmDelete(id) {
        const deletedRecord = deleteRecord(id);
        if (deletedRecord) {
            UI.updateStatus(`Transaction "${deletedRecord.description}" deleted.`, 'polite');
            this.refreshUI();
        }
        UI.hideModal();
    }

    /**
     * Initializes search event handlers
     */
    initializeSearchHandlers() {
        const searchInput = document.getElementById('search-input');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
    }

    /**
     * Handles search input changes
     * @param {string} input - Search input value
     */
    handleSearchInput(input) {
        UI.hideRegexError();
        
        if (!input.trim()) {
            this.currentSearchRegex = null;
            this.refreshRecordsView();
            return;
        }

        const validation = validateRegexPattern(input);
        if (!validation.isValid) {
            UI.showRegexError(validation.message);
            this.currentSearchRegex = null;
            this.refreshRecordsView();
            return;
        }

        this.currentSearchRegex = compileRegex(input);
        this.refreshRecordsView();
    }

    /**
     * Initializes settings event handlers
     */
    initializeSettingsHandlers() {
        // Currency settings form
        document.getElementById('currency-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsSubmit();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.handleExport();
        });

        // Import button
        document.getElementById('import-btn').addEventListener('click', () => {
            this.handleImport();
        });

        // File upload button
        document.getElementById('file-upload-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        // File input change
        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Drag and drop functionality
        const fileUploadArea = document.getElementById('file-upload-area');
        fileUploadArea.addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files: files } });
            }
        });
    }

    /**
     * Handles settings form submission
     */
    handleSettingsSubmit() {
        const settingsData = {
            baseCurrency: document.getElementById('base-currency').value.trim() || '$',
            budgetCap: parseFloat(document.getElementById('budget-cap').value) || 0,
            alt1Symbol: document.getElementById('alt-currency-1-symbol').value.trim() || '€',
            alt1Rate: parseFloat(document.getElementById('alt-currency-1-rate').value) || 1,
            alt2Symbol: document.getElementById('alt-currency-2-symbol').value.trim() || '£',
            alt2Rate: parseFloat(document.getElementById('alt-currency-2-rate').value) || 1
        };

        updateSettings(settingsData);
        this.refreshDashboard();
        UI.updateStatus('Settings saved and applied to dashboard.', 'polite');
    }

    /**
     * Handles data export
     */
    handleExport() {
        const records = getRecords();
        downloadData(records);
        UI.updateStatus('Data exported successfully.', 'polite');
    }

    /**
     * Handles file selection for import
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            UI.showImportError('Please select a valid JSON file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            UI.showImportError('File size too large. Please select a file smaller than 5MB.');
            return;
        }

        // Update file name display with size
        const fileSize = (file.size / 1024).toFixed(1);
        document.getElementById('file-name-display').textContent = `Selected: ${file.name} (${fileSize} KB)`;

        // Show loading state
        document.getElementById('file-name-display').textContent = `Reading ${file.name}...`;

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                // Populate the textarea with file content
                document.getElementById('import-data-textarea').value = jsonData;
                UI.clearImportError();
                UI.updateStatus('File loaded successfully. Click "Import & Overwrite" to proceed.', 'polite');
                
                // Update display to show success
                const fileSize = (file.size / 1024).toFixed(1);
                document.getElementById('file-name-display').textContent = `✓ ${file.name} (${fileSize} KB)`;
            } catch (error) {
                UI.showImportError('Error reading file: ' + error.message);
                document.getElementById('file-name-display').textContent = '';
            }
        };
        reader.onerror = () => {
            UI.showImportError('Error reading file. Please try again.');
            document.getElementById('file-name-display').textContent = '';
        };
        reader.readAsText(file);
    }

    /**
     * Handles data import
     */
    handleImport() {
        const jsonData = document.getElementById('import-data-textarea').value;
        
        if (!jsonData.trim()) {
            UI.showImportError('Please provide JSON data either by uploading a file or pasting it in the textarea.');
            return;
        }

        const result = importData(jsonData);
        
        if (result.success) {
            // Update state with imported data
            saveRecords(result.data);
            initializeState(result.data, getSettings());
            this.refreshUI();
            UI.clearImportTextarea();
            UI.clearImportError();
            UI.updateStatus(result.message, 'polite');
            
            // Clear file selection
            document.getElementById('import-file-input').value = '';
            document.getElementById('file-name-display').textContent = '';
        } else {
            UI.showImportError(result.message);
            UI.updateStatus(`Import failed: ${result.message}`, 'assertive');
        }
    }

    /**
     * Initializes modal event handlers
     */
    initializeModalHandlers() {
        document.getElementById('modal-cancel').addEventListener('click', () => {
            UI.hideModal();
        });

        // Close modal on overlay click
        document.getElementById('confirmation-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                UI.hideModal();
            }
        });

        // Close modal on Escape key and keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('confirmation-modal').style.display === 'flex') {
                    UI.hideModal();
                } else if (document.getElementById('navbar-menu').classList.contains('open')) {
                    UI.closeMobileMenu();
                }
            }
            
            // Keyboard shortcuts (Ctrl/Cmd + key)
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        UI.loadForm(null, CATEGORIES);
                        UI.switchView('form');
                        break;
                    case 'r':
                        e.preventDefault();
                        UI.switchView('records');
                        break;
                    case 'd':
                        e.preventDefault();
                        UI.switchView('dashboard');
                        break;
                    case 's':
                        e.preventDefault();
                        UI.switchView('settings');
                        break;
                }
            }
        });
    }

    /**
     * Initializes the UI with current state
     */
    initializeUI() {
        this.refreshUI();
        UI.switchView('dashboard');
        // Initialize form with categories
        UI.loadForm(null, CATEGORIES);
    }

    /**
     * Refreshes all UI components
     */
    refreshUI() {
        this.refreshRecordsView();
        this.refreshDashboard();
        UI.renderSettings(getSettings());
    }

    /**
     * Refreshes the records view
     */
    refreshRecordsView() {
        const records = getRecords();
        const filteredRecords = this.currentSearchRegex ? 
            searchRecords(records, this.currentSearchRegex) : records;
        
        UI.renderRecords(filteredRecords, this.currentSearchRegex, getCurrentSort());
    }

    /**
     * Refreshes the dashboard
     */
    refreshDashboard() {
        const stats = getDashboardStats();
        const budgetInfo = getBudgetInfo();
        const trendData = getSevenDayTrend();
        const settings = getSettings();
        
        UI.updateDashboard(stats, budgetInfo, trendData, settings);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinanceTrackerApp();
});
