import { closeTabs, focusTab, getAllTabs, TabGroupLookupMemoizer } from "../chrome";
import { AnyFilter } from "../Filters/TabFilter";
import type { TabGroup } from "../Groupers/TabGroupers";
import { byDomainGrouper } from "../Groupers/TabGroupers";
import { AbstractBaseController } from "./AbstractController";
import type { ListController } from "./ListController";
import type { SearchController } from "./SearchController";
import { TabLiButtonController } from "./TabLiButtonController";
import { TabLiController } from "./TabLiController";
import { newWindowWithTabs } from "../actions";
import { AppMode, CurrentAppMode } from "../index";

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

	public async getVisibleTabs() {
		const tabs = await getAllTabs();

		return tabs.filter(this.tabFilter);
	}

	public async render() {
		const grouped = this.tabGrouper(await this.getVisibleTabs());

		this.lC.empty();
		this.tabHeader.textContent = 'Tabs';

		const tgm = new TabGroupLookupMemoizer();

		for (const h in grouped) {
			if (grouped[h].tabs.length > 1) {
				const xxli = new TabLiController(grouped[h].title, `${grouped[h].tabs.length} Tabs`, grouped[h].favicon || 'icon128.png');
				const xxbtn = new TabLiButtonController('x.png', `Close ${grouped[h].tabs.length} tabs`);

				xxli.addTabButton(xxbtn);

				xxbtn.onClick(async (e) => {
					e.stopPropagation();
					await closeTabs(grouped[h].tabs);
				});

				xxli.onClick(() => {
					if (!this.sC) {
						throw Error("missing search controller");
					}

					this.sC.setSearch(`${grouped[h].searchType}:${grouped[h].searchValue}`);
				});

				xxli.onAuxClick(async () => {
					await newWindowWithTabs(grouped[h].tabs);
					if (CurrentAppMode === AppMode.Popup) {
						window.close();
					}
				});

				this.lC.addTabLiController(xxli);
			} else {
				const xxli = await this.getTabLiController(grouped[h].tabs[0], tgm);

				this.lC.addTabLiController(xxli);
			}
		}
	}

	private async getTabLiController(domainTab: chrome.tabs.Tab, tgm: TabGroupLookupMemoizer) {
		let tg: chrome.tabGroups.TabGroup | null = null;
		if (domainTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
			tg = await tgm.getTabGroup(domainTab.groupId);
		}

		const dtli = new TabLiController(
			(tg?.title ? `${tg.title} – ` : '') + (domainTab.title || domainTab.url || "Unnamed Tab"),
			"",
			domainTab.favIconUrl || 'icon128.png',
			domainTab.url,
			tg?.color,
		);

		const dcbtn = new TabLiButtonController('x.png', 'Close ' + JSON.stringify(domainTab.title));
		dtli.addTabButton(dcbtn);

		dcbtn.onClick(async (e) => {
			e.stopPropagation();
			await closeTabs(domainTab);
		});

		dtli.onClick(async () => {
			await focusTab(domainTab);
			if (CurrentAppMode === AppMode.Popup) {
				window.close();
			}
		});

		dtli.onAuxClick(async () => {
			await newWindowWithTabs([domainTab]);
			if (CurrentAppMode === AppMode.Popup) {
				window.close();
			}
		});

		return dtli;
	}

}
