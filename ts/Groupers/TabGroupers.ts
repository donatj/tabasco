import { SearchType } from "../Filters/SearchFilter";
import { urlparser } from "../utils";

export interface TabGroup {
	[key: string]: {
		title: string,
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
		const key = (i++).toString();

		hosts[key] = {
			favicon: t.favIconUrl,
			tabs: [t],
			title: key,

			searchType: SearchType.id,
			searchValue: `${t.id}`,
		};
	}

	return hosts;
}

export function byWindowGrouper(tabs: chrome.tabs.Tab[]): TabGroup {
	const hosts: TabGroup = {};

	for (const t of tabs) {
		if (!hosts[t.windowId]) {
			hosts[t.windowId] = {
				favicon: t.favIconUrl,
				tabs: [],
				title: `Window ${t.windowId}`,

				searchType: SearchType.window,
				searchValue: `${t.windowId}`,
			};
		}

		hosts[t.windowId].tabs.push(t);
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
				title: `Host: ${a.host}`,

				searchType: SearchType.host,
				searchValue: a.host,
			};
		}

		hosts[a.host].tabs.push(t);
	}

	return hosts;
}