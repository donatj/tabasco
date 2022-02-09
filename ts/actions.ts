import { closeTabs, getAllWindows } from "./chrome.js";

export async function mergeAllWindows(window: chrome.windows.Window, tabs: chrome.tabs.Tab[]) {
	const windows = await getAllWindows();
	const windowsById: { [i: number]: chrome.windows.Window } = {};
	for (const w of windows) {
		if (!w.id) {
			continue;
		}
		windowsById[w.id] = w;
	}

	for (const t of tabs) {
		if (window.id == t.windowId || !t.id) {
			continue;
		}

		if (!(windowsById[t.windowId].state == 'fullscreen' && t.active)) {
			chrome.tabs.move(t.id, { windowId: window.id, index: -1 });
		}

		if (t.pinned) {
			chrome.tabs.update(t.id, { pinned: true });
		}
	}
}

export function findDupes(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
	const duplicates: chrome.tabs.Tab[] = [];

	const urls: string[] = [];
	for (const t of tabs) {
		const a = document.createElement('a');
		if (!t.url) {
			continue;
		}

		a.href = t.url;

		if (a.protocol != 'http:' && a.protocol != 'https:') {
			continue;
		}

		if (urls.indexOf(t.url) > -1) {
			duplicates.push(t);
		} else {
			urls.push(t.url);
		}
	}

	return duplicates;
}

export async function removeDupes(tabs: chrome.tabs.Tab[]) {
	const dupes = findDupes(tabs);

	for (const t of dupes) {
		await closeTabs(t);
	}
}

export async function newWindowWithTabs(tabs: chrome.tabs.Tab[]) {
	tabs = tabs.sort((a, b) => {
		if (a.highlighted) {
			return -1;
		}
		if (b.highlighted) {
			return 1;
		}

		return 0;
	});

	const first = tabs.pop();
	if (first && first.id) {
		const e = await chrome.windows.create({
			focused: false,
			tabId: first.id,
		});

		if (!e.id) {
			throw new Error('No window id');
		}

		for (const t of tabs) {
			if (!t.id) {
				continue;
			}
			await chrome.tabs.move(t.id, { windowId: e.id, index: -1 });
		}

		await chrome.windows.update(e.id, { focused: true });
	}
}
