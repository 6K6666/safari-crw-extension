import test from "node:test";
import assert from "node:assert/strict";

import { getInlinePopupInstruction } from "../src/content/messageRouting.ts";
import { getShortcutMessage } from "../src/background/shortcutMessages.ts";
import { MessageType } from "../src/messaging/type.ts";
import { entry } from "./helpers.ts";

const matches = [
  entry({
    _type: "Company",
    PageID: "company-example",
    PageName: "Example",
  }),
];

test("site snooze shortcut reaches the content snooze toggle with tab matches", () => {
  const message = getShortcutMessage("toggle-site-snooze", matches);

  assert.deepEqual(message, {
    type: MessageType.TOGGLE_SNOOZE_CURRENT_SITE,
    source: "background",
    payload: matches,
  });
  assert.deepEqual(getInlinePopupInstruction(message), {
    action: "toggleSnooze",
    matches,
    ignorePreferences: true,
  });
});

test("site ignore shortcut reaches the content ignore toggle with tab matches", () => {
  const message = getShortcutMessage("toggle-site-ignore", matches);

  assert.deepEqual(message, {
    type: MessageType.TOGGLE_SUPPRESS_CURRENT_SITE,
    source: "background",
    payload: matches,
  });
  assert.deepEqual(getInlinePopupInstruction(message), {
    action: "toggleSuppress",
    matches,
    ignorePreferences: true,
  });
});
