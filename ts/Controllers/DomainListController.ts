interface HostGroup {
	[key: string]: {
		count: number,
		favicon: string | undefined,
		tabs: chrome.tabs.Tab[],
	};
}

class DomainListController /*implements Controller*/ {

	private hosts: HostGroup = {};

	public constructor(
		protected tabs: chrome.tabs.Tab[],
		protected lC: ListController,
		protected searchInput: HTMLInputElement,
		protected tabHeader: HTMLHeadingElement,
	) {
		this.hosts = this.getGroupedTabs();
		this.displayDomainList(this.hosts);

		let k = 0;
		let last = '';
		const toe = () => {
			clearTimeout(k);
			k = setTimeout(() => {
				if (searchInput.value == "") {
					console.log('displayDomainList');
					this.displayDomainList(this.hosts);
					return;
				}
				if (last == searchInput.value) {
					return;
				}
				this.lC.empty();
				this.tabHeader.textContent = 'Search…';
				for (const t of tabs) {
					if (
						(t.title && t.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()))
						|| (t.url && t.url.includes(searchInput.value))
					) {
						const tli = this.getTabLiController(t);
						this.lC.addTabLiController(tli);
					}
				}

				last = searchInput.value;
			}, 100);
		};
		searchInput.addEventListener('change', toe);
		searchInput.addEventListener('keyup', toe);
		searchInput.addEventListener('click', toe);
	}

	private displayDomainList(hosts: HostGroup) {
		this.lC.empty();
		this.tabHeader.textContent = 'Tabs';

		for (const h in hosts) {
			if (hosts[h].count > 1) {
				const xxli = new TabLiController(h, `${hosts[h].count} Tabs`, hosts[h].favicon || 'icon128.png');
				const xxbtn = new TabLiButtonController('x.png');

				xxli.addTabButton(xxbtn);

				xxbtn.onClick((e) => {
					e.stopPropagation();
					crx.closeTabs(hosts[h].tabs);
					xxli.remove();
				});

				xxli.onClick(() => {
					if (hosts[h].count == 1) {
						crx.focusTab(hosts[h].tabs[0]);
						window.close();
					} else {
						this.displaySpecificDomain(hosts, h);
					}
				});

				this.lC.addTabLiController(xxli);
			} else {
				const xxli = this.getTabLiController(hosts[h].tabs[0]);

				this.lC.addTabLiController(xxli);
			}
		}
	}

	private displaySpecificDomain(hosts: HostGroup, h: string) {
		const domainTabs = hosts[h].tabs;

		this.tabHeader.textContent = h;

		this.lC.empty();
		for (const domainTab of domainTabs) {
			const dtli = this.getTabLiController(domainTab);
			this.lC.addTabLiController(dtli);

			dtli.addRemoveListener(() => {
				console.log('here');
				if (this.lC.length() == 0) {
					this.displayDomainList(this.hosts);
				}
			});
		}
	}

	private getTabLiController(domainTab: chrome.tabs.Tab): TabLiController {
		const dtli = new TabLiController(
			domainTab.title || domainTab.url || "Unnamed Tab",
			"",
			domainTab.favIconUrl || 'icon128.png',
		);

		const dcbtn = new TabLiButtonController('x.png');
		dtli.addTabButton(dcbtn);

		dcbtn.onClick((e) => {
			e.stopPropagation();
			crx.closeTabs(domainTab);
			dtli.remove();
		});

		dtli.onClick(() => {
			crx.focusTab(domainTab);
			window.close();
		});

		return dtli;
	}

	protected getGroupedTabs() {
		const hosts: HostGroup = {};

		for (const t of this.tabs) {
			const a = document.createElement('a');
			if (!t.url) {
				continue;
			}
			a.href = t.url;

			if (a.protocol != 'http:' && a.protocol != 'https:') {
				continue;
			}

			if (!hosts[a.host]) {
				hosts[a.host] = {
					count: 0,
					favicon: t.favIconUrl,
					tabs: [],
				};
			}
			hosts[a.host].count += 1;
			hosts[a.host].tabs.push(t);
		}

		return hosts;
	}

}