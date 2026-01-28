/**
 * Converts a string into a URL-friendly slug.
 * e.g. "Bamboo Spork Set" -> "bamboo-spork-set"
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w-]+/g, '')    // Remove all non-word chars
        .replace(/--+/g, '-');     // Replace multiple - with single -
}

/**
 * Generates a unique slug by checking against existing slugs and appending a suffix if needed.
 */
export function generateUniqueSlug(name: string, existingSlugs: string[], currentSlug?: string): string {
    const baseSlug = slugify(name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Filter out the current slug if we're updating a product
    const otherSlugs = currentSlug
        ? existingSlugs.filter(s => s !== currentSlug)
        : existingSlugs;

    while (otherSlugs.includes(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
}
