export type SessionMode = "gangbang" | "orgy";

export interface ActiveSession {
  readonly sessionId: string;
  readonly messageId: string;
  readonly channelId: string;
  readonly guildId: string;
  readonly ownerId: string;
  readonly mode: SessionMode;
}
