import { controlLinkDmButtons } from "../features/control-link/control-link-dm.buttons.js";
import { controlLinkButtons } from "../features/control-link/control-link.buttons.js";
import { dashboardButtons } from "../features/dashboards/dashboards.buttons.js";
import { economyButtons } from "../features/economy/economy.buttons.js";
import { sessionButtons } from "../features/lovense/session.buttons.js";
import type { ButtonHandler } from "./types.js";

/**
 * The button-handler registry.
 *
 * Handlers are added here as features add interactive components. See
 * `docs/feature-map.md` for the migration roadmap.
 */
export const buttons: ButtonHandler[] = [
  ...economyButtons,
  ...sessionButtons,
  ...controlLinkButtons,
  ...controlLinkDmButtons,
  ...dashboardButtons,
];

/**
 * Find the first registered handler that owns a given `customId`.
 */
export function findButtonHandler(customId: string): ButtonHandler | undefined {
  return buttons.find((button) => button.matches(customId));
}
