import {copy} from './utils';
import Literal from './literal';
import {clauseOrder, clauseStrings, ADDTOCLAUSE} from './constants';

export default class Query {
	constructor(clauses) {
		this.clauses = copy(clauses);
	}

	[ADDTOCLAUSE](key, literal, override) {
		const state = copy(this.clauses);
		override ? (state[key] = [literal]) : state[key].push(literal);
		return new Query(state);
	}

	build(delimiter = '\n') {
		return clauseOrder
			.map(key => ({key, expressions: this.clauses[key]}))
			.filter(clause => clause.expressions && clause.expressions.length > 0)
			.map(({expressions, key}) =>
				expressions.reduce((acc, literal) => acc.append(literal)).prefix(clauseStrings[key])
			)
			.reduce((acc, query) => acc.append(query, delimiter));
	}

	select(pieces, ...values) {
		return this[ADDTOCLAUSE]('select', new Literal(pieces, values, ', '));
	}

	update(pieces, ...values) {
		return this[ADDTOCLAUSE]('update', new Literal(pieces, values), true);
	}

	set(pieces, ...values) {
		return this[ADDTOCLAUSE]('set', new Literal(pieces, values, ', '));
	}

	from(pieces, ...values) {
		return this[ADDTOCLAUSE]('from', new Literal(pieces, values), true);
	}

	join(pieces, ...values) {
		return this[ADDTOCLAUSE]('join', new Literal(pieces, values, '\n').prefix('JOIN '));
	}

	leftJoin(pieces, ...values) {
		return this[ADDTOCLAUSE]('join', new Literal(pieces, values, '\n').prefix('LEFT JOIN '));
	}

	where(pieces, ...values) {
		return this[ADDTOCLAUSE]('where', new Literal(pieces, values, ' AND '));
	}

	orWhere(pieces, ...values) {
		return this[ADDTOCLAUSE]('where', new Literal(pieces, values, ' OR '));
	}

	having(pieces, ...values) {
		return this[ADDTOCLAUSE]('having', new Literal(pieces, values, ' AND '));
	}

	orHaving(pieces, ...values) {
		return this[ADDTOCLAUSE]('having', new Literal(pieces, values, ' OR '));
	}

	groupBy(pieces, ...values) {
		return this[ADDTOCLAUSE]('groupBy', new Literal(pieces, values, ', '));
	}

	orderBy(pieces, ...values) {
		return this[ADDTOCLAUSE]('orderBy', new Literal(pieces, values, ', '));
	}

	update(pieces, ...values) {
		return this[ADDTOCLAUSE]('update', new Literal(pieces, values), true);
	}

	limit(pieces, ...values) {
		return this[ADDTOCLAUSE]('limit', new Literal(pieces, values), true);
	}

	returning(pieces, ...values) {
		return this[ADDTOCLAUSE]('returning', new Literal(pieces, values, ', '));
	}

	get lockInShareMode() {
		return this[ADDTOCLAUSE](`lock`, new Literal([`LOCK IN SHARE MODE`]), true);
	}

	get forUpdate() {
		return this[ADDTOCLAUSE](`lock`, new Literal([`FOR UPDATE`]), true);
	}
}
