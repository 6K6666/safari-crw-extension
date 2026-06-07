import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import {
  getSiteScopeHostname,
  isHostnameInSiteScopeList,
  normalizeHostname,
  removeMatchingSiteScopes,
} from "@/shared/siteScope";
import { CargoEntry } from "@/shared/types";
import {
  readSuppressedDomains,
  readTabMatches,
  readWarningsEnabled,
  writeSuppressedDomains,
  writeWarningsEnabled,
} from "@/shared/storage";
import {
  forceShowInlinePopupForActiveTab,
  openExtensionOptions,
} from "@/shared/extensionActions";
import * as Constants from "@/shared/constants";

const POPUP_BG = "#004080";
const POPUP_TEXT = "#FFFFFF";
const POPUP_FONT_FAMILY = "ui-sans-serif,system-ui,sans-serif";

const popupShellStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "240px",
  boxSizing: "border-box",
  background: `var(--crw-popup-shell-background, ${POPUP_BG})`,
  color: POPUP_TEXT,
  fontFamily: POPUP_FONT_FAMILY,
  position: "relative",
};

const footerButtonBaseStyle: React.CSSProperties = {
  borderRadius: "10px",
  padding: "7px 10px",
  fontSize: "12px",
  fontWeight: 700,
  minHeight: "34px",
  minWidth: 0,
  flex: "1 1 108px",
  textAlign: "center",
  whiteSpace: "normal",
  lineHeight: 1.2,
};

const safeRuntimeUrl = (assetPath: string): string => {
  try {
    return browser.runtime.getURL(assetPath);
  } catch {
    return `/${assetPath}`;
  }
};

const entryUrl = (entry: CargoEntry): string => {
  return `https://consumerrights.wiki/${encodeURIComponent(entry.PageName)}`;
};

const getEntryDescription = (entry: CargoEntry): string => {
  const description = entry.Description?.trim();
  if (description) return description;
  return "No description available.";
};

const Popup = () => {
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("unknown");
  const [tabId, setTabId] = useState<number | null>(null);
  const [articles, setArticles] = useState<CargoEntry[]>([]);
  const [suppressed, setSuppressed] = useState(false);
  const [warningsEnabled, setWarningsEnabled] = useState(true);
  const [showInlineError, setShowInlineError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tabId = tab?.id;
        const url = tab?.url;
        const nextWarningsEnabled = await readWarningsEnabled();
        setTabId(tabId ?? null);
        setWarningsEnabled(nextWarningsEnabled);

        if (url) {
          const normalizedDomain = normalizeHostname(new URL(url).hostname);
          setDomain(normalizedDomain);
          const suppressedDomains = await readSuppressedDomains();
          setSuppressed(
            isHostnameInSiteScopeList(normalizedDomain, suppressedDomains),
          );
        }

        if (!tabId) return;

        const results = await readTabMatches(tabId);
        setArticles(results);
      } catch {
        setDomain("unknown");
        setSuppressed(false);
        setWarningsEnabled(true);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const suppressDomain = async () => {
    if (!domain || domain === "unknown") return;
    const existing = await readSuppressedDomains();
    const siteScope = getSiteScopeHostname(domain);
    if (!siteScope || isHostnameInSiteScopeList(domain, existing)) {
      window.close();
      return;
    }

    await writeSuppressedDomains([...existing, siteScope]);
    setSuppressed(true);
    window.close();
  };

  const unsuppressDomain = async () => {
    if (!domain || domain === "unknown") return;
    const existing = await readSuppressedDomains();
    const next = removeMatchingSiteScopes(existing, domain);
    await writeSuppressedDomains(next);
    setSuppressed(false);
    window.close();
  };

  const openOptions = () => {
    void openExtensionOptions("popup");
  };

  const openWiki = () => {
    void browser.tabs.create({ url: "https://consumerrights.wiki" });
  };

  const showInlinePopup = async () => {
    setShowInlineError(null);
    try {
      const didSendMessage = await forceShowInlinePopupForActiveTab();
      if (!didSendMessage) {
        setShowInlineError("Open a webpage to show the inline alert.");
        return;
      }
      window.close();
    } catch (error) {
      console.error(
        `${Constants.LOG_PREFIX} Failed to show inline alert`,
        error,
      );
      setShowInlineError("Refresh the page, then try showing the alert again.");
    }
  };

  const enableAutomaticAlerts = async () => {
    await writeWarningsEnabled(true);
    setWarningsEnabled(true);
  };

  const closePopup = () => {
    window.close();
  };

  const renderSettingsButton = () => {
    return (
      <button
        type="button"
        onClick={openOptions}
        aria-label="Open extension settings"
        title="Open settings"
        style={{
          border: "1px solid rgba(255,255,255,0.38)",
          background: "transparent",
          color: "#FFFFFF",
          borderRadius: "10px",
          width: "32px",
          height: "32px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <img
          src={safeRuntimeUrl("settings.svg")}
          alt=""
          aria-hidden="true"
          style={{
            width: "18px",
            height: "18px",
            display: "block",
            filter: "brightness(0) saturate(100%) invert(100%)",
            opacity: 0.9,
          }}
        />
      </button>
    );
  };

  const renderDismissButton = () => {
    return (
      <button
        type="button"
        onClick={closePopup}
        aria-label="Dismiss popup"
        title="Dismiss"
        style={{
          border: "1px solid rgba(255,255,255,0.38)",
          background: "transparent",
          color: "#FFFFFF",
          borderRadius: "10px",
          width: "32px",
          height: "32px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        X
      </button>
    );
  };

  const renderTopRightActions = () => {
    return (
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          gap: "8px",
          zIndex: 1,
        }}
      >
        {renderSettingsButton()}
        {renderDismissButton()}
      </div>
    );
  };

  const renderAutomaticAlertsDisabled = () => {
    if (warningsEnabled) return null;

    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "10px",
          padding: "8px 10px",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <div
            style={{
              fontSize: "12px",
              lineHeight: 1.25,
              fontWeight: 700,
            }}
          >
            Automatic page alerts are off
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "11px",
              lineHeight: 1.25,
              opacity: 0.82,
            }}
          >
            Toolbar alerts still work.
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void enableAutomaticAlerts();
          }}
          style={{
            flexShrink: 0,
            border: "1px solid #FFFFFF",
            background: "#FFFFFF",
            color: "#004080",
            borderRadius: "8px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Turn on
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          ...popupShellStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {renderTopRightActions()}
        Checking Consumer Rights Wiki matches...
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div
        style={{
          ...popupShellStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          textAlign: "center",
          padding: "20px",
        }}
      >
        {renderTopRightActions()}
        {renderAutomaticAlertsDisabled()}
        <img
          src={safeRuntimeUrl("crw_logo.png")}
          alt="Consumer Rights Wiki"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "8px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            lineHeight: 1.2,
            fontWeight: 700,
          }}
        >
          No mentions found on the Consumer Rights Wiki.
        </h2>
        <button
          type="button"
          disabled={!tabId}
          onClick={() => {
            void showInlinePopup();
          }}
          style={{
            border: "1px solid #FFFFFF",
            background: "#FFFFFF",
            color: "#004080",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: tabId ? "pointer" : "not-allowed",
            opacity: tabId ? 1 : 0.65,
          }}
        >
          Show on this page
        </button>
        {showInlineError ? (
          <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.86 }}>
            {showInlineError}
          </div>
        ) : null}
      </div>
    );
  }

  if (suppressed) {
    return (
      <div
        style={{
          ...popupShellStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        {renderTopRightActions()}
        {renderAutomaticAlertsDisabled()}
        <div>Alerts are disabled for {domain}.</div>
        <button
          type="button"
          onClick={() => {
            void unsuppressDomain();
          }}
          style={{
            border: "1px solid #FFFFFF",
            background: "#FFFFFF",
            color: "#004080",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Enable alerts for this site
        </button>
        <button
          type="button"
          disabled={!tabId}
          onClick={() => {
            void showInlinePopup();
          }}
          style={{
            border: "1px solid rgba(255,255,255,0.38)",
            background: "transparent",
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: tabId ? "pointer" : "not-allowed",
            opacity: tabId ? 1 : 0.65,
          }}
        >
          Show on this page
        </button>
        {showInlineError ? (
          <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.86 }}>
            {showInlineError}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        ...popupShellStyle,
        padding: "14px",
        paddingTop: "52px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      {renderTopRightActions()}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: 0,
        }}
      >
        <img
          src={safeRuntimeUrl("crw_logo.png")}
          alt="Consumer Rights Wiki"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Consumer Rights Wiki
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.82,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {domain}
          </div>
        </div>
      </div>

      {renderAutomaticAlertsDisabled()}

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "10px",
          padding: "8px 10px",
          fontSize: "12px",
          opacity: 0.9,
        }}
      >
        {articles.length} matched page{articles.length === 1 ? "" : "s"}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
          minHeight: 0,
          flex: 1,
        }}
      >
        {articles.map((entry) => (
          <div
            key={`${entry._type}:${entry.PageID}`}
            style={{
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "10px",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 auto" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.PageName}
              </div>
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "11px",
                  lineHeight: 1.3,
                  opacity: 0.85,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                }}
              >
                {getEntryDescription(entry)}
              </div>
            </div>
            <a
              href={entryUrl(entry)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                border: "1px solid #FFFFFF",
                background: "#FFFFFF",
                color: "#004080",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
                alignSelf: "center",
              }}
            >
              View
            </a>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: "8px",
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={openWiki}
          style={{
            ...footerButtonBaseStyle,
            border: "1px solid rgba(255,255,255,0.38)",
            background: "transparent",
            color: "#FFFFFF",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Open Wiki
        </button>
        <button
          type="button"
          disabled={!tabId}
          onClick={() => {
            void showInlinePopup();
          }}
          style={{
            ...footerButtonBaseStyle,
            border: "1px solid rgba(255,255,255,0.38)",
            background: "transparent",
            color: "#FFFFFF",
            fontWeight: 600,
            cursor: tabId ? "pointer" : "not-allowed",
            opacity: tabId ? 1 : 0.65,
          }}
        >
          Show on page
        </button>
        <button
          type="button"
          onClick={() => {
            void suppressDomain();
          }}
          style={{
            ...footerButtonBaseStyle,
            border: "1px solid #FFFFFF",
            background: "#FFFFFF",
            color: "#004080",
            cursor: "pointer",
          }}
        >
          Don&apos;t show for this site
        </button>
      </div>
      {showInlineError ? (
        <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.86 }}>
          {showInlineError}
        </div>
      ) : null}
    </div>
  );
};

export default Popup;
