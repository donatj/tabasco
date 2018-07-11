import { AbstractBaseController } from "./Controller";
import { TabLiController } from "./TabLiController";

export class ListController extends AbstractBaseController {

	protected controllers: TabLiController[] = [];

	public constructor(protected list: HTMLUListElement) {
		super(list, "list");
	}

	public empty() {
		this.controllers = [];
		this.list.innerHTML = '';
	}

	public addTabLiController(tliC: TabLiController) {
		this.controllers.push(tliC);
		this.list.appendChild(tliC.getContainer());
	}

	public length(): number {
		return this.list.children.length;
	}

	public getTabLiControllers() {
		return this.controllers;
	}

}