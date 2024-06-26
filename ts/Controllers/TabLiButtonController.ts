import { AbstractBaseController } from "./AbstractController";

export class TabLiButtonController extends AbstractBaseController {

	constructor(icon: string, title: string) {
		super(document.createElement('button'), "tab-li-button");

		const img = document.createElement('img');
		img.src = icon;
		img.width = 10;

		this.container.title = title;
		this.container.appendChild(img);
	}

	public onClick(listener: EventListener): void {
		this.container.addEventListener('click', listener);
	}
}
