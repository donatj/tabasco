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

	new DomainListController(
		tabs, mainContent, domainList, domainTabList, domainTabContent, domainTabHeader
	);
});
