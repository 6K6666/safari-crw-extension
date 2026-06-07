import browser from "webextension-polyfill";

import * as Messaging from "@/messaging";
import { MessageSource, MessageType } from "@/messaging/type";
import { readTabMatches } from "@/shared/storage";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const openExtensionOptions = async (
  source: MessageSource,
): Promise<void> => {
  let firstError: unknown;

  try {
    await browser.runtime.openOptionsPage();
    return;
  } catch (error) {
    firstError = error;
  }

  if (source !== "background") {
    try {
      await browser.runtime.sendMessage(
        Messaging.createMessage(MessageType.OPEN_OPTIONS_PAGE, source),
      );
      return;
    } catch (error) {
      firstError = firstError || error;
    }
  }

  try {
    await browser.tabs.create({
      url: browser.runtime.getURL("options.html"),
    });
    return;
  } catch (error) {
    firstError = firstError || error;
  }

  throw new Error(getErrorMessage(firstError));
};

export const forceShowInlinePopupForActiveTab = async (): Promise<boolean> => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tabId = tab?.id;
  if (!tabId) return false;

  const matches = await readTabMatches(tabId);
  const message = Messaging.createMessage(
    MessageType.FORCE_SHOW_INLINE_POPUP,
    "popup",
    matches,
  );
  let firstError: unknown;
  const sendDirectlyToTab = async (): Promise<boolean> => {
    const response = await browser.tabs.sendMessage(tabId, message);
    return response === true;
  };

  try {
    const response = await browser.runtime.sendMessage(message);
    if (response === true) {
      if (matches.length > 0) return true;
      return await sendDirectlyToTab();
    }
    if (response === false) return false;
  } catch (error) {
    firstError = error;
  }

  try {
    return await sendDirectlyToTab();
  } catch (error) {
    const errorMessage = firstError
      ? `${getErrorMessage(firstError)}; ${getErrorMessage(error)}`
      : getErrorMessage(error);
    const wrappedError = new Error(errorMessage) as Error & { cause?: unknown };
    wrappedError.cause = error;
    throw wrappedError;
  }
};
