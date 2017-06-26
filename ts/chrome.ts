namespace crx { 

	export async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
		const windows = await getAllWindows();
		const tabs: chrome.tabs.Tab[] = [];

		for (const w of windows) {
			for (const t of w.tabs || []) {
				tabs.push(t);
			}
		}

		return tabs;
	}

	export function getCurrentWindow(): Promise<chrome.windows.Window> {
		return new Promise<chrome.windows.Window>((resolve) => {
			chrome.windows.getCurrent((currentWindow) => { resolve(currentWindow); });
		});
	}

	export function getAllWindows(): Promise<chrome.windows.Window[]> {
		return new Promise<chrome.windows.Window[]>((resolve) => {
			chrome.windows.getAll({ populate: true }, (windows) => {
				resolve(windows);
			});
		});
	}

	export function focusTab(tab: chrome.tabs.Tab) {
		if (!tab.id) { return; }
		chrome.tabs.update(tab.id, { selected: true });
		chrome.windows.update(tab.windowId, { focused: true });
	}

	export function closeTabs(tabs: chrome.tabs.Tab | chrome.tabs.Tab[]) {
		if (!Array.isArray(tabs)) {
			tabs = [tabs];
		}

		for (const t of tabs) {
			if (!t.id) {
				continue;
			}
			chrome.tabs.remove(t.id);
		}
	}
}