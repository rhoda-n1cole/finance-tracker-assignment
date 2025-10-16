/**
 * Search Module - Handles regex search functionality
 * Provides safe regex compilation and highlighting capabilities
 */

/**
 * Safely compiles a user-input string into a RegExp object
 * @param {string} input - User input string
 * @param {string} flags - RegExp flags (default: 'i' for case-insensitive)
 * @returns {RegExp|null} Compiled regex or null if invalid
 */
export const compileRegex = (input, flags = 'i') => {
    if (!input || typeof input !== 'string') return null;
    
    try {
        let pattern = input.trim();
        
        // Remove regex delimiters if present
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
            pattern = pattern.slice(1, -1);
        }
        
        // If no pattern after removing delimiters, return null
        if (!pattern) return null;
        
        // Ensure global flag is set for highlighting
        if (!flags.includes('g')) {
            flags += 'g';
        }
        
        return new RegExp(pattern, flags);
    } catch (error) {
        console.warn('Invalid regex pattern:', input, error);
        return null;
    }
};

/**
 * Highlights matches in a text string using <mark> tags
 * @param {string} text - Text to highlight
 * @param {RegExp} regex - Compiled regex pattern
 * @returns {string} Text with highlighted matches
 */
export const highlightMatches = (text, regex) => {
    if (!regex || !text || typeof text !== 'string') return text;
    
    try {
        // Escape HTML entities in the text before highlighting
        const escapedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        
        return escapedText.replace(regex, match => `<mark>${match}</mark>`);
    } catch (error) {
        console.warn('Error highlighting text:', error);
        return text;
    }
};

/**
 * Searches records using a regex pattern
 * @param {Array} records - Array of records to search
 * @param {RegExp} searchRegex - Compiled regex pattern
 * @returns {Array} Filtered records that match the pattern
 */
export const searchRecords = (records, searchRegex) => {
    if (!searchRegex || !Array.isArray(records)) return records;
    
    try {
        return records.filter(record => {
            return searchRegex.test(record.description) ||
                   searchRegex.test(record.category) ||
                   searchRegex.test(record.amount.toString()) ||
                   searchRegex.test(record.date);
        });
    } catch (error) {
        console.warn('Error searching records:', error);
        return records;
    }
};

/**
 * Gets search suggestions based on common patterns
 * @returns {Array} Array of search suggestion objects
 */
export const getSearchSuggestions = () => {
    return [
        {
            pattern: '/\\.\\d{2}\\b/',
            description: 'Find amounts with cents (e.g., 12.50)',
            example: 'Shows transactions with decimal amounts'
        },
        {
            pattern: '/(coffee|tea)/i',
            description: 'Find beverage-related transactions',
            example: 'Matches "coffee" or "tea" in descriptions'
        },
        {
            pattern: '/\\b(\\w+)\\s+\\1\\b/',
            description: 'Find duplicate words (Advanced)',
            example: 'Catches "pizza pizza" or "book book"'
        },
        {
            pattern: '/^[A-Z]/',
            description: 'Find descriptions starting with capital letters',
            example: 'Matches proper nouns and formal descriptions'
        },
        {
            pattern: '/\\d{4}-\\d{2}-\\d{2}/',
            description: 'Find specific date patterns',
            example: 'Matches YYYY-MM-DD format in descriptions'
        },
        {
            pattern: '/(food|meal|lunch|dinner)/i',
            description: 'Find food-related transactions',
            example: 'Matches common food keywords'
        }
    ];
};

/**
 * Validates a regex pattern without compiling it
 * @param {string} pattern - Regex pattern to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateRegexPattern = (pattern) => {
    if (!pattern || typeof pattern !== 'string') {
        return { isValid: false, message: 'Pattern is required.' };
    }
    
    try {
        let cleanPattern = pattern.trim();
        
        // Remove delimiters if present
        if (cleanPattern.startsWith('/') && cleanPattern.endsWith('/')) {
            cleanPattern = cleanPattern.slice(1, -1);
        }
        
        // Test compilation
        new RegExp(cleanPattern, 'i');
        
        return { isValid: true, message: 'Valid regex pattern.' };
    } catch (error) {
        return { 
            isValid: false, 
            message: `Invalid regex: ${error.message}` 
        };
    }
};

/**
 * Creates a case-insensitive search regex
 * @param {string} searchTerm - Search term
 * @returns {RegExp} Case-insensitive regex
 */
export const createCaseInsensitiveSearch = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return null;
    
    try {
        // Escape special regex characters
        const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(escaped, 'gi');
    } catch (error) {
        console.warn('Error creating case-insensitive search:', error);
        return null;
    }
};

/**
 * Creates a fuzzy search regex for approximate matching
 * @param {string} searchTerm - Search term
 * @returns {RegExp} Fuzzy search regex
 */
export const createFuzzySearch = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return null;
    
    try {
        // Create a pattern that allows for some character variations
        const chars = searchTerm.split('').map(char => {
            if (/[a-zA-Z]/.test(char)) {
                return `[${char.toLowerCase()}${char.toUpperCase()}]`;
            }
            return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('.*?');
        
        return new RegExp(chars, 'i');
    } catch (error) {
        console.warn('Error creating fuzzy search:', error);
        return null;
    }
};

/**
 * Gets search statistics
 * @param {Array} allRecords - All records
 * @param {Array} filteredRecords - Filtered records
 * @param {RegExp} searchRegex - Current search regex
 * @returns {Object} Search statistics
 */
export const getSearchStats = (allRecords, filteredRecords, searchRegex) => {
    const totalRecords = allRecords.length;
    const matchingRecords = filteredRecords.length;
    const searchPattern = searchRegex ? searchRegex.source : '';
    
    return {
        totalRecords,
        matchingRecords,
        searchPattern,
        hasActiveSearch: !!searchRegex,
        matchPercentage: totalRecords > 0 ? Math.round((matchingRecords / totalRecords) * 100) : 0
    };
};

/**
 * Clears all highlighting from text
 * @param {string} text - Text with potential highlighting
 * @returns {string} Text without highlighting
 */
export const clearHighlighting = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
};
