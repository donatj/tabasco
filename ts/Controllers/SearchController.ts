import type { Listener } from "../EventEmitter";
import { EventEmitter } from "../EventEmitter";
import { SearchFilter } from "../Filters/SearchFilter";
import { anyGrouper } from "../Groupers/TabGroupers";
import type { DomainListController } from "./DomainListController";

export class SearchController /* YAGNI for now extends AbstractBaseController */ {

	private searchEmitter = new EventEmitter<string | null>();

	public constructor(
		private searchInput: HTMLInputElement,
		private dlC: DomainListController,
	) {
		searchInput.addEventListener('input', () => {
			this.doSearch(searchInput.value);
		});
	}

	private doSearch(s: string) {
		const sf = new SearchFilter();
		s = s.trim();

		if (s != "") {
			this.dlC.setFilter(sf.buildFilter(s));
			this.dlC.setTabGrouper(anyGrouper);
			this.searchEmitter.trigger(s);
		} else {
			this.dlC.setFilter();
			this.dlC.setTabGrouper();
			this.searchEmitter.trigger(null);
		}

	}

	public getSearch(): string {
		return this.searchInput.value;
	}

	public setSearch(s: string) {
		this.searchInput.value = s;
		this.doSearch(s);
	}

	public addSearchListener(listener: Listener<string | null>) {
		this.searchEmitter.add(listener);
	}

}
