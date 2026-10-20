import type { AnyCRWMessage } from "@/messaging/type";
import { MessageType } from "@/messaging/type";
import type { CargoEntry } from "@/shared/types";

export const getShortcutMessage = (
  command: string,
  matches: CargoEntry[],
): AnyCRWMessage | null => {
  switch (command) {
    case "show-inline-popup":
      return {
        type: MessageType.FORCE_SHOW_INLINE_POPUP,
        source: "background",
        payload: matches,
      };
    case "hide-inline-popup":
      return {
        type: MessageType.HIDE_INLINE_POPUP,
        source: "background",
      };
    case "toggle-site-snooze":
      return {
        type: MessageType.TOGGLE_SNOOZE_CURRENT_SITE,
        source: "background",
        payload: matches,
      };
    case "toggle-site-ignore":
      return {
        type: MessageType.TOGGLE_SUPPRESS_CURRENT_SITE,
        source: "background",
        payload: matches,
      };
    default:
      return null;
  }
};
