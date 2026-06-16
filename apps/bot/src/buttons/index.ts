import { economyButtons } from "../features/economy/economy.buttons.js";
import type { ButtonHandler } from "./types.js";

/**
 * The button-handler registry.
 *
 * Handlers are added here as features add interactive components. See
 * `docs/feature-map.md` for the migration roadmap.
 */
export const buttons: ButtonHandler[] = [...economyButtons];

/**
 * Find the first registered handler that owns a given `customId`.
 */
export function findButtonHandler(customId: string): ButtonHandler | undefined {
  return buttons.find((button) => button.matches(customId));
}
