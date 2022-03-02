
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

export function getCurrentWindow() {
	return chrome.windows.getCurrent();
}

export function getAllWindows() {
	return chrome.windows.getAll({ populate: true, windowTypes: ['normal', 'popup'] });
}

export async function focusTab(tab: chrome.tabs.Tab): Promise<void> {
	if (!tab.id) { return; }
	await chrome.tabs.update(tab.id, { highlighted: true });
	await chrome.windows.update(tab.windowId, { focused: true });
}

export async function closeTabs(tabs: chrome.tabs.Tab | chrome.tabs.Tab[]) {
	if (!Array.isArray(tabs)) {
		tabs = [tabs];
	}

	for (const t of tabs) {
		if (!t.id) {
			continue;
		}
		await chrome.tabs.remove(t.id);
	}
}

export function getTabGroup(groupId: number) {
	return chrome.tabGroups.get(groupId);
}

export class TabGroupLookupMemoizer {

	private memo: { [key: number]: chrome.tabGroups.TabGroup } = {}

	async getTabGroup(groupId: number) {
		if (this.memo[groupId]) {
			return this.memo[groupId];
		}
		const tg = await getTabGroup(groupId)
		this.memo[groupId] = tg

		return tg
	}
}