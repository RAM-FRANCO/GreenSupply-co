import { colors } from "@mui/material";

const CATEGORY_PALETTE = [
  colors.blue,
  colors.purple,
  colors.teal,
  colors.indigo,
  colors.deepOrange,
  colors.pink,
  colors.cyan,
  colors.amber,
  colors.lime,
  colors.lightBlue,
];

/**
 * Returns a consistent color palette based on the category name using hashing.
 * Ensures new categories automatically get a distinct color without code changes.
 */
export const getCategoryColor = (category: string) => {
  if (!category) return colors.grey;

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[index];
};
