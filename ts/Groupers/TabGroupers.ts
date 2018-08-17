import { urlparser } from "../utils";
import { SearchType } from "../Filters/SearchFilter";

export interface TabGroup {
	[key: string]: {
		favicon: string | undefined,
		tabs: chrome.tabs.Tab[],

		searchType: SearchType,
		searchValue: string,
	};
}

export function anyGrouper(tabs: chrome.tabs.Tab[]): TabGroup {
	const hosts: TabGroup = {};

	let i = 0;
	for (const t of tabs) {
		hosts[(i++).toString()] = {
			favicon: t.favIconUrl,
			tabs: [t],

			searchType: SearchType.id,
			searchValue: `${t.id}`,
		};
	}

	return hosts;
}

export function byWindowGrouper(tabs: chrome.tabs.Tab[]): TabGroup {
	const hosts: TabGroup = {};

	for (const t of tabs) {
		const key = `Window ${t.windowId}`;

		if (!hosts[key]) {
			hosts[key] = {
				favicon: t.favIconUrl,
				tabs: [],

				searchType: SearchType.window,
				searchValue: `${t.windowId}`,
			};
		}

		hosts[key].tabs.push(t);
	}

	return hosts;
}

export function byDomainGrouper(tabs: chrome.tabs.Tab[]): TabGroup {
	const hosts: TabGroup = {};

	for (const t of tabs) {
		if (!t.url) {
			continue;
		}

		const a = urlparser(t.url);

		if (a.protocol != 'http:' && a.protocol != 'https:') {
			continue;
		}

		if (!hosts[a.host]) {
			hosts[a.host] = {
				favicon: t.favIconUrl,
				tabs: [],

				searchType: SearchType.host,
				searchValue: a.host,
			};
		}

		hosts[a.host].tabs.push(t);
	}

	return hosts;
}