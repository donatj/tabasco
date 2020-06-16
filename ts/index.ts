import { mergeAllWindows, newWindowWithTabs, removeDupes } from "./actions";
import { getAllTabs, getCurrentWindow } from "./chrome";
import { DomainListController } from "./Controllers/DomainListController";
import { ListController } from "./Controllers/ListController";
import { SearchController } from "./Controllers/SearchController";

(async () => {
	const [tabs, currentWindow] = await Promise.all([getAllTabs(), getCurrentWindow()]);

	const tabHeader = document.getElementById('tab-header') as HTMLHeadingElement;
	const tabList = document.getElementById('tab-list') as HTMLUListElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;
	const btnMoveToNewWindow = document.getElementById('btn-move-to-new-window') as HTMLLIElement;

	const searchInput = document.getElementById('search-input') as HTMLInputElement;

	btnMergeAll.addEventListener('click', async () => {
		await mergeAllWindows(currentWindow, tabs);
		window.close();
	});

	btnRemoveDupes.addEventListener('click', () => {
		removeDupes(tabs);
		window.close();
	});

	const lC = new ListController(tabList);
	const dlC = new DomainListController(lC, tabHeader);
	const sC = new SearchController(searchInput, dlC);

	// Prevent thrashing. Probably move this into DomainListController
	let renderTimeout = 0;
	const rerender = () => {
		clearTimeout(renderTimeout);
		renderTimeout = setTimeout(() => { dlC.render(); }, 100);
	};

	chrome.tabs.onRemoved.addListener(rerender);
	chrome.tabs.onCreated.addListener(rerender);
	chrome.tabs.onUpdated.addListener(rerender);

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
		if( ev.keyCode === 27 && sC.getSearch() == '' ) {
			window.close();
		}
	})
})();
