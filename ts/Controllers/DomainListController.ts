interface hostgroup {
	[key: string]: {
		count: number,
		favicon: string | undefined,
		tabs: chrome.tabs.Tab[],
	};
}

class DomainListController /*implements Controller*/ {

	public constructor(
		protected tabs: chrome.tabs.Tab[],
		protected lC: ListController,
		protected searchInput: HTMLInputElement,
		// tabList: HTMLUListElement,
		protected tabHeader: HTMLHeadingElement,
	) {
		const hosts = this.getGroupedTabs();
		this.displayDomainList(hosts);

		let k = 0;
		let last = '';
		const toe = () => {
			clearTimeout(k);
			k = setTimeout(() => {
				if (searchInput.value == "") {
					console.log('displayDomainList');
					this.displayDomainList(hosts);
					return;
				}
				if(last == searchInput.value) {
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

	private displayDomainList(hosts: hostgroup) {
		this.lC.empty();

		for (const h in hosts) {
			const subtext = hosts[h].count > 1 ? `${hosts[h].count} Tabs` : (hosts[h].tabs[0].title || 'Unnamed Tab').substring(0, 70);

			const xxli = new TabLiController(h, subtext, hosts[h].favicon || 'icon128.png');
			const xxbtn = new TabLiButtonController('x.png');

			xxli.addTabButton(xxbtn);

			// tabList.appendChild(xxli.getElement());
			this.lC.addTabLiController(xxli);

			xxbtn.onClick((e) => {
				e.stopPropagation();
				closeTabs(hosts[h].tabs);
				xxli.remove();
			});

			xxli.onClick(() => {
				if (hosts[h].count == 1) {
					focusTab(hosts[h].tabs[0]);
					window.close();
				} else {
					this.displaySpecificDomain(hosts, h);
				}
			});
		}
	}

	private displaySpecificDomain(hosts: hostgroup, h: string) {
		const domainTabs = hosts[h].tabs;

		this.tabHeader.textContent = h;

		this.lC.empty();
		for (const domainTab of domainTabs) {
			const dtli = this.getTabLiController(domainTab);
			this.lC.addTabLiController(dtli);
		}
	}

	private getTabLiController(domainTab: chrome.tabs.Tab) {
		const dtli = new TabLiController(
			domainTab.title || domainTab.url || "Unnamed Tab",
			"",
			domainTab.favIconUrl || 'icon128.png',
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

	protected getGroupedTabs() {
		const hosts: hostgroup = {};

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