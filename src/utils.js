export const mergeAdjecent = (arr, i, before = 0, after = 0) =>
	arr.splice(
		i - before,
		before + 1 + after,
		[...arr.slice(i - before, i), arr[i], ...arr.slice(i + 1, i + 1 + after)].join('')
	);

export const copy = o =>
	Object.keys(o).reduce((newObject, key) => ((newObject[key] = o[key].slice()), newObject), {});
