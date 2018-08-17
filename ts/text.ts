export function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes accent marks by separating accent marks and their characters with NFD
 * and then simply removing the unicode accent mark range
 */
export function normalize(s: string): string {
	return s.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}