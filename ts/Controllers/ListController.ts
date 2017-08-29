class ListController implements Controller {

	protected controllers: TabLiController[] = [];

	public constructor(protected list: HTMLUListElement) {
	}

	public getElement() {
		return this.list;
	}

	public empty() {
		this.controllers = [];
		this.list.innerHTML = '';
	}

	public addTabLiController(tliC: TabLiController) {
		this.controllers.push(tliC);
		this.list.appendChild(tliC.getElement());
	}

	public length(): number {
		return this.list.children.length;
	}

	public getTabLiControllers() {
		return this.controllers;
	}

}