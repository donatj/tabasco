import { escapeRegExp, normalize } from "../text";
import { urlparser } from "../utils";

export type TabFilter = (tab: chrome.tabs.Tab) => boolean;

export function AnyFilter(): boolean {
	return true;
}

export function BuildTextMatchFilter(text: string): TabFilter {
	const esc = escapeRegExp(normalize(text));
	const match = new RegExp(esc, 'i');

	return function TextMatchFilter(tab: chrome.tabs.Tab): boolean {
		return match.test(normalize(`${tab.title} ${tab.url}`));
	};
}

export function BuildLogicalNotFilter(filter: TabFilter) : TabFilter {
	return function LogicalNotFilter(n: chrome.tabs.Tab): boolean {
		return !filter(n);
	};
}

export function BuildLogicalAndFilter(filters: TabFilter[]): TabFilter {
	return function LogicalAndFilter(n: chrome.tabs.Tab): boolean {
		for (const f of filters) {
			if(!f(n)) {
				return false;
			}
		}

		return true;
	};
}

export function BuildHostFilter(host: string, exact: boolean = false) {
	const esc = escapeRegExp(host);
	const match = new RegExp(esc, 'i');

	return function HostFilter(n: chrome.tabs.Tab): boolean {
		if(!n.url) {
			return false;
		}

		if(exact) {
			return urlparser(n.url).host == host;
		} else {
			return match.test(urlparser(n.url).host);
		}
	};
}

export function AudibleFilter(tab: chrome.tabs.Tab) : boolean {
	return tab.audible || false;
}

export function MutedFilter(tab: chrome.tabs.Tab) : boolean {
	if(!tab.mutedInfo) {
		return false;
	}

	return tab.mutedInfo.muted;
}

export function PinnedFilter(tab: chrome.tabs.Tab) : boolean {
	return tab.pinned;
}

export function BuildTabIdFilter(n: number) {
	return function TabIdFilter(tab: chrome.tabs.Tab) : boolean {
		return tab.id == n;
	};
}

export function BuildWindowIdFilter(n: number) {
	return function WindowIdFilter(tab: chrome.tabs.Tab) : boolean {
		return tab.windowId == n;
	};
}