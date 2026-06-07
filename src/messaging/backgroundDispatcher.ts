import { decodeCargoEntries, decodePageContext } from "@/shared/types";
import {
  type AnyCRWMessage,
  type MessagePayloadByType,
  MessageType,
} from "@/messaging/type";

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isBackgroundMessageType = (
  value: unknown,
): value is MessageType => {
  return (
    value === MessageType.PAGE_CONTEXT_UPDATE ||
    value === MessageType.MATCH_RESULTS_UPDATED ||
    value === MessageType.FORCE_SHOW_INLINE_POPUP ||
    value === MessageType.TOGGLE_INLINE_POPUP ||
    value === MessageType.OPEN_OPTIONS_PAGE ||
    value === MessageType.REFRESH_DATASET_NOW
  );
};

const decodeMessage = (value: unknown): AnyCRWMessage | null => {
  if (!isObjectRecord(value)) return null;
  if (!isBackgroundMessageType(value.type)) return null;
  return value as AnyCRWMessage;
};

export type BackgroundMessageHandlers<TSender> = {
  onPageContextUpdated?: (
    payload: MessagePayloadByType[MessageType.PAGE_CONTEXT_UPDATE],
    sender: TSender,
  ) => unknown | Promise<unknown>;
  onForceShowInlinePopup?: (
    payload: MessagePayloadByType[MessageType.FORCE_SHOW_INLINE_POPUP],
    sender: TSender,
  ) => unknown | Promise<unknown>;
  onToggleInlinePopup?: (
    payload: MessagePayloadByType[MessageType.TOGGLE_INLINE_POPUP],
    sender: TSender,
  ) => unknown | Promise<unknown>;
  onOpenOptionsPage?: (sender: TSender) => void | Promise<void>;
  onRefreshDatasetNow?: (sender: TSender) => unknown | Promise<unknown>;
};

export const dispatchBackgroundMessage = <TSender>(
  msg: unknown,
  sender: TSender,
  handlers: BackgroundMessageHandlers<TSender>,
): unknown | Promise<unknown> => {
  const decodedMessage = decodeMessage(msg);
  if (!decodedMessage) return;

  switch (decodedMessage.type) {
    case MessageType.PAGE_CONTEXT_UPDATE: {
      const payload = decodePageContext(decodedMessage.payload);
      if (!payload) return;
      return handlers.onPageContextUpdated?.(payload, sender);
    }
    case MessageType.FORCE_SHOW_INLINE_POPUP:
      return handlers.onForceShowInlinePopup?.(
        decodeCargoEntries(decodedMessage.payload),
        sender,
      );
    case MessageType.TOGGLE_INLINE_POPUP:
      return handlers.onToggleInlinePopup?.(
        decodeCargoEntries(decodedMessage.payload),
        sender,
      );
    case MessageType.OPEN_OPTIONS_PAGE:
      return handlers.onOpenOptionsPage?.(sender);
    case MessageType.REFRESH_DATASET_NOW:
      return handlers.onRefreshDatasetNow?.(sender);
    default:
      return;
  }
};
