import test from "node:test";
import assert from "node:assert/strict";

import { dispatchBackgroundMessage } from "../src/messaging/backgroundDispatcher.ts";
import { MessageType } from "../src/messaging/type.ts";
import { entry } from "./helpers.ts";

const pageContext = {
  url: "https://www.amazon.com/",
  hostname: "www.amazon.com",
  title: "Amazon",
  meta: {
    description: "Amazon",
  },
};

test("background dispatcher returns match update responses for page context updates", async () => {
  const matches = [
    entry({
      _type: "Company",
      PageID: "company-amazon",
      PageName: "Amazon",
    }),
  ];
  const sender = { tab: { id: 42 } };
  let receivedHostname = "";
  let receivedTabId = 0;

  const response = await dispatchBackgroundMessage(
    {
      type: MessageType.PAGE_CONTEXT_UPDATE,
      source: "content",
      payload: pageContext,
    },
    sender,
    {
      onPageContextUpdated(payload, messageSender) {
        receivedHostname = payload.hostname;
        receivedTabId = messageSender.tab.id;
        return {
          type: MessageType.MATCH_RESULTS_UPDATED,
          source: "background",
          payload: matches,
        };
      },
    },
  );

  assert.equal(receivedHostname, "www.amazon.com");
  assert.equal(receivedTabId, 42);
  assert.deepEqual(response, {
    type: MessageType.MATCH_RESULTS_UPDATED,
    source: "background",
    payload: matches,
  });
});

test("background dispatcher ignores invalid page context payloads", async () => {
  let called = false;

  const response = await dispatchBackgroundMessage(
    {
      type: MessageType.PAGE_CONTEXT_UPDATE,
      source: "content",
      payload: {
        hostname: "www.amazon.com",
      },
    },
    { tab: { id: 42 } },
    {
      onPageContextUpdated() {
        called = true;
      },
    },
  );

  assert.equal(called, false);
  assert.equal(response, undefined);
});

test("background dispatcher routes force-show inline popup messages", async () => {
  const matches = [
    entry({
      _type: "Company",
      PageID: "company-amazon",
      PageName: "Amazon",
    }),
  ];
  const sender = { id: "popup" };
  let receivedPageId = "";
  let receivedSenderId = "";

  const response = await dispatchBackgroundMessage(
    {
      type: MessageType.FORCE_SHOW_INLINE_POPUP,
      source: "popup",
      payload: matches,
    },
    sender,
    {
      onForceShowInlinePopup(payload, messageSender) {
        receivedPageId = payload[0]?.PageID ?? "";
        receivedSenderId = messageSender.id;
        return true;
      },
    },
  );

  assert.equal(receivedPageId, "company-amazon");
  assert.equal(receivedSenderId, "popup");
  assert.equal(response, true);
});

test("background dispatcher preserves empty force-show payloads", async () => {
  let receivedLength = -1;

  const response = await dispatchBackgroundMessage(
    {
      type: MessageType.FORCE_SHOW_INLINE_POPUP,
      source: "popup",
      payload: [],
    },
    { id: "popup" },
    {
      onForceShowInlinePopup(payload) {
        receivedLength = payload.length;
        return true;
      },
    },
  );

  assert.equal(receivedLength, 0);
  assert.equal(response, true);
});
