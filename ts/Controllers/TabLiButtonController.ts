class TabLiButtonController implements Controller {
	protected button: HTMLButtonElement = document.createElement('button');

	constructor(icon: string) {
		const img = document.createElement('img');
		img.src = icon;
		img.width = 10;

		this.button.appendChild(img);
	}

	public getElement() {
		return this.button;
	}

	public onClick(listener: (this: HTMLEmbedElement, ev: MouseEvent) => any): void {
		this.button.addEventListener('click', listener);
	}
}