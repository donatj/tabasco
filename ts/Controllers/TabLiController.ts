class TabLiController implements Controller {
	protected li: HTMLLIElement = document.createElement('li');

	constructor(textContent: string, subtextContent: string = "", icon: string = "") {
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

		this.li.appendChild(wrap);
	}

	public addTabButton(btn: TabLiButtonController) {
		this.li.appendChild(btn.getElement());
	}

	public getElement() {
		return this.li;
	}

	public remove() {
		this.li.remove();
		this.removeEmitter.trigger(this.li);
	}

	private removeEmitter = new EventEmitter<HTMLLIElement>();

	public addRemoveListener(listener: Listener<HTMLLIElement>) {
		this.removeEmitter.add(listener);
	}

	public onClick(listener: (this: HTMLEmbedElement, ev: MouseEvent) => any): void {
		this.li.addEventListener('click', listener);
	}
}