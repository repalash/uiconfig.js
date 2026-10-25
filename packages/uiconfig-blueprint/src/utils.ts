// todo move to uiConfigMethods
export function cleanLabel(varName?: string): string|undefined {
    if (!varName || typeof varName !== 'string') {
        return varName;
    }

    let result = varName.trim();
    if (!result) return '';
    if(result.includes(' ')) return result; // already has spaces

    result = result.replace(/_/g, ' ');

    // Insert spaces before uppercase letters (camelCase handling)
    // First handle sequences like "XMLHttp" -> "XML Http"
    result = result.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    // Then handle regular camelCase like "firstName" -> "first Name"
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Insert spaces before numbers that follow letters
    result = result.replace(/([a-zA-Z])(\d)/g, '$1 $2');

    // Insert spaces after numbers that are followed by letters
    result = result.replace(/(\d)([a-zA-Z])/g, '$1 $2');

    // Split into words, capitalize first letter of each word, and join with spaces
    const words = result.split(/\s+/).filter(word => word.length > 0);
    const capitalizedWords = words.map(word => {
        // Preserve acronyms (all uppercase words with 2+ chars)
        if (word.length >= 2 && word === word.toUpperCase()) {
            return word;
        }
        // Regular word capitalization
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });


    return capitalizedWords.join(' ');
}
