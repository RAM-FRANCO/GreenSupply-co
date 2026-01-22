/**
 * Utility to generate consistent colors for categories based on their name.
 * Used to ensure new categories get a color without manual updates.
 */

interface CategoryColor {
    bg: string;
    text: string;
}

const PALETTE_OPTIONS: CategoryColor[] = [
    { bg: 'success.light', text: 'success.dark' }, // Green
    { bg: 'info.light', text: 'info.dark' },       // Blue
    { bg: 'warning.light', text: 'warning.dark' }, // Orange
    { bg: '#e0f2f1', text: '#00695c' },           // Teal
    { bg: '#fff8e1', text: '#ff8f00' },           // Amber
    { bg: '#e8eaf6', text: '#283593' },           // Indigo
    { bg: '#fffde7', text: '#fbc02d' },           // Yellow
    { bg: '#f5f5f5', text: '#616161' },           // Gray
    { bg: '#fce4ec', text: '#880e4f' },           // Pink
    { bg: '#e1bee7', text: '#4a148c' },           // Purple
];

/**
 * Returns a color object for a given category name.
 * Uses a simple hash function to ensure the same name always gets the same color.
 */
export const getCategoryColor = (categoryName: string): CategoryColor => {
    if (!categoryName) {
        return PALETTE_OPTIONS[0];
    }

    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
        hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % PALETTE_OPTIONS.length;
    return PALETTE_OPTIONS[index];
};
