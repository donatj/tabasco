class ListController implements Controller {

	public constructor(protected list: HTMLUListElement) {
	}

	public getElement() {
		return this.list;
	}

	public empty() {
		this.list.innerHTML = '';
	}

	public addTabLiController(tliC: TabLiController) {
		this.list.appendChild(tliC.getElement());
	}

}