export const ADDTOCLAUSE = Symbol('addToClause');
export const STRINGIFY = Symbol('stringify');

export const clauseOrder = [
	`select`,
	`insert`,
	`delete`,
	`values`,
	`update`,
	`set`,
	`from`,
	`join`,
	`where`,
	`onDuplicate`,
	`groupBy`,
	`having`,
	`orderBy`,
	`limit`,
	`returning`,
	`lock`
];

export const startingClauses = {
	select: [],
	insert: [],
	onDuplicate: [],
	values: [],
	update: [],
	set: [],
	from: [],
	join: [],
	where: [],
	groupBy: [],
	having: [],
	orderBy: [],
	limit: [],
	delete: [],
	returning: [],
	lock: []
};

export const clauseStrings = {
	select: 'SELECT ',
	insert: 'INSERT INTO ',
	onDuplicate: 'ON DUPLICATE KEY UPDATE',
	values: 'VALUES ',
	update: 'UPDATE ',
	set: 'SET ',
	from: 'FROM ',
	join: '',
	where: 'WHERE ',
	groupBy: 'GROUP BY ',
	having: 'HAVING ',
	orderBy: 'ORDER BY ',
	limit: 'LIMIT ',
	delete: 'DELETE ',
	returning: 'RETURNING ',
	lock: ''
};
