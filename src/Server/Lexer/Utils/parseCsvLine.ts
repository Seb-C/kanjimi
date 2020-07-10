export default (line: string): string[] => {
	const columns = [];

	let colValue = '';
	let index = 0;
	const length = line.length;
	do {
		if (line[index] === ',' || index === length) {
			if (colValue[0] === '"' && colValue[colValue.length - 1] === '"') {
				// Removing quotes
				colValue = colValue.substring(1, colValue.length - 1);

				// Unescaping quotes
				colValue = colValue.replace(/""/g, '"');
			}

			columns.push(colValue);

			// Going to the next column
			colValue = '';
		} else {
			colValue += line[index];
		}

		index++;
	} while (index <= length);

	return columns;
};
