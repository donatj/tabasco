interface hostgroup {
	[key: string]: {
		count: number,
		favicon: string | undefined,
		tabs: chrome.tabs.Tab[],
	},
}

class DomainListController /*implements Controller*/ {

	public constructor(
		protected tabs: chrome.tabs.Tab[],
		mainContent: HTMLDivElement,
		domainList: HTMLUListElement,
		domainTabList: HTMLUListElement,
		domainTabContent: HTMLDivElement,
		domainTabHeader: HTMLHeadingElement,
	) {
		let hosts = this.getGroupedTabs();


		for (const h in hosts) {
			const subtext = hosts[h].count > 1 ? `${hosts[h].count} Tabs` : (hosts[h].tabs[0].title || 'Unnamed Tab').substring(0, 70);

			const xxli = new TabLiController(h, subtext, hosts[h].favicon || 'icon128.png');
			const xxbtn = new TabLiButtonController('x.png');

			xxli.addTabButton(xxbtn);

			domainList.appendChild(xxli.getElement());

			xxbtn.onClick((e) => {
				e.stopPropagation();
				closeTabs(hosts[h].tabs);
				xxli.remove();
			});

			xxli.onClick(() => {
				const domainTabs = hosts[h].tabs;

				if (hosts[h].count == 1) {
					focusTab(domainTabs[0]);
					window.close();
				} else {
					mainContent.style.display = 'none';
					domainTabContent.style.display = '';
					domainTabHeader.textContent = h;

					for (const domainTab of domainTabs) {
						const dtli = new TabLiController(
							domainTab.title || domainTab.url || "Unnamed Tab",
							"",
							hosts[h].favicon || 'icon128.png',
						);

						const dcbtn = new TabLiButtonController('x.png');
						dtli.addTabButton(dcbtn);

						domainTabList.appendChild(dtli.getElement());

						dcbtn.onClick((e) => {
							e.stopPropagation();
							closeTabs(domainTab);
							dtli.remove();
						});

						dtli.onClick(() => {
							focusTab(domainTab);
							window.close();
						});
					}
				}
			});
		}
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