export const fonts = {
	Courier: {
		correction(size, lineHeight) {
			return (size * lineHeight - size) / 2 + size / 6;
		}
	},
	Helvetica: {
		correction(size, lineHeight) {
			return (size * lineHeight - size) / 2 + size / 10;
		}
	},
	'Times-Roman': {
		correction(size, lineHeight) {
			return (size * lineHeight - size) / 2 + size / 7;
		}
	}
};

export function fetchFont(name) {
	const font = fonts[name];
	if (!font) throw new Error(`Font '${name}' not exists.`);
	return font;
}
