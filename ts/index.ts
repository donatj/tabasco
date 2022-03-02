import { findDupes, mergeAllWindows, newWindowWithTabs, removeDupes } from "./actions";
import { getAllTabs, getCurrentWindow } from "./chrome";
import { DomainListController } from "./Controllers/DomainListController";
import { ListController } from "./Controllers/ListController";
import { SearchController } from "./Controllers/SearchController";
import { TabState } from "./Model/TabState";

export default async function index() {
	const tabHeader = document.getElementById('tab-header') as HTMLHeadingElement;
	const tabList = document.getElementById('tab-list') as HTMLUListElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;
	const btnMoveToNewWindow = document.getElementById('btn-move-to-new-window') as HTMLLIElement;

	const searchInput = document.getElementById('search-input') as HTMLInputElement;

	btnMergeAll.addEventListener('click', async () => {
		await mergeAllWindows(await getCurrentWindow(), await getAllTabs());
	});

	btnRemoveDupes.addEventListener('click', async () => {
		await removeDupes(await getAllTabs());
	});

	const lC = new ListController(tabList);
	const dlC = new DomainListController(lC, tabHeader);
	const sC = new SearchController(searchInput, dlC);

	const ts = new TabState(chrome.tabs.onRemoved, chrome.tabs.onCreated, chrome.tabs.onUpdated);
	ts.eventEmitter.add(() => {
		dlC.render();
	});

	function showHideRemoveDupes(tabs: chrome.tabs.Tab[]) {
		btnRemoveDupes.style.display = findDupes(tabs).length == 0 ? 'none' : '';
	}
	ts.eventEmitter.add((tabs) => {
		showHideRemoveDupes(tabs);
	});
	showHideRemoveDupes(await getAllTabs());

	dlC.setSearchController(sC);

	searchInput.focus();

	btnMoveToNewWindow.style.display = 'none';

	sC.addSearchListener((s) => {
		btnMoveToNewWindow.style.display = s === null ? 'none' : '';
	});

	btnMoveToNewWindow.addEventListener('click', async () => {
		await newWindowWithTabs(await dlC.getVisibleTabs());
	});

	window.addEventListener('keydown', (ev) => {
		if (ev.keyCode === 27 && sC.getSearch() == '') {
			window.close();
		}
	});
}
