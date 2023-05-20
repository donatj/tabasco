import { ActionBarManager, mergeAllWindows, newWindowWithTabs, removeDupes } from "./actions";
import { getAllTabs, getCurrentWindow } from "./chrome";
import { DomainListController } from "./Controllers/DomainListController";
import { ListController } from "./Controllers/ListController";
import { SearchController } from "./Controllers/SearchController";
import { TabState } from "./Model/TabState";

export default async function index() {
	const tabHeader = document.getElementById('tab-header') as HTMLHeadingElement;
	const tabList = document.getElementById('tab-list') as HTMLUListElement;

	const searchInput = document.getElementById('search-input') as HTMLInputElement;

	const actionWrap = document.getElementById('action-section') as HTMLElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;
	const btnMoveToNewWindow = document.getElementById('btn-move-to-new-window') as HTMLLIElement;
	const actionManager = new ActionBarManager(actionWrap, btnMergeAll, btnRemoveDupes, btnMoveToNewWindow);

	btnMergeAll.addEventListener('click', async () => {
		await mergeAllWindows(await getCurrentWindow(), await getAllTabs());
	});

	btnRemoveDupes.addEventListener('click', async () => {
		await removeDupes(await getAllTabs());
	});

	const lC = new ListController(tabList);
	const dlC = new DomainListController(lC, tabHeader);
	const sC = new SearchController(searchInput, dlC);

	const ts = new TabState(chrome.tabs.onRemoved, chrome.tabs.onCreated, chrome.tabs.onUpdated, chrome.tabs.onAttached);
	ts.eventEmitter.add(() => {
		dlC.render();
	});

	ts.eventEmitter.add( actionManager.updateTabs.bind(actionManager) );

	const initialTabs = await getAllTabs();
	actionManager.updateTabs(initialTabs);
	dlC.setSearchController(sC);

	searchInput.focus();
	sC.addSearchListener( actionManager.updateSearch.bind(actionManager) );

	btnMoveToNewWindow.addEventListener('click', async () => {
		await newWindowWithTabs(await dlC.getVisibleTabs());
	});

	window.addEventListener('keydown', (ev) => {
		if (ev.keyCode === 27 && sC.getSearch() == '') {
			window.close();
		}
	});
}
