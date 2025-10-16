/**
 * Validators Module - Handles form validation and regex rules
 * Implements 4+ validation rules including advanced patterns
 */

// Regex patterns for validation
export const REGEX_PATTERNS = {
    // Rule 1: Description validation - no leading/trailing spaces
    description: /^\S(?:.*\S)?$/,
    
    // Rule 2: Amount validation - positive number with max 2 decimal places
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    
    // Rule 3: Date validation - YYYY-MM-DD format
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    
    // Rule 4: Advanced pattern - duplicate words detection using back-reference
    duplicateWords: /\b(\w+)\s+\1\b/i
};

/**
 * Validates a single field against its regex pattern
 * @param {string} ruleName - Name of the validation rule
 * @param {string} value - Value to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateField = (ruleName, value) => {
    if (!value || value.trim() === '') {
        return { isValid: false, message: 'This field is required.' };
    }
    
    const regex = REGEX_PATTERNS[ruleName];
    if (!regex) {
        return { isValid: false, message: 'Unknown validation rule.' };
    }
    
    // Special handling for description validation
    if (ruleName === 'description') {
        if (!regex.test(value.trim())) {
            return { isValid: false, message: 'Description cannot have leading or trailing spaces.' };
        }
    }
    
    // Standard regex validation
    if (!regex.test(value)) {
        return { isValid: false, message: getValidationMessage(ruleName) };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Gets appropriate validation message for each rule
 * @param {string} ruleName - Name of the validation rule
 * @returns {string} Validation message
 */
const getValidationMessage = (ruleName) => {
    const messages = {
        amount: 'Amount must be a positive number with maximum 2 decimal places.',
        date: 'Date must be in YYYY-MM-DD format.',
        duplicateWords: 'Description contains duplicate words.'
    };
    
    return messages[ruleName] || 'Invalid format.';
};

/**
 * Validates the entire form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result with isValid, errors, and warnings
 */
export const validateForm = (formData) => {
    const errors = {};
    const warnings = {};
    let isValid = true;
    
    // Validate required fields
    const requiredFields = ['description', 'amount', 'date', 'category'];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            isValid = false;
        }
    });
    
    // Validate description
    if (formData.description) {
        const descResult = validateField('description', formData.description);
        if (!descResult.isValid) {
            errors.description = descResult.message;
            isValid = false;
        }
    }
    
    // Validate amount
    if (formData.amount) {
        const amountResult = validateField('amount', formData.amount);
        if (!amountResult.isValid) {
            errors.amount = amountResult.message;
            isValid = false;
        } else {
            // Additional check for reasonable amount range
            const amount = parseFloat(formData.amount);
            if (amount <= 0) {
                errors.amount = 'Amount must be greater than 0.';
                isValid = false;
            } else if (amount > 999999.99) {
                errors.amount = 'Amount is too large.';
                isValid = false;
            }
        }
    }
    
    // Validate date
    if (formData.date) {
        const dateResult = validateField('date', formData.date);
        if (!dateResult.isValid) {
            errors.date = dateResult.message;
            isValid = false;
        } else {
            // Additional check for reasonable date range
            const inputDate = new Date(formData.date);
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            
            if (inputDate > today) {
                errors.date = 'Date cannot be in the future.';
                isValid = false;
            } else if (inputDate < oneYearAgo) {
                errors.date = 'Date cannot be more than one year ago.';
                isValid = false;
            }
        }
    }
    
    // Advanced validation: Check for duplicate words
    if (formData.description && REGEX_PATTERNS.duplicateWords.test(formData.description)) {
        warnings.duplicateWords = 'Warning: Description contains duplicate words.';
    }
    
    // Additional business logic warnings
    if (formData.amount) {
        const amount = parseFloat(formData.amount);
        if (amount > 10000) {
            warnings.largeAmount = 'Warning: This is a large amount. Please verify.';
        }
    }
    
    return {
        isValid,
        errors,
        warnings
    };
};

/**
 * Validates currency settings
 * @param {Object} currencyData - Currency settings object
 * @returns {Object} Validation result
 */
export const validateCurrencySettings = (currencyData) => {
    const errors = {};
    let isValid = true;
    
    // Validate base currency symbol
    if (!currencyData.baseCurrency || currencyData.baseCurrency.trim() === '') {
        errors.baseCurrency = 'Base currency symbol is required.';
        isValid = false;
    } else if (currencyData.baseCurrency.length > 3) {
        errors.baseCurrency = 'Currency symbol must be 3 characters or less.';
        isValid = false;
    }
    
    // Validate budget cap
    if (!currencyData.budgetCap || currencyData.budgetCap <= 0) {
        errors.budgetCap = 'Budget cap must be a positive number.';
        isValid = false;
    }
    
    // Validate alternative currency rates
    if (currencyData.alt1Rate && (currencyData.alt1Rate <= 0 || currencyData.alt1Rate > 1000)) {
        errors.alt1Rate = 'Alternative currency 1 rate must be between 0 and 1000.';
        isValid = false;
    }
    
    if (currencyData.alt2Rate && (currencyData.alt2Rate <= 0 || currencyData.alt2Rate > 1000)) {
        errors.alt2Rate = 'Alternative currency 2 rate must be between 0 and 1000.';
        isValid = false;
    }
    
    return {
        isValid,
        errors
    };
};

/**
 * Real-time validation for input fields
 * @param {string} fieldName - Name of the field being validated
 * @param {string} value - Current value of the field
 * @returns {Object} Real-time validation result
 */
export const validateFieldRealtime = (fieldName, value) => {
    if (!value || value.trim() === '') {
        return { isValid: true, message: '', warning: '' };
    }
    
    const result = validateField(fieldName, value);
    
    // Special handling for duplicate words warning
    let warning = '';
    if (fieldName === 'description' && REGEX_PATTERNS.duplicateWords.test(value)) {
        warning = 'Warning: Duplicate words detected.';
    }
    
    // Additional UX improvements
    let suggestion = '';
    if (fieldName === 'amount' && value && !result.isValid) {
        if (value.includes(',')) {
            suggestion = 'Use a period (.) instead of comma for decimals.';
        } else if (value.startsWith('0') && value.length > 1 && !value.includes('.')) {
            suggestion = 'Remove leading zeros.';
        }
    }
    
    return {
        isValid: result.isValid,
        message: result.message,
        warning: warning,
        suggestion: suggestion
    };
};

/**
 * Sanitizes input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/&/g, '&amp;') // Escape HTML entities
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim(); // Remove leading/trailing whitespace
};

/**
 * Validates and sanitizes form data
 * @param {Object} formData - Raw form data
 * @returns {Object} Sanitized and validated form data
 */
export const sanitizeAndValidateForm = (formData) => {
    const sanitized = {
        id: formData.id, // Preserve the ID field
        description: sanitizeInput(formData.description),
        amount: formData.amount,
        category: sanitizeInput(formData.category),
        date: formData.date
    };
    
    return {
        data: sanitized,
        validation: validateForm(sanitized)
    };
};
