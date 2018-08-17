
import { TabFilter } from "../Controllers/DomainListController";
import { AnyFilter, AudibleFilter, BuildHostFilter, BuildLogicalAndFilter, BuildLogicalNotFilter, BuildTextMatchFilter, PinnedFilter } from "./TabFilter";

export enum SearchType {
	// no = "no",
	is = "is",
	not = "not",
	// has = "has",
	text = "text",

	host = "host",
	domain = "domain",
}

function isSearchPrefix(value: SearchType | string): value is SearchType {
	for (const prefix in SearchType) {
		if (value === prefix) {
			return true;
		}
	}

	return false;
}

interface SearchToken {
	neg: boolean;
	type: SearchType;
	value: string;
}

export class SearchFilter {

	public buildFilter(search: string): TabFilter {
		const tokens = this.tokenize(search);
		const filters: TabFilter[] = [];

		for (const token of tokens) {
			let filter: TabFilter | null = null;

			switch (token.type) {
				// case SearchType.tag:
				// 	filter = BuildTagMatchFilter(token.value);
				// 	break;
				// case SearchType.has:
				// case SearchType.no:
				// 	if (token.value == "tag" || token.value == "tags") {
				// 		filter = NoTagsFilter;
				// 	}

				// 	if (filter && token.type == SearchType.has) {
				// 		filter = BuildLogicalNotFilter(filter);
				// 	}
				// 	break;
				case SearchType.host:
				case SearchType.domain:
					filter = BuildHostFilter(token.value);
					break;
				case SearchType.not:
				case SearchType.is:
					if (token.value == "any" || token.value == "all") {
						filter = AnyFilter;
					} else if(token.value == "audible") {
						filter = AudibleFilter;
					} else if(token.value == "pinned") {
						filter = PinnedFilter;
					}

					if (filter && token.type == SearchType.not) {
						filter = BuildLogicalNotFilter(filter);
					}
					break;
				case SearchType.text:
					filter = BuildTextMatchFilter(token.value);
					break;
			}

			if (!filter) {
				filter = BuildTextMatchFilter(`${token.type}:${token.value}`);
			}
			if (token.neg) {
				filter = BuildLogicalNotFilter(filter);
			}

			filters.push(filter);
		}

		return BuildLogicalAndFilter(filters);
	}

	public tokenize(search: string): SearchToken[] {
		const result = search.match(/(?:\S*"[^"]*")|(?:\S+)/mg);
		if (!result) {
			return [];
		}

		const tokens: SearchToken[] = [];
		for (const s of result) {
			tokens.push(this.process(s));
		}

		return tokens;
	}

	private process(str: string): SearchToken {
		let neg = false;

		str = str.trim();
		if (str.startsWith("!") || str.startsWith("-")) {
			neg = true;
			str = str.substr(1);
		}

		const parts = str.split(":", 2);
		if (parts.length > 1) {
			const type = parts[0];
			if (isSearchPrefix(type)) {
				const value = this.processString(str.substr(type.length + 1));
				return { neg, type, value };
			}
		}

		return {
			neg,
			type: SearchType.text,
			value: this.processString(str),
		};
	}

	private processString(str: string): string {
		str = str.trim();
		if (str.startsWith('"') && str.endsWith('"')) {
			return str.substr(1, str.length - 2);
		}

		return str;
	}
}
