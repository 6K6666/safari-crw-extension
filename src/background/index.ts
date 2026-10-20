// /src/background/index.ts
import browser from "webextension-polyfill";
import * as Constants from "@/shared/constants";
import * as Matching from "@/lib/matching/matching";
import * as Dataset from "@/lib/dataset";
import * as Messaging from "@/messaging";
import { type AnyCRWMessage, MessageType } from "@/messaging/type";
import { CargoEntry } from "@/shared/types";
import { readDatasetCacheRefreshInfo, readTabMatches } from "@/shared/storage";
import { openExtensionOptions } from "@/shared/extensionActions";

let datasetCache: CargoEntry[] = [];
let datasetLoadPromise: Promise<CargoEntry[]> | null = null;
let nextDatasetRefreshCheckAt = 0;

const getBadgeText = (count: number): string => {
  if (count <= 0) return "";
  if (count > 3) return "3+";
  return String(count);
};

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const sendMessageToTab = async (
  tabId: number,
  message: AnyCRWMessage,
  attempt = 0,
): Promise<boolean> => {
  try {
    const response = await browser.tabs.sendMessage(tabId, message);
    return response === true;
  } catch {
    if (attempt >= 2) return false;
    const delayMs = 250 * (attempt + 1);
    await wait(delayMs);
    return await sendMessageToTab(tabId, message, attempt + 1);
  }
};

const readDatasetRefreshInfo = async (): Promise<{
  fetchedAt: number | null;
  lastCheckedAt: number | null;
}> => {
  return await readDatasetCacheRefreshInfo();
};

const getMessageTargetTabId = async (
  sender: browser.Runtime.MessageSender,
): Promise<number | null> => {
  if (sender.tab?.id) return sender.tab.id;

  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab?.id ?? null;
};

const handleShortcutCommand = async (command: string): Promise<void> => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tabId = tab?.id;
  if (!tabId) return;

  if (command === "hide-inline-popup") {
    void sendMessageToTab(
      tabId,
      Messaging.createMessage(MessageType.HIDE_INLINE_POPUP, "background"),
    );
    return;
  }

  if (
    command !== "show-inline-popup" &&
    command !== "toggle-site-snooze" &&
    command !== "toggle-site-ignore"
  ) {
    return;
  }

  const matches = await readTabMatches(tabId);

  switch (command) {
    case "show-inline-popup":
      void sendMessageToTab(
        tabId,
        Messaging.createMessage(
          MessageType.FORCE_SHOW_INLINE_POPUP,
          "background",
          matches,
        ),
      );
      break;
    case "toggle-site-snooze":
      void sendMessageToTab(
        tabId,
        Messaging.createMessage(
          MessageType.TOGGLE_SNOOZE_CURRENT_SITE,
          "background",
          matches,
        ),
      );
      break;
    case "toggle-site-ignore":
      void sendMessageToTab(
        tabId,
        Messaging.createMessage(
          MessageType.TOGGLE_SUPPRESS_CURRENT_SITE,
          "background",
          matches,
        ),
      );
      break;
  }
};

const relayInlinePopupMessageToActiveTab = async (
  matches: CargoEntry[],
  sender: browser.Runtime.MessageSender,
  type: MessageType.FORCE_SHOW_INLINE_POPUP | MessageType.TOGGLE_INLINE_POPUP,
): Promise<boolean> => {
  const tabId = await getMessageTargetTabId(sender);
  if (!tabId) return false;

  return await sendMessageToTab(
    tabId,
    Messaging.createMessage(type, "background", matches),
  );
};

const loadDatasetCache = async (options?: {
  forceRefresh?: boolean;
}): Promise<CargoEntry[]> => {
  const forceRefresh = options?.forceRefresh === true;
  const now = Date.now();

  if (
    !forceRefresh &&
    datasetCache.length > 0 &&
    now < nextDatasetRefreshCheckAt
  ) {
    return datasetCache;
  }

  if (datasetLoadPromise) return datasetLoadPromise;

  datasetLoadPromise = (async () => {
    const loaded = forceRefresh
      ? await Dataset.refreshNow()
      : await Dataset.load();
    datasetCache = loaded.all;
    const refreshIntervalMs = await Dataset.readConfiguredRefreshIntervalMs();
    nextDatasetRefreshCheckAt = Date.now() + refreshIntervalMs;
    return datasetCache;
  })();

  try {
    return await datasetLoadPromise;
  } catch (error) {
    console.log(`${Constants.LOG_PREFIX} Dataset load failed`, error);
    datasetCache = [];
    nextDatasetRefreshCheckAt = 0;
    return datasetCache;
  } finally {
    datasetLoadPromise = null;
  }
};

browser.runtime.onInstalled.addListener(async () => {
  console.log(
    `${Constants.LOG_PREFIX} Extension installed/updated. Loading dataset...`,
  );

  await loadDatasetCache();
});

browser.runtime.onStartup.addListener(async () => {
  await loadDatasetCache();
});

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes[Constants.STORAGE.DATA_REFRESH_INTERVAL_MS]) {
    nextDatasetRefreshCheckAt = 0;
  }
});

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log(
    `${Constants.LOG_PREFIX} Active tab has been changed. TabId:${tabId}`,
  );

  const results = await readTabMatches(tabId);

  browser.action.setBadgeText({
    tabId,
    text: getBadgeText(results.length),
  });
  browser.action.setBadgeBackgroundColor({ tabId, color: "#FF5722" });
});

browser.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  if (!tabId) return;

  const matches = await readTabMatches(tabId);

  void sendMessageToTab(
    tabId,
    Messaging.createMessage(
      MessageType.TOGGLE_INLINE_POPUP,
      "background",
      matches,
    ),
  );
});

browser.commands?.onCommand?.addListener((command) => {
  void handleShortcutCommand(command);
});

Messaging.createBackgroundMessageHandler({
  onOpenOptionsPage() {
    return openExtensionOptions("background");
  },
  onForceShowInlinePopup(matches, sender) {
    return relayInlinePopupMessageToActiveTab(
      matches,
      sender,
      MessageType.FORCE_SHOW_INLINE_POPUP,
    );
  },
  onToggleInlinePopup(matches, sender) {
    return relayInlinePopupMessageToActiveTab(
      matches,
      sender,
      MessageType.TOGGLE_INLINE_POPUP,
    );
  },
  async onRefreshDatasetNow() {
    await loadDatasetCache({ forceRefresh: true });
    return await readDatasetRefreshInfo();
  },
  async onPageContextUpdated(payload, sender) {
    const tabId = sender.tab?.id;
    if (!tabId) return;
    const dataset = await loadDatasetCache();
    const storageKey = Constants.STORAGE.MATCHES(tabId);

    const matches = Matching.matchByPageContext(dataset, payload);

    await browser.storage.local.set({
      [storageKey]: matches,
    });

    browser.action.setBadgeText({
      tabId,
      text: getBadgeText(matches.length),
    });
    browser.action.setBadgeBackgroundColor({ tabId, color: "#FF5722" });

    return Messaging.createMessage(
      MessageType.MATCH_RESULTS_UPDATED,
      "background",
      matches,
    );
  },
});

void loadDatasetCache();
