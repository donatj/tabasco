import { TabGroup } from "../Controllers/DomainListController";
import { urlparser } from "../utils";

export function anyGrouper(tabs: chrome.tabs.Tab[]): TabGroup {
	const hosts: TabGroup = {};

	let i = 0;
	for (const t of tabs) {
		hosts[(i++).toString()] = {
			favicon: t.favIconUrl,
			tabs: [ t ],
		};
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
			};
		}

		hosts[a.host].tabs.push(t);
	}

	return hosts;
}