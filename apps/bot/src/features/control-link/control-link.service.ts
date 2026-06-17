import type { ActiveRaffle, ParsedControlLink } from "./control-link.types.js";

/** In-memory raffle state keyed by raffle message ID */
const activeRaffles = new Map<string, ActiveRaffle>();

const LINK_PATTERNS: Array<{
  pattern: RegExp;
  provider: ParsedControlLink["provider"];
}> = [
  // Lovense Standard API remote-control links (/t2/) and partner-control links (/c/)
  { pattern: /https?:\/\/api\.lovense-api\.com\/t2\/[^\s]+/i, provider: "lovense" },
  { pattern: /https?:\/\/lovense\.com\/c\/[^\s]+/i, provider: "lovense" },
  // Handyfeeling session/connect links and legacy /remote?<code> format
  { pattern: /https?:\/\/handyfeeling\.com\/(?:(?:sessions?|connect)\/[^\s]+|remote\?[^\s]+)/i, provider: "handyfeeling" },
  // xtoys room/toy sharing links and legacy /session/<code> format
  { pattern: /https?:\/\/xtoys\.app\/(?:r|rooms?|toys?|sessions?)\/[^\s]+/i, provider: "xtoys" },
];

/**
 * Scan a message for a known control link.
 */
export function detectControlLink(content: string): ParsedControlLink | null {
  for (const { pattern, provider } of LINK_PATTERNS) {
    const match = content.match(pattern);
    if (match?.[0]) {
      return { url: match[0], provider };
    }
  }
  return null;
}

export function createRaffle(
  raffleMessageId: string,
  channelId: string,
  link: ParsedControlLink,
  hostId: string,
): ActiveRaffle {
  const raffle: ActiveRaffle = {
    messageId: raffleMessageId,
    channelId,
    link,
    participants: new Set(),
    hostId,
  };
  activeRaffles.set(raffleMessageId, raffle);
  return raffle;
}

export function getRaffle(raffleMessageId: string): ActiveRaffle | undefined {
  return activeRaffles.get(raffleMessageId);
}

export function joinRaffle(raffleMessageId: string, userId: string): boolean {
  const raffle = activeRaffles.get(raffleMessageId);
  if (!raffle || raffle.participants.has(userId)) return false;
  raffle.participants.add(userId);
  return true;
}

/**
 * Pick a random winner, remove the raffle from memory, and return the winner's userId.
 * Returns null if nobody entered.
 */
export function pickWinner(raffleMessageId: string): string | null {
  const raffle = activeRaffles.get(raffleMessageId);
  activeRaffles.delete(raffleMessageId);
  if (!raffle || raffle.participants.size === 0) return null;
  const participants = [...raffle.participants];
  return participants[Math.floor(Math.random() * participants.length)] ?? null;
}

export function deleteRaffle(raffleMessageId: string): void {
  activeRaffles.delete(raffleMessageId);
}
