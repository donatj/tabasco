type Listener<T> = (e: T) => void;

class EventEmitter<T> {
	protected listeners = new Set<Listener<T>>();

	public add(callback: Listener<T>) {
		this.listeners.add(callback);
	}

	public trigger(event: T) {
		this.listeners.forEach((fn) => fn(event));
	}

}