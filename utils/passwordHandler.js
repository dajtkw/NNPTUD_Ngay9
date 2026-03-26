/**
 * Password Handler Utility
 * Generates random passwords that meet system requirements
 */

/**
 * Generates a random password of 16 characters that meets system requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter  
 * - At least 1 number
 * - At least 1 special character
 * 
 * @returns {string} Randomly generated password
 */
function generateRandomPassword() {
    // Character sets
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Ensure at least one of each required character type
    const randomLower = lowercase[Math.floor(Math.random() * lowercase.length)];
    const randomUpper = uppercase[Math.floor(Math.random() * uppercase.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    
    // Combine the required characters
    const requiredChars = randomLower + randomUpper + randomNumber + randomSpecial;
    
    // Create a pool of all characters for the remaining positions
    const allChars = lowercase + uppercase + numbers + specials;
    
    // Generate remaining 12 characters (16 total - 4 required)
    let remainingChars = '';
    for (let i = 0; i < 12; i++) {
        remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Combine all characters and shuffle them
    const combined = requiredChars + remainingChars;
    return shuffleString(combined);
}

/**
 * Shuffles a string using Fisher-Yates algorithm
 * 
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

/**
 * Validates if a password meets system requirements
 * 
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
function validatePassword(password) {
    if (password.length < 8) return false;
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    return hasLowercase && hasUppercase && hasNumber && hasSpecial;
}

module.exports = {
    generateRandomPassword,
    validatePassword,
    shuffleString
};