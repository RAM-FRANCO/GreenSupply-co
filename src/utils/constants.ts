export const PRODUCT_CATEGORIES = [
  "Utensils",
  "Packaging",
  "Cups",
  "Bags",
  "Other",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
