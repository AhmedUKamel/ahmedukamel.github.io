/**
 * Data Loader Module
 * Handles fetching and parsing JSON data for the portfolio
 */

let portfolioData = null;

/**
 * Load portfolio data from JSON file
 * @returns {Promise<Object>} Portfolio data object
 */
export const loadPortfolioData = async () => {
    try {
        const response = await fetch('database.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        portfolioData = await response.json();
        return portfolioData;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        throw new Error('Failed to load portfolio data. Please try again later.');
    }
};

/**
 * Get cached portfolio data
 * @returns {Object|null} Cached portfolio data or null if not loaded
 */
export const getPortfolioData = () => {
    return portfolioData;
};

/**
 * Validate portfolio data structure
 * @param {Object} data - Portfolio data to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePortfolioData = (data) => {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    // Check for required sections
    const requiredSections = ['hero', 'about', 'experience', 'education', 'skills', 'projects', 'reachMe', 'contact'];
    
    for (const section of requiredSections) {
        if (!data[section]) {
            console.warn(`Missing required section: ${section}`);
            return false;
        }
    }
    
    return true;
};
