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
	new SearchController(searchInput, dlC);

	searchInput.focus();

	btnMoveToNewWindow.style.display = 'none';
	/*
	dlc.addListChangeListener((e) => {
		if (e.context == "FullList") {
			btnMoveToNewWindow.style.display = 'none';
		} else {
			btnMoveToNewWindow.style.display = '';
		}
	});
	*/

	btnMoveToNewWindow.addEventListener('click', () => {
		const xtabs: chrome.tabs.Tab[] = [];
		const lcs = lC.getTabLiControllers();
		for (const i of lcs) {
			for (const j of i.getTabs()) {
				xtabs.push(j);
			}
		}

		newWindowWithTabs(xtabs);
	});
})();
