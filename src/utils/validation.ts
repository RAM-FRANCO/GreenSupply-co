import { KeyboardEvent } from "react";

/**
 * Checks if a keyboard event corresponds to a key that should be blocked for integer-only input.
 * Blocks: 'e', 'E', '.', '-', '+'
 *
 * @param event The React KeyboardEvent
 * @returns true if the key should be blocked, false otherwise
 */
export const isIntegerKey = (event: KeyboardEvent<any>): boolean => {
  return ["e", "E", ".", "-", "+"].includes(event.key);
};
