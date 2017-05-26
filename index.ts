async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
	const windows = await getAllWindows();
	const tabs: chrome.tabs.Tab[] = [];

	for (const w of windows) {
		for (const t of w.tabs || []) {
			tabs.push(t);
		}
	}

	return tabs;
}

function getCurrentWindow(): Promise<chrome.windows.Window> {
	return new Promise<chrome.windows.Window>((resolve) => {
		chrome.windows.getCurrent((currentWindow) => { resolve(currentWindow); });
	});
}

function getAllWindows(): Promise<chrome.windows.Window[]> {
	return new Promise<chrome.windows.Window[]>((resolve) => {
		chrome.windows.getAll({ populate: true }, (windows) => {
			resolve(windows);
		});
	});
}

async function mergeAllWindows(w: chrome.windows.Window, tabs: chrome.tabs.Tab[]) {
	const windows = await getAllWindows();
	const windowsById: { [i: number]: chrome.windows.Window } = {};
	for (const w of windows) {
		windowsById[w.id] = w;
	}

	for (const t of tabs) {
		if (w.id == t.windowId || !t.id) {
			continue;
		}

		if (!(windowsById[t.windowId].state == 'fullscreen' && t.active)) {
			chrome.tabs.move(t.id, { windowId: w.id, index: -1 });
		}

		if (t.pinned) {
			chrome.tabs.update(t.id, { pinned: true });
		}
	}
}

function removeDupes(tabs: chrome.tabs.Tab[]) {
	const urls: string[] = [];
	for (const t of tabs) {
		const a = document.createElement('a');
		if (!t.url) {
			continue;
		}

		a.href = t.url;

		if (a.protocol != 'http:' && a.protocol != 'https:') {
			continue;
		}

		if (urls.indexOf(t.url) > -1) {
			closeTabs(t);
		} else {
			urls.push(t.url);
		}
	}
}

function focusTab(tab: chrome.tabs.Tab) {
	if (!tab.id) { return; }
	chrome.tabs.update(tab.id, { selected: true });
	chrome.windows.update(tab.windowId, { focused: true });
}

function closeTabs(tabs: chrome.tabs.Tab | chrome.tabs.Tab[]) {
	if (!Array.isArray(tabs)) {
		tabs = [tabs];
	}

	for (const t of tabs) {
		if (!t.id) {
			continue;
		}
		chrome.tabs.remove(t.id);
	}
}

interface Controller {
	getElement: () => HTMLElement;
}

class TabLiButtonController implements Controller {
	protected button: HTMLButtonElement = document.createElement('button');

	constructor(icon: string) {
		const img = document.createElement('img');
		img.src = icon;
		img.width = 10;

		this.button.appendChild(img);
	}

	public getElement() {
		return this.button;
	}

	public onClick(listener: (this: HTMLEmbedElement, ev: MouseEvent) => any): void {
		this.button.addEventListener('click', listener);
	}
}

class TabLiController implements Controller {
	protected li: HTMLLIElement = document.createElement('li');

	constructor(textContent: string, subtextContent: string = "", icon: string = "") {
		const wrap = document.createElement('div');

		const text = document.createElement('span');
		text.textContent = textContent;

		const fav = document.createElement('img');
		fav.src = icon;

		wrap.appendChild(fav);
		wrap.appendChild(text);

		if (subtextContent) {
			const small = document.createElement('small');
			small.textContent = subtextContent;
			wrap.appendChild(small);
		}

		this.li.appendChild(wrap);
	}

	public addTabButton(btn: TabLiButtonController) {
		this.li.appendChild(btn.getElement());
	}

	public getElement() {
		return this.li;
	}

	public remove() {
		this.li.remove();
	}

	public onClick(listener: (this: HTMLEmbedElement, ev: MouseEvent) => any): void {
		this.li.addEventListener('click', listener);
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	const [tabs, currentWindow] = await Promise.all([getAllTabs(), getCurrentWindow()]);

	const mainContent = document.getElementById('main-content') as HTMLDivElement;
	const domainTabContent = document.getElementById('domain-tab-content') as HTMLDivElement;

	const domainTabHeader = document.getElementById('domain-tab-header') as HTMLHeadingElement;
	const domainTabList = document.getElementById('domain-tab-list') as HTMLUListElement;

	const domainList = document.getElementById('domain-list') as HTMLUListElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;

	btnMergeAll.addEventListener('click', async () => {
		await mergeAllWindows(currentWindow, tabs);
		window.close();
	});

	btnRemoveDupes.addEventListener('click', () => {
		removeDupes(tabs);
		window.close();
	});

	const hosts: {
		[key: string]: {
			count: number,
			favicon: string | undefined,
			tabs: chrome.tabs.Tab[],
		},
	} = {};

	for (const t of tabs) {
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

});
