import { getAllTabs } from "../chrome";
import { EventEmitter } from "../EventEmitter";

export class TabState {

	public readonly eventEmitter = new EventEmitter<chrome.tabs.Tab[]>();

	constructor(...events: chrome.events.Event<any>[]) {
		let timeout = 0;

		for (const e of events) {
			e.addListener(() => {
				clearTimeout(timeout);
				timeout = setTimeout(async () => {
					this.eventEmitter.trigger(
						await getAllTabs()
					);
				}, 200);
			});
		}
	}
}