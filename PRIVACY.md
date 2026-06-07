# Privacy Policy

## Permissions

### Tabs Permission

The extension uses the tabs permission to detect the currently active tab and read its URL/title so it can check whether the page, site, product, or service the user is viewing has a matching article on the Consumer Rights Wiki. It also listens for tab changes/navigation so the popup and notification status can update when the user switches tabs or opens a new page. The extension does not use tabs to collect browsing history.

### Storage Permission

The extension uses storage to save user preferences and local extension state, such as notification settings, dismissed alerts, and cached match results/settings needed to avoid repeated checks and improve performance. This data is stored locally by Safari and is only used to provide the extension’s functionality. The extension does not store sensitive personal data.

### Host Permissions

The extension requests host permissions because it must check the URL of the page the user is currently viewing (across websites, stores, and service pages) to determine whether a related article exists on the Consumer Rights Wiki. The extension compares the current page against a maintained JSON dataset hosted on GitHub (raw.githubusercontent.com) and uses host access only for page matching and showing the popup/notification result. Host permissions are not used for tracking, advertising, or unrelated data collection.

In Safari, this broad host access may be shown as an "All Websites" permission. That wording reflects the Safari permission scope needed to compare the active page against Consumer Rights Wiki match data. It does not change how the extension uses the access: page checks happen for matching and notification features, not for tracking, advertising, or collecting browsing history.
