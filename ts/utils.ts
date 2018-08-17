export interface URL {
	protocol: string;
	host: string;
}

export function urlparser(url : string) : URL {
	const a = document.createElement('a');
	a.href = url;

	return a;
}