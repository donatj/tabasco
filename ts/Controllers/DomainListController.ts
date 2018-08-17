import { closeTabs, focusTab, getAllTabs } from "../chrome";
import { AnyFilter } from "../Filters/TabFilter";
import { AbstractBaseController } from "./AbstractController";
import { ListController } from "./ListController";
import { TabLiButtonController } from "./TabLiButtonController";
import { TabLiController } from "./TabLiController";
import { urlparser } from "../utils";

export interface TabGroup {
	[key: string]: {
		favicon: string | undefined,
		tabs: chrome.tabs.Tab[],
	};
}

export type TabFilter = (tab: chrome.tabs.Tab) => boolean;
export type TabGrouper = (tabs: chrome.tabs.Tab[], filter: TabFilter) => TabGroup;

export function anyGrouper(tabs: chrome.tabs.Tab[], filter: TabFilter): TabGroup {
	const hosts: TabGroup = {};

	var i = 0;
	for (const t of tabs) {
		if(!filter(t)) {
			continue;
		}

		hosts[(i++).toString()] = {
			favicon: t.favIconUrl,
			tabs: [ t ],
		};
	}

	return hosts;
}

export function byDomainGrouper(tabs: chrome.tabs.Tab[], filter: TabFilter): TabGroup {
	const hosts: TabGroup = {};

	for (const t of tabs) {
		if(!filter(t)) {
			continue;
		}

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

export class DomainListController extends AbstractBaseController {

	private tabGrouper: TabGrouper = byDomainGrouper;
	private tabFilter: TabFilter = AnyFilter;

	public constructor(
		private lC: ListController,
		private tabHeader: HTMLHeadingElement,
	) {
		super(document.createElement("div"), "domain-list");

		this.render();
		// this.listChangeEmitter.trigger({ context: "FullList" });
	}

	public setTabGrouper(tg?: TabGrouper) {
		this.tabGrouper = tg || byDomainGrouper;
		this.render();
	}

	public setFilter(tabFilter?: TabFilter) {
		this.tabFilter = tabFilter || AnyFilter;
		this.render();
	}

	private async render() {
		const hosts = this.tabGrouper(await getAllTabs(), this.tabFilter);

		this.lC.empty();
		this.tabHeader.textContent = 'Tabs';

		for (const h in hosts) {
			if (hosts[h].tabs.length > 1) {
				const xxli = new TabLiController(h, `${hosts[h].tabs.length} Tabs`, hosts[h].favicon || 'icon128.png', hosts[h].tabs);
				const xxbtn = new TabLiButtonController('x.png');

				xxli.addTabButton(xxbtn);

				xxbtn.onClick((e) => {
					e.stopPropagation();
					closeTabs(hosts[h].tabs);
					xxli.remove();
				});

				xxli.onClick(() => {
					if (hosts[h].tabs.length == 1) {
						focusTab(hosts[h].tabs[0]);
						window.close();
					} else {
						// this.displaySpecificDomain(hosts, h);
						// this.listChangeEmitter.trigger({ context: "Partial" });
					}
				});

				this.lC.addTabLiController(xxli);
			} else {
				const xxli = this.getTabLiController(hosts[h].tabs[0]);

				this.lC.addTabLiController(xxli);
			}
		}
	}

	private getTabLiController(domainTab: chrome.tabs.Tab): TabLiController {
		const dtli = new TabLiController(
			domainTab.title || domainTab.url || "Unnamed Tab",
			"",
			domainTab.favIconUrl || 'icon128.png',
			[domainTab],
		);

		const dcbtn = new TabLiButtonController('x.png');
		dtli.addTabButton(dcbtn);

		dcbtn.onClick((e) => {
			e.stopPropagation();
			closeTabs(domainTab);
			dtli.remove();
		});

		dtli.onClick(() => {
			focusTab(domainTab);
			window.close();
		});

		return dtli;
	}

}