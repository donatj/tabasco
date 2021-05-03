import { closeTabs, focusTab, getAllTabs, getTabGroup } from "../chrome";
import { AnyFilter } from "../Filters/TabFilter";
import { byDomainGrouper, TabGroup } from "../Groupers/TabGroupers";
import { AbstractBaseController } from "./AbstractController";
import { ListController } from "./ListController";
import { SearchController } from "./SearchController";
import { TabLiButtonController } from "./TabLiButtonController";
import { TabLiController } from "./TabLiController";
import { newWindowWithTabs } from "../actions";

export type TabFilter = (tab: chrome.tabs.Tab) => boolean;
export type TabGrouper = (tabs: chrome.tabs.Tab[]) => TabGroup;

export class DomainListController extends AbstractBaseController {

	private tabGrouper: TabGrouper = byDomainGrouper;
	private tabFilter: TabFilter = AnyFilter;

	private sC: SearchController | null = null;

	public constructor(
		private lC: ListController,
		private tabHeader: HTMLHeadingElement,
	) {
		super(document.createElement("div"), "domain-list");

		this.render();
	}

	public setSearchController(sC: SearchController) {
		this.sC = sC;
	}

	public setTabGrouper(tg?: TabGrouper) {
		this.tabGrouper = tg || byDomainGrouper;
		this.render();
	}

	public setFilter(tabFilter?: TabFilter) {
		this.tabFilter = tabFilter || AnyFilter;
		this.render();
	}

	public async getTabs() {
		const tabs = await getAllTabs();

		return tabs.filter(this.tabFilter);
	}

	public async render() {
		const grouped = this.tabGrouper(await this.getTabs());

		this.lC.empty();
		this.tabHeader.textContent = 'Tabs';

		for (const h in grouped) {
			if (grouped[h].tabs.length > 1) {
				const xxli = new TabLiController(grouped[h].title, `${grouped[h].tabs.length} Tabs`, grouped[h].favicon || 'icon128.png');
				const xxbtn = new TabLiButtonController('x.png');

				xxli.addTabButton(xxbtn);

				xxbtn.onClick((e) => {
					e.stopPropagation();
					closeTabs(grouped[h].tabs);
				});

				xxli.onClick(() => {
					if (!this.sC) {
						throw Error("missing search controller");
					}

					this.sC.setSearch(`${grouped[h].searchType}:${grouped[h].searchValue}`);
				});

				xxli.onAuxClick(() => {
					newWindowWithTabs(grouped[h].tabs);
					window.close();
				});

				this.lC.addTabLiController(xxli);
			} else {
				const xxli = await this.getTabLiController(grouped[h].tabs[0]);

				this.lC.addTabLiController(xxli);
			}
		}
	}

	private async getTabLiController(domainTab: chrome.tabs.Tab) {
		let tg : chrome.tabGroups.TabGroup|null = null
		if(domainTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
			tg = await getTabGroup(domainTab.groupId)
		}
		
		const dtli = new TabLiController(
			(tg?.title ? `${tg.title} – ` : '') + (domainTab.title || domainTab.url || "Unnamed Tab"),
			"",
			domainTab.favIconUrl || 'icon128.png',
			domainTab.url,
			tg?.color
		);

		const dcbtn = new TabLiButtonController('x.png');
		dtli.addTabButton(dcbtn);

		dcbtn.onClick((e) => {
			e.stopPropagation();
			closeTabs(domainTab);
		});

		dtli.onClick(() => {
			focusTab(domainTab);
			window.close();
		});

		dtli.onAuxClick(() => {
			newWindowWithTabs([domainTab]);
			window.close();
		});

		return dtli;
	}

}