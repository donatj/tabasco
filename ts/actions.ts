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

function findDupes(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
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

export async function moveTabsToWindow(window: chrome.windows.Window, tabs: chrome.tabs.Tab[]) {
	if (!window.id) {
		throw new Error('No window id');
	}

	const tabIds = tabs
		.filter((t) => t.id !== undefined)
		.map((t) => t.id as number);

	if (tabIds.length > 0) {
		await chrome.tabs.move(tabIds, { windowId: window.id, index: -1 });
	}

	await chrome.windows.update(window.id, { focused: true });
}

export async function newWindowWithTabs(tabs: chrome.tabs.Tab[]) {
	const currentWindow = await chrome.windows.getCurrent()

	tabs = tabs.sort((a, b) => {
		if (a.windowId == currentWindow.id && b.windowId != currentWindow.id) {
			return 1;
		}
		if (a.windowId != currentWindow.id && b.windowId == currentWindow.id) {
			return -1;
		}

		if (a.highlighted) {
			return 1;
		}
		if (b.highlighted) {
			return -1;
		}

		return 0;
	});

	const first = tabs.shift();
	if (!first || !first.id) {
		return;
	}

	// The window needs a tab to start with, so we use the first tab
	const e = await chrome.windows.create({
		focused: false,
		tabId: first.id,
	});

	if (!e.id) {
		throw new Error('No window id');
	}

	const tabIds: number[] = [];
	for (const t of tabs) {
		if (!t.id) {
			continue;
		}
		tabIds.push(t.id);
	}

	if (tabIds.length > 0) {
		await chrome.tabs.move(tabIds, { windowId: e.id, index: -1 });
	}
	await chrome.windows.update(e.id, { focused: true });
}

export class ActionBarManager {

	private multipleWindows: boolean = false;
	private dupesExist: boolean = false;
	private isSearching: boolean = false;

	constructor(
		private wrap: HTMLElement,
		private btnMergeAll: HTMLLIElement,
		private btnRemoveDupes: HTMLLIElement,
		private btnMoveToNewWindow: HTMLLIElement,
		private btnAdopt: HTMLLIElement,
	) {}

	public updateTabs(tabs: chrome.tabs.Tab[]) {
		this.dupesExist = findDupes(tabs).length != 0;
		this.multipleWindows = this.hasMultipleWindows(tabs);
		this.render();
	}

	public updateSearch(search: string | null) {
		this.isSearching = search !== null;
		this.render();
	}

	public render() {
		this.wrap.style.display = this.multipleWindows || this.dupesExist || this.isSearching ? '' : 'none';
		this.btnMergeAll.style.display = (!this.isSearching && this.multipleWindows) ? '' : 'none';
		this.btnRemoveDupes.style.display = (!this.isSearching && this.dupesExist) ? '' : 'none';
		this.btnMoveToNewWindow.style.display = this.isSearching ? '' : 'none';
		this.btnAdopt.style.display = this.isSearching ? '' : 'none';
	}

	private hasMultipleWindows(tabs: chrome.tabs.Tab[]): boolean {
		let lastWindowId = -1;
		for (const tab of tabs) {
			if (lastWindowId != tab.windowId && lastWindowId != -1) {
				return true;
			}

			lastWindowId = tab.windowId
		}

		return false;
	}
}
