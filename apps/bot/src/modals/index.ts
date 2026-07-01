import { controlLinkDmModals } from "../features/control-link/control-link-dm.modals.js";
import type { ModalHandler } from "./types.js";

/**
 * The modal-handler registry.
 *
 * Handlers are added here as features add modal-based components. See
 * `docs/feature-map.md` for the migration roadmap.
 */
export const modals: ModalHandler[] = [...controlLinkDmModals];

/**
 * Find the first registered handler that owns a given `customId`.
 */
export function findModalHandler(customId: string): ModalHandler | undefined {
  return modals.find((modal) => modal.matches(customId));
}
