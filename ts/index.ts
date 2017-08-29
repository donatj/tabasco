document.addEventListener('DOMContentLoaded', async () => {
	const [tabs, currentWindow] = await Promise.all([crx.getAllTabs(), crx.getCurrentWindow()]);

	const tabHeader = document.getElementById('tab-header') as HTMLHeadingElement;
	const tabList = document.getElementById('tab-list') as HTMLUListElement;
	const btnMergeAll = document.getElementById('btn-merge-all') as HTMLLIElement;
	const btnRemoveDupes = document.getElementById('btn-remove-dupes') as HTMLLIElement;
	const btnMoveToNewWindow = document.getElementById('btn-move-to-new-window') as HTMLLIElement;

	

	const searchInput = document.getElementById('search-input') as HTMLInputElement;

	btnMergeAll.addEventListener('click', async () => {
		await crx.mergeAllWindows(currentWindow, tabs);
		window.close();
	});

	btnRemoveDupes.addEventListener('click', () => {
		crx.removeDupes(tabs);
		window.close();
	});

	const lC = new ListController(tabList);

	const dlc = new DomainListController(
		tabs, lC, searchInput, tabHeader,
	);

	btnMoveToNewWindow.style.display = 'none';
	dlc.addListChangeListener((e)=>{
		if(e.context == "FullList") {
			btnMoveToNewWindow.style.display = 'none';
		}else{
			btnMoveToNewWindow.style.display = '';
		}
	})

	btnMoveToNewWindow.addEventListener('click', () => {
		let tabs : chrome.tabs.Tab[] = [];
		let lcs = lC.getTabLiControllers()
		for(let i of lcs) {
			for(let j of i.getTabs()) {
				tabs.push(j)
			}
		}
		
		crx.newWindowWithTabs(tabs)
	});
});
