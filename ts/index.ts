import { findDupes, mergeAllWindows, newWindowWithTabs, removeDupes } from "./actions";
import { getAllTabs, getCurrentWindow } from "./chrome";
import { DomainListController } from "./Controllers/DomainListController";
import { ListController } from "./Controllers/ListController";
import { SearchController } from "./Controllers/SearchController";
import { EventEmitter } from "./EventEmitter";

export default async function index() {
	const [tabs, currentWindow] = await Promise.all([getAllTabs(), getCurrentWindow()]);

	const tabHeader = document.getElementById('tab-header') as HTMLHeadingElement;
	const tabList = document.getElementById('tab-list') as HTMLUListElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;
	const btnMoveToNewWindow = document.getElementById('btn-move-to-new-window') as HTMLLIElement;

	const searchInput = document.getElementById('search-input') as HTMLInputElement;

	btnMergeAll.addEventListener('click', async () => {
		await mergeAllWindows(currentWindow, tabs);
	});

	btnRemoveDupes.addEventListener('click', () => {
		removeDupes(tabs);
	});

	const lC = new ListController(tabList);
	const dlC = new DomainListController(lC, tabHeader);
	const sC = new SearchController(searchInput, dlC);

	const TabChangeEmitter = new EventEmitter<void>();
	TabChangeEmitter.add(() => {
		dlC.render();
	});

	TabChangeEmitter.add(() => {
		btnRemoveDupes.style.display = findDupes(tabs).length == 0 ? 'none' : '';
	});
	btnRemoveDupes.style.display = findDupes(tabs).length == 0 ? 'none' : '';

	// Prevent thrashing. Probably move this into DomainListController
	let tabChangeTimeout = 0;
	const tabchange = () => {
		clearTimeout(tabChangeTimeout);
		tabChangeTimeout = setTimeout(() => { TabChangeEmitter.trigger(); }, 200);
	};

	chrome.tabs.onRemoved.addListener(tabchange);
	chrome.tabs.onCreated.addListener(tabchange);
	chrome.tabs.onUpdated.addListener(tabchange);

	dlC.setSearchController(sC);

	searchInput.focus();

	btnMoveToNewWindow.style.display = 'none';

	sC.addSearchListener((s) => {
		btnMoveToNewWindow.style.display = s === null ? 'none' : '';
	});

	btnMoveToNewWindow.addEventListener('click', async () => {
		newWindowWithTabs(await dlC.getTabs());
	});

	window.addEventListener('keydown', (ev) => {
		if (ev.keyCode === 27 && sC.getSearch() == '') {
			window.close();
		}
	});
}
