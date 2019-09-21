import {mergeAdjecent} from './utils';
import {STRINGIFY, ADDTOCLAUSE} from './constants';

export default class Literal {
	constructor(pieces = [''], values = [], delimiter = '') {
		this.pieces = [...pieces];
		this.values = [...values];
		this.delimiter = delimiter;

		for (let i = 0, j = 1, k = 0; i < values.length; i++, j++, k++) {
			let val = values[i];
			if (val && val[ADDTOCLAUSE]) val = val.build(' ');
			if (val instanceof Literal) {
				this.values.splice(k, 1);

				if (val.pieces.length === 0) {
					mergeAdjecent(this.pieces, j, 1);
					continue;
				}

				this.pieces.splice(j, 0, ...val.pieces);
				mergeAdjecent(this.pieces, j, 1, 0);
				mergeAdjecent(this.pieces, j + val.pieces.length - 2, 0, 1);

				this.values.splice(k, 0, ...val.values);
				j += val.pieces.length;
				k += val.values.length;
				i += val.values.length;
			}
		}
	}

	append(literal, delimiter = '') {
		const clone = this.clone();

		if (typeof literal === 'string') {
			clone.pieces[clone.pieces.length - 1] += `${delimiter}${literal}`;
			return clone;
		}

		clone.pieces[clone.pieces.length - 1] += `${delimiter || literal.delimiter}${literal.pieces[0]}`;
		const [_, ...pieces] = literal.pieces;
		clone.pieces.push(...pieces);
		clone.values.push(...literal.values);

		return clone;
	}

	prefix(string = '') {
		const clone = this.clone();
		clone.pieces[0] = `${string}${this.pieces[0]}`;
		return clone;
	}

	suffix(string = '') {
		const clone = this.clone();
		clone.pieces[clone.pieces.length] += string;
		return clone;
	}

	clone() {
		return new Literal(this.pieces, this.values, this.delimiter);
	}

	[STRINGIFY](type = 'pg') {
		return this.pieces.reduce((acc, part, i) => acc + (type == 'pg' ? '$' + i : '?') + part);
	}

	get text() {
		return this[STRINGIFY]('pg');
	}

	get sql() {
		return this[STRINGIFY]('mysql');
	}
}
