import { EventEmitter, Listener } from "../EventEmitter";
import { AbstractBaseController } from "./AbstractController";
import { TabLiButtonController } from "./TabLiButtonController";

export class TabLiController extends AbstractBaseController {

	constructor(textContent: string, subtextContent: string = "", icon: string = "", protected tabs: chrome.tabs.Tab[]) {
		super(document.createElement('li'), 'tab-li');
		const wrap = document.createElement('div');

		const text = document.createElement('span');
		text.textContent = textContent;

		const fav = document.createElement('img');
		fav.src = icon;

		wrap.appendChild(fav);
		wrap.appendChild(text);

		if (subtextContent) {
			const small = document.createElement('small');
			small.textContent = subtextContent;
			wrap.appendChild(small);
		}

		this.container.appendChild(wrap);
	}

	public addTabButton(btn: TabLiButtonController) {
		this.container.appendChild(btn.getContainer());
	}

	public remove() {
		this.container.remove();
		this.removeEmitter.trigger(this.container);
	}

	private removeEmitter = new EventEmitter<HTMLElement>();

	public addRemoveListener(listener: Listener<HTMLElement>) {
		this.removeEmitter.add(listener);
	}

	public onClick(listener: EventListener): void {
		this.container.addEventListener('click', listener);
	}

	public getTabs() {
		return this.tabs;
	}
}