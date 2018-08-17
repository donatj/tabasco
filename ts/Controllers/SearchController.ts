import { SearchFilter } from "../Filters/SearchFilter";
import { DomainListController, anyGrouper } from "./DomainListController";

export class SearchController /* YAGNI for now extends AbstractBaseController */ {

	public constructor(
		searchInput: HTMLInputElement,
		dlC: DomainListController,
	) {
		const sf = new SearchFilter;
		searchInput.addEventListener('input', (e) => {
			const s = searchInput.value;

			if(s.trim() != "") {
				dlC.setFilter( sf.buildFilter(s) );
				dlC.setTabGrouper( anyGrouper )
			} else {
				dlC.setFilter();
				dlC.setTabGrouper();
			}
		});
	}

}
