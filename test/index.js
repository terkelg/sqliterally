const test = require('tape');
const {sql, query} = require('../dist/sqliterally');

test('sqliterally', t => {
	t.is(typeof sql, 'function', 'exports object');
	t.is(typeof query , 'object', 'exports object');
	t.end();
});


test('sql', t => {
	let x = sql`SELECT * FROM animals`;
	t.is(x.text, 'SELECT * FROM animals');
	t.is(x.sql, 'SELECT * FROM animals');
	t.same(x.values, []);
	t.end();
});

test('sql: parameterized', t => {
	let movie = 'Memento';
	let x = sql`SELECT director FROM movies WHERE title = ${movie}`;
	t.is(x.text, 'SELECT director FROM movies WHERE title = $1');
	t.is(x.sql, 'SELECT director FROM movies WHERE title = ?');
	t.same(x.values, ['Memento']);

	x = sql`SELECT ${'lion'}, ${'zebra'} FROM animals WHERE age < ${2}`;
	t.is(x.text, 'SELECT $1, $2 FROM animals WHERE age < $3');
	t.is(x.sql, 'SELECT ?, ? FROM animals WHERE age < ?');
	t.same(x.values, ['lion', 'zebra', 2]);

	x = sql``;
	t.is(x.text, '');
	t.same(x.values, []);
	t.end();
});

test('sql: append', t => {
	let x = sql`SELECT * FROM animals`.append(` WHERE x = y`);
	t.is(x.text, 'SELECT * FROM animals WHERE x = y');
	t.is(x.sql, 'SELECT * FROM animals WHERE x = y');
	t.same(x.values, []);

	let sub = sql` WHERE id = ${1}`;
	x = sql`SELECT * FROM animals`.append(sub);
	t.is(x.text, 'SELECT * FROM animals WHERE id = $1');
	t.is(x.sql, 'SELECT * FROM animals WHERE id = ?');
	t.same(x.values, [1]);

	t.end();
});

test('sql: empty input', t => {
	let x = sql``;
	t.is(x.text, '');
	t.same(x.values, []);
	t.end();
});

test('sql: null and undefined input', t => {
	let x = sql`INSERT INTO test VALUES (${undefined}, ${null})`;
	t.is(x.text, 'INSERT INTO test VALUES ($1, $2)');
	t.same(x.values, [undefined, null]);
	t.end();
});

test('sql: nested', t => {
	let field = 'cust_name', value = 5000;
	let sub = sql`SELECT DISTINCT cust_id, ${field} FROM orders WHERE order_value > ${value}`;
	let x = sql`SELECT * FROM customers WHERE cust_id IN (${sub})`;
	t.is(x.text, 'SELECT * FROM customers WHERE cust_id IN (SELECT DISTINCT cust_id, $1 FROM orders WHERE order_value > $2)');
	t.is(x.sql, 'SELECT * FROM customers WHERE cust_id IN (SELECT DISTINCT cust_id, ? FROM orders WHERE order_value > ?)');
	t.same(x.values, [field, value]);
	t.end();
});

test('query', t => {
	let x = query.select`*`.from`animals`;
	let clauseMethods = [
		'select', 'from', 'join', 'leftJoin', 'where', 'orWhere',
		'having', 'orHaving', 'groupBy', 'orderBy', 'update',
		'limit', 'lockInShareMode', 'forUpdate', 'returning'
	]
	clauseMethods.forEach(clause => t.is(clause in query, true))
	t.end();
});

test('query: build', t => {
	let x = query.select`*`.from`animals`.build();
	t.is(x.text, 'SELECT *\nFROM animals');
	t.same(x.values, []);
	t.end();
});

test('query: build custom delimiter', t => {
	let x = query.select`*`.from`animals`.build(' ');
	t.is(x.text, 'SELECT * FROM animals');
	t.same(x.values, []);
	t.end();
});

test('query: parameterized', t => {
	let name = 'dumbo';
	let column = 'name';
	let x = query
		.select`${column}`
		.from`animals`
		.where`name = ${name}`
		.build();

	t.is(x.text, 'SELECT $1\nFROM animals\nWHERE name = $2');
	t.is(x.sql, 'SELECT ?\nFROM animals\nWHERE name = ?');
	t.same(x.values, [column, name]);
	t.end();
});

test('query: order clauses', t => {
	let x = query
		.where`a = ${1}`
		.from`table`
		.select`*`
		.forUpdate
		.where`b = ${2}`
		.build()
	t.is(x.text, 'SELECT *\nFROM table\nWHERE a = $1 AND b = $2\nFOR UPDATE');
	t.is(x.sql, 'SELECT *\nFROM table\nWHERE a = ? AND b = ?\nFOR UPDATE');
	t.same(x.values, [1, 2]);

	x = query
		.set`kind = Dramatic`
		.update`films`
		.set`duration = 120`
		.build()
	t.is(x.text, 'UPDATE films\nSET kind = Dramatic, duration = 120');
	t.same(x.values, []);

	t.end();
});

test('query: select clause', t => {
	let x = query
		.select`a, b, ${'c'}`
		.select`x`
		.select`y`
		.select`z`
		.build();

	t.is(x.text, 'SELECT a, b, $1, x, y, z');
	t.is(x.sql, 'SELECT a, b, ?, x, y, z');
	t.same(x.values, ['c']);
	t.end();
});

test('query: from clause', t => {
	let x = query
		.from`animals`
		.from`humans`
		.from`aliens`
		.build();

	t.is(x.text, 'FROM aliens');
	t.is(x.sql, 'FROM aliens');
	t.same(x.values, []);
	t.end();
});

test('query: where clause', t => {
	let x = query
		.where`a > b`
		.where`z = y`
		.where`c = ${11}`
		.build();
	t.is(x.text, 'WHERE a > b AND z = y AND c = $1');
	t.is(x.sql, 'WHERE a > b AND z = y AND c = ?');
	t.same(x.values, [11]);

	x = query
		.orWhere`a > b`
		.orWhere`z = y`
		.orWhere`c = ${11}`
		.build();
	t.is(x.text, 'WHERE a > b OR z = y OR c = $1');
	t.is(x.sql, 'WHERE a > b OR z = y OR c = ?');
	t.same(x.values, [11]);

	x = query
		.where`a > b`
		.orWhere`z = y`
		.where`c = ${11}`
		.where`(q > 1 AND q < 10)`
		.build();
	t.is(x.text, 'WHERE a > b OR z = y AND c = $1 AND (q > 1 AND q < 10)');
	t.is(x.sql, 'WHERE a > b OR z = y AND c = ? AND (q > 1 AND q < 10)');
	t.same(x.values, [11]);

	t.end();
});

test('query: update', t => {
	let x = query
		.update`films`
		.set`kind = Dramatic`
		.set`duration = 120`
		.where`id = 2`
		.returning`*`
		.build();
	t.is(x.text, 'UPDATE films\nSET kind = Dramatic, duration = 120\nWHERE id = 2\nRETURNING *');
	t.same(x.values, []);

	x = query
		.update`not me`
		.update`films`
		.set`kind = Dramatic`
		.returning`title`
		.returning`duration`
		.build();
	t.is(x.text, 'UPDATE films\nSET kind = Dramatic\nRETURNING title, duration');
	t.same(x.values, []);

	t.end();
});

test('query: join', t => {
	let x = query
		.join`a ON b.id = a.id`
		.join`c ON d`
		.build();
	t.is(x.text, 'JOIN a ON b.id = a.id\nJOIN c ON d');
	t.same(x.values, []);

	x = query
		.leftJoin`a ON b.id = a.id`
		.leftJoin`c ON d`
		.build();
	t.is(x.text, 'LEFT JOIN a ON b.id = a.id\nLEFT JOIN c ON d');
	t.same(x.values, []);

	x = query
		.join`a ON b.id = a.id`
		.leftJoin`c ON d`
		.build();
	t.is(x.text, 'JOIN a ON b.id = a.id\nLEFT JOIN c ON d');
	t.same(x.values, []);

	t.end();
});

test('query: having', t => {
	let x = query
		.having`MAX (list_price) > 4000`
		.having`MIN (list_price) < 500`
	.build();
	t.is(x.text, 'HAVING MAX (list_price) > 4000 AND MIN (list_price) < 500');
	t.same(x.values, []);

	x = query
		.having`MAX (list_price) > 4000`
		.orHaving`MIN (list_price) < 500`
	.build();
	t.is(x.text, 'HAVING MAX (list_price) > 4000 OR MIN (list_price) < 500');
	t.same(x.values, []);

	t.end();
});

test('query: group by', t => {
	let x = query
		.groupBy`a, b`
		.groupBy`c`
		.groupBy`d`
	.build();

	t.is(x.text, 'GROUP BY a, b, c, d');
	t.same(x.values, []);
	t.end();
});

test('query: order by', t => {
	let x = query
		.orderBy`a, b`
		.orderBy`COUNT(c) DESC`
		.orderBy`d`
	.build();

	t.is(x.text, 'ORDER BY a, b, COUNT(c) DESC, d');
	t.same(x.values, []);
	t.end();
});

test('query: limit', t => {
	let x = query
		.limit`10`
		.limit`5`
	.build();

	t.is(x.text, 'LIMIT 5');
	t.same(x.values, []);
	t.end();
});

test('query: returning', t => {
	let x = query
		.returning`name`
		.returning`email`
	.build();

	t.is(x.text, 'RETURNING name, email');
	t.same(x.values, []);
	t.end();
});

test('query: lock share mode', t => {
	let x = query
		.lockInShareMode
		.build();
	t.is(x.text, 'LOCK IN SHARE MODE');
	t.same(x.values, []);

	x = query
		.lockInShareMode
		.lockInShareMode
		.build();
	t.is(x.text, 'LOCK IN SHARE MODE');
	t.end();
});

test('query: for update', t => {
	let x = query
		.forUpdate
		.build();
	t.is(x.text, 'FOR UPDATE');
	t.same(x.values, []);

	x = query
		.forUpdate
		.forUpdate
		.build();
	t.is(x.text, 'FOR UPDATE');
	t.end();
});

test('query: build twice', t => {
	let x = query.select`*`.from`users`.where`id = ${123}`;
	x.build();
	x = x.build(' ');
	t.is(x.text, 'SELECT * FROM users WHERE id = $1');
	t.is(x.sql, 'SELECT * FROM users WHERE id = ?');
	t.same(x.values , [123]);
	t.end();
});

test('query: nested', t => {
	let sub = query.select`*`.from`users`.where`id = ${123}`;
	let main = query.select`*`.from`posts`.where`user = (${sub})`.build();
	t.is(main.text, 'SELECT *\nFROM posts\nWHERE user = (SELECT * FROM users WHERE id = $1)');
	t.is(main.sql, 'SELECT *\nFROM posts\nWHERE user = (SELECT * FROM users WHERE id = ?)');
	t.same(main.values , [123]);
	t.end();
});
