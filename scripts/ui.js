/**
 * UI Module - Handles DOM manipulation and UI updates
 * Manages rendering, event handling, and accessibility features
 */

import { highlightMatches } from './search.js';

// SVG paths for theme icons
const ICON_SUN = 'M12 2a10 10 0 0 0 9.5 7h-5.91a2 2 0 0 1-1.92-2.4c.73-2.31 1.74-4.57 3.01-6.52A10 10 0 0 0 12 2zM3 12a9.92 9.92 0 0 0 5 8.65A10.16 10.16 0 0 1 12 22a10 10 0 0 0 0-20A10 10 0 0 0 3 12z';
const ICON_MOON = 'M10 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zm6 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm-6 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2zm-6-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zM12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 17a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z';

// DOM selectors
const SELECTORS = {
    html: document.documentElement,
    main: document.getElementById('main-content'),
    recordsTableBody: document.getElementById('records-table-body'),
    recordsCardsContainer: document.getElementById('records-cards-container'),
    transactionForm: document.getElementById('transaction-form'),
    searchInput: document.getElementById('search-input'),
    regexError: document.getElementById('regex-error'),
    statusPolite: document.getElementById('status-region-polite'),
    statusAssertive: document.getElementById('status-region-assertive'),
    noRecordsMessage: document.getElementById('no-records-message'),
    modalOverlay: document.getElementById('confirmation-modal'),
    modalConfirm: document.getElementById('modal-confirm'),
    modalCancel: document.getElementById('modal-cancel'),
    navLinks: document.querySelectorAll('.nav-link'),
    viewContents: document.querySelectorAll('[data-view-target]'),
    chartBarsContainer: document.getElementById('chart-bars') || null,
    chartDatesContainer: document.getElementById('chart-dates') || null,
    chartDataMessage: document.getElementById('chart-data-message') || null,
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
};

/**
 * UI Controller Object
 */
export const UI = {
    
    /**
     * Sets the application theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme: (theme) => {
        SELECTORS.html.dataset.theme = theme;
        const iconPath = theme === 'dark' ? ICON_MOON : ICON_SUN;
        SELECTORS.themeIcon.innerHTML = `<path d="${iconPath}"/>`;
    },

    /**
     * Toggles between light and dark themes
     * @returns {string} New theme name
     */
    toggleTheme: () => {
        const currentTheme = SELECTORS.html.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        UI.setTheme(newTheme);
        return newTheme;
    },
    
    /**
     * Switches to a specific view
     * @param {string} viewName - Name of the view to switch to
     */
    switchView: (viewName) => {
        SELECTORS.viewContents.forEach(view => {
            view.style.display = view.id === `view-${viewName}` ? 'block' : 'none';
        });
        SELECTORS.navLinks.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        // Update skip link
        const headingId = document.getElementById(`${viewName}-heading`)?.id || SELECTORS.main.id;
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
            skipLink.href = `#${headingId}`;
        }
    },


    /**
     * Renders records in both table and card formats
     * @param {Array} records - Array of records to render
     * @param {RegExp} searchRegex - Optional search regex for highlighting
     * @param {Object} sortConfig - Current sort configuration
     */
    renderRecords: (records, searchRegex = null, sortConfig = { key: 'date', direction: 'desc' }) => {
        const hasRecords = records.length > 0;
        SELECTORS.noRecordsMessage.style.display = hasRecords ? 'none' : 'block';

        if (!hasRecords) {
            SELECTORS.recordsTableBody.innerHTML = '';
            SELECTORS.recordsCardsContainer.innerHTML = '';
            return;
        }

        // Helper function for action buttons
        const actionButtons = (record) => `
            <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${record.id}" aria-label="Edit ${record.description}">Edit</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-id="${record.id}" aria-label="Delete ${record.description}">Delete</button>
        `;

        // Render table rows (Desktop/Tablet)
        SELECTORS.recordsTableBody.innerHTML = records.map(record => {
            const descriptionHtml = highlightMatches(record.description, searchRegex);
            const categoryHtml = highlightMatches(record.category, searchRegex);

            return `
                <tr class="record-row new-record" data-id="${record.id}" tabindex="0">
                    <td>${descriptionHtml}</td>
                    <td style="font-weight: 600;">${UI.formatCurrency(record.amount)}</td>
                    <td>${categoryHtml}</td>
                    <td>${record.date}</td>
                    <td>${actionButtons(record)}</td>
                </tr>
            `;
        }).join('');

        // Render mobile cards (if container exists)
        if (SELECTORS.recordsCardsContainer) {
            SELECTORS.recordsCardsContainer.innerHTML = records.map(record => {
            const descriptionHtml = highlightMatches(record.description, searchRegex);
            const categoryHtml = highlightMatches(record.category, searchRegex);

            return `
                <div class="card record-card new-record" data-id="${record.id}">
                    <div class="record-card-title">${descriptionHtml}</div>
                    <div class="record-card-detail">
                        <span style="font-weight: 700;">${UI.formatCurrency(record.amount)}</span>
                        <span>Category: ${categoryHtml}</span>
                    </div>
                    <div class="record-card-detail">
                        <span>Date: ${record.date}</span>
                        <div style="display: flex; gap: 0.5rem;">
                            ${actionButtons(record)}
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        }

        // Update sort indicators
        UI.updateSortIndicators(sortConfig);
    },

    /**
     * Updates sort indicators in table headers
     * @param {Object} sortConfig - Sort configuration object
     */
    updateSortIndicators: (sortConfig) => {
        document.querySelectorAll('.records-table th').forEach(th => {
            const key = th.dataset.sortKey;
            const indicator = th.querySelector('.sort-indicator');
            
            if (indicator) {
                indicator.textContent = '';
                if (key === sortConfig.key) {
                    const directionSymbol = sortConfig.direction === 'asc' ? '▲' : '▼';
                    indicator.textContent = directionSymbol;
                }
            }
        });
    },


    /**
     * Updates the dashboard with current statistics
     * @param {Object} stats - Dashboard statistics
     * @param {Object} budgetInfo - Budget information
     * @param {Object} trendData - 7-day trend data
     * @param {Object} settings - Current settings
     */
    updateDashboard: (stats, budgetInfo, trendData, settings) => {
        // Update basic stats
        document.getElementById('stat-total-records').textContent = stats.totalRecords;
        document.getElementById('stat-total-spent').textContent = UI.formatCurrency(stats.totalSpent, settings);
        document.getElementById('stat-top-category').textContent = stats.topCategoryByCount;
        document.getElementById('stat-average-spent').textContent = UI.formatCurrency(stats.avgSpent, settings);
        
        // Update budget cap display
        UI.updateBudgetDisplay(budgetInfo, settings);
        
        // Update trend chart
        UI.renderTrendChart(trendData, settings);
    },

    /**
     * Updates budget display with ARIA live regions
     * @param {Object} budgetInfo - Budget information
     * @param {Object} settings - Current settings
     */
    updateBudgetDisplay: (budgetInfo, settings) => {
        const { budgetCap, totalSpent, remaining, isOverBudget } = budgetInfo;
        
        const spentPercentage = budgetCap > 0 ? Math.min((totalSpent / budgetCap) * 100, 100) : 0;
        
        // Update individual budget elements
        const budgetAmountElement = document.getElementById('budget-amount');
        if (budgetAmountElement) {
            budgetAmountElement.textContent = UI.formatCurrency(budgetCap, settings);
        }
        
        const budgetProgressFillElement = document.getElementById('budget-progress-fill');
        if (budgetProgressFillElement) {
            budgetProgressFillElement.style.width = `${spentPercentage}%`;
            budgetProgressFillElement.className = `progress-fill ${isOverBudget ? 'over-budget' : ''}`;
        }
        
        const budgetSpentElement = document.getElementById('budget-spent');
        if (budgetSpentElement) {
            budgetSpentElement.textContent = UI.formatCurrency(totalSpent, settings);
            budgetSpentElement.className = `budget-value spent`;
        }
        
        const budgetRemainingElement = document.getElementById('budget-remaining');
        if (budgetRemainingElement) {
            budgetRemainingElement.textContent = UI.formatCurrency(remaining, settings);
            budgetRemainingElement.className = `budget-value ${isOverBudget ? 'over-budget' : 'remaining'}`;
        }
    },

    /**
     * Renders the 7-day trend chart
     * @param {Object} trendData - Trend data with labels and amounts
     * @param {Object} settings - Current settings
     */
    renderTrendChart: (trendData, settings) => {
        const { labels, amounts } = trendData;
        const maxAmount = Math.max(...amounts);
        
        let chartBarsHtml = '';
        let chartDatesHtml = '';
        
        if (maxAmount > 0) {
            amounts.forEach((amount, index) => {
                const heightPercent = (amount / maxAmount) * 100;
                chartBarsHtml += `
                    <div class="chart-bar" style="height: ${heightPercent}%;" 
                         aria-valuenow="${amount}" aria-valuemin="0" aria-valuemax="${maxAmount}" 
                         role="progressbar" title="${labels[index]}: ${UI.formatCurrency(amount, settings)}">
                        <span class="chart-label">${amount > 0 ? UI.formatCurrency(amount, settings, true) : ''}</span>
                    </div>
                `;
                chartDatesHtml += `<div>${labels[index]}</div>`;
            });
            if (SELECTORS.chartDataMessage) {
                SELECTORS.chartDataMessage.textContent = `Chart shows daily spending over the last 7 days. Max daily spend: ${UI.formatCurrency(maxAmount, settings)}.`;
            }
        } else {
            chartBarsHtml = '<p style="text-align: center; width: 100%; color: var(--color-text-secondary);">No spending recorded in the last 7 days.</p>';
            chartDatesHtml = '<div></div><div></div><div></div><div></div><div></div><div></div><div></div>';
            if (SELECTORS.chartDataMessage) {
                SELECTORS.chartDataMessage.textContent = '';
            }
        }

        if (SELECTORS.chartBarsContainer) {
            SELECTORS.chartBarsContainer.innerHTML = chartBarsHtml;
        }
        if (SELECTORS.chartDatesContainer) {
            SELECTORS.chartDatesContainer.innerHTML = chartDatesHtml;
        }
    },

    /**
     * Renders settings form with current values
     * @param {Object} settings - Current settings
     */
    renderSettings: (settings) => {
        document.getElementById('base-currency').value = settings.baseCurrency || '$';
        document.getElementById('budget-cap').value = settings.budgetCap || 1000;
        document.getElementById('alt-currency-1-symbol').value = settings.alt1Symbol || '€';
        document.getElementById('alt-currency-1-rate').value = settings.alt1Rate || 0.93;
        document.getElementById('alt-currency-2-symbol').value = settings.alt2Symbol || '£';
        document.getElementById('alt-currency-2-rate').value = settings.alt2Rate || 0.80;
    },

    /**
     * Formats a number as currency
     * @param {number} amount - Amount to format
     * @param {Object} settings - Settings object with currency info
     * @param {boolean} stripSymbol - Whether to return only the number
     * @returns {string} Formatted currency string
     */
    formatCurrency: (amount, settings = {}, stripSymbol = false) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return stripSymbol ? '0.00' : `${settings.baseCurrency || '$'}0.00`;
        
        const formatted = num.toFixed(2);
        return stripSymbol ? formatted : `${settings.baseCurrency || '$'}${formatted}`;
    },

    /**
     * Shows the confirmation modal
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback for confirmation
     */
    showModal: (message, onConfirm) => {
        document.getElementById('modal-message').textContent = message;
        SELECTORS.modalOverlay.style.display = 'flex';
        SELECTORS.modalConfirm.onclick = onConfirm;
        SELECTORS.modalConfirm.focus();
    },

    /**
     * Hides the confirmation modal
     */
    hideModal: () => {
        SELECTORS.modalOverlay.style.display = 'none';
        SELECTORS.modalConfirm.onclick = null;
    },

    /**
     * Updates status message in ARIA live region and shows visible feedback
     * @param {string} message - Status message
     * @param {string} type - Message type ('polite' or 'assertive')
     */
    updateStatus: (message, type = 'polite') => {
        const target = type === 'assertive' ? SELECTORS.statusAssertive : SELECTORS.statusPolite;
        
        // Clear the other type's status
        if (type === 'assertive') {
            SELECTORS.statusPolite.textContent = '';
        } else {
            SELECTORS.statusAssertive.textContent = '';
        }

        target.textContent = message;
        
        // Show visible feedback message
        const feedbackElement = document.getElementById('user-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = 'user-feedback';
            if (type === 'assertive') {
                feedbackElement.classList.add('error');
            }
            feedbackElement.style.display = 'block';
            
            // Hide after 4 seconds for better UX
            setTimeout(() => {
                feedbackElement.style.display = 'none';
            }, 4000);
        }
        
        // Clear ARIA message after a brief pause
        setTimeout(() => { 
            target.textContent = ''; 
        }, 5000);
    },

    /**
     * Shows loading state for buttons
     * @param {string} buttonId - ID of the button to show loading state
     * @param {boolean} isLoading - Whether to show loading state
     */
    showLoading: (buttonId, isLoading = true) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="loading-spinner"></span> Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    },

    /**
     * Escapes HTML entities to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml: (text) => {
        if (typeof text !== 'string') return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    },

    /**
     * Shows form validation errors
     * @param {Object} errors - Validation errors object
     */
    showFormErrors: (errors) => {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
            
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.classList.add('invalid-input');
            }
        });
    },

    /**
     * Clears all form validation errors
     */
    clearFormErrors: () => {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.invalid-input').forEach(el => el.classList.remove('invalid-input'));
    },

    /**
     * Shows regex error message
     * @param {string} message - Error message
     */
    showRegexError: (message) => {
        SELECTORS.regexError.textContent = message;
        SELECTORS.regexError.style.display = 'block';
    },

    /**
     * Hides regex error message
     */
    hideRegexError: () => {
        SELECTORS.regexError.style.display = 'none';
    },

    /**
     * Shows import error message
     * @param {string} message - Error message
     */
    showImportError: (message) => {
        const errorElement = document.getElementById('import-error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    },

    /**
     * Clears import error message
     */
    clearImportError: () => {
        const errorElement = document.getElementById('import-error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    },

    /**
     * Clears import textarea
     */
    clearImportTextarea: () => {
        const textarea = document.getElementById('import-data-textarea');
        if (textarea) {
            textarea.value = '';
        }
    },

    /**
     * Loads form with categories and optionally populates with record data
     * @param {Object|null} record - Record to populate form with (null for new record)
     * @param {Array} categories - Array of category names
     */
    loadForm: (record, categories) => {
        const categorySelect = document.getElementById('category');
        
        if (categorySelect && categories) {
            categorySelect.innerHTML = '<option value="">Select a category</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        if (!record) {
            // New record - reset form (but preserve categories)
            const currentCategories = categorySelect ? categorySelect.innerHTML : '';
            SELECTORS.transactionForm.reset();
            if (categorySelect) {
                categorySelect.innerHTML = currentCategories; // Restore categories after reset
            }
            document.getElementById('record-id').value = '';
            document.getElementById('form-submit-btn').textContent = 'Add Transaction';
            UI.clearFormErrors();
        } else {
            // Edit record - populate form
            document.getElementById('record-id').value = record.id;
            document.getElementById('description').value = record.description;
            document.getElementById('amount').value = record.amount;
            document.getElementById('category').value = record.category;
            document.getElementById('date').value = record.date;
            document.getElementById('form-submit-btn').textContent = 'Update Transaction';
            UI.clearFormErrors();
        }
        
        // Set default date to today if empty
        const dateInput = document.getElementById('date');
        if (dateInput && !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
};
