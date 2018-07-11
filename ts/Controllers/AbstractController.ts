export interface ControllerInterface {
	attach(elm: HTMLElement): void;
	getContainer(): HTMLElement;
}

export abstract class AbstractBaseController implements ControllerInterface {
	constructor(protected container: HTMLElement, protected name: string) {
		this.container.classList.add(`${this.name}--controller`);
	}

	public attach(elm: HTMLElement): void {
		elm.appendChild(this.container);
	}

	public getContainer() {
		return this.container;
	}

	public getName() {
		return this.name;
	}

}
