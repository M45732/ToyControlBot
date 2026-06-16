export interface ParsedControlLink {
  readonly url: string;
  readonly provider: "lovense" | "handyfeeling" | "xtoys";
}

export interface ActiveRaffle {
  readonly messageId: string;
  readonly channelId: string;
  readonly link: ParsedControlLink;
  readonly participants: Set<string>;
  readonly hostId: string;
}
