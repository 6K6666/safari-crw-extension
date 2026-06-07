import browser from "webextension-polyfill";
import * as Constants from "@/shared/constants";
import {
  type CRWMessage,
  type MessagePayloadByType,
  type MessageSource,
  MessageType,
} from "./type";
import {
  dispatchBackgroundMessage,
  isBackgroundMessageType,
  type BackgroundMessageHandlers,
} from "@/messaging/backgroundDispatcher";

/**
 * Helper to create typed messages
 */
export function createMessage<TType extends MessageType>(
  type: TType,
  source: MessageSource,
  ...payload: MessagePayloadByType[TType] extends undefined
    ? []
    : [payload: MessagePayloadByType[TType]]
): CRWMessage<TType> {
  if (payload.length === 0) {
    return { type, source };
  }
  return { type, source, payload: payload[0] };
}

/**
 * Share dispatcher analyzer for background service
 */
export function createBackgroundMessageHandler(
  handlers: BackgroundMessageHandlers<browser.Runtime.MessageSender>,
) {
  browser.runtime.onMessage.addListener(
    (msg: unknown, sender: browser.Runtime.MessageSender) => {
      const response = dispatchBackgroundMessage(msg, sender, handlers);
      if (response !== undefined) return response;

      const maybeMessage = msg as { type?: unknown };
      if (
        maybeMessage?.type !== undefined &&
        !isBackgroundMessageType(maybeMessage.type)
      ) {
        console.warn(
          `${Constants.LOG_PREFIX} Unknown message type:`,
          maybeMessage.type,
        );
      }
      return;
    },
  );
}
