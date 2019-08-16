<div align="center">
  <img src="logo.png" alt="sqliterally" height="100" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/sqliterally">
    <img src="https://badgen.now.sh/npm/v/sqliterally" alt="version" />
  </a>
  <a href="https://travis-ci.org/terkelg/sqliterally">
    <img src="https://badgen.now.sh/travis/terkelg/sqliterally" alt="travis" />
  </a>
  <a href="https://npmjs.org/package/sqliterally">
    <img src="https://badgen.now.sh/npm/dm/sqliterally" alt="downloads" />
  </a>
</div>

<p align="center">
  <b>Composable and safe parameterized queries using tagged template literals</b>
</p>

<br>

SQLiterally makes it easy to compose safe parameterized SQL queries using template literals. Clauses are automatically arranged which means you can re-use, subquery and append new clauses as you like – order doesn't matter. All queries are well formatted and ready to be passed directly to [`node-pg`](https://github.com/brianc/node-postgres) and [`mysql`](https://github.com/mysqljs/mysql).

Use SQLiterally as a lightweight alternative to extensive query builders like [`Knex.js`](http://knexjs.org/) or when big ORMs are over-kill.

> **OBS**: _SQLiterally provides a lot of freedom by design and it's not meant to reduce the SQL learning curve. It won't prevent you from writing incorrect queries._

## Features

* Build queries programmatically
* Works directly with [`node-pg`](https://github.com/brianc/node-postgres) and [`mysql`](https://github.com/mysqljs/mysql)
* Supports nested sub-queries
* Queries are parametrized  to protect against SQL injections
* Write SQL as you like with no restrictions using string literals
* Produces well-formatted queries with line breaks
* Lightweight with **no dependencies**!

This module exposes two module definitions:

* **ES Module**: `dist/sqliterally.mjs`
* **CommonJS**: `dist/sqliterally.js`


## Installation

```
npm install sqliterally
# or
yarn add sqliterally
```

## Usage

The module exposes two functions:
 * [**sql**](#sqlstring): Use this to construct any query. Useful for complex SQL scripts or when you know the full query and all you need is a parameterized query object.
 * [**query**](#query): Use this to programmatically compose parameterized queries. Useful for constructing queries as you go.
 
 ```js
import {sql, query} from 'sqliterally';

let movie = 'Memento', year = 2001;

sql`SELECT director FROM movies WHERE title = ${movie}`;
// => {
//  text: 'SELECT director FROM movies WHERE title = $1'
//  sql => 'SELECT director FROM movies WHERE title = ?'
//  values => ['Memento']
// }

let q = query
    .select`director`
    .select`year`
    .from`movies`
    .where`title = ${movie}`
    .limit`5`;

if (year) q = q.where`year >= ${year}`;
if (writers) q = q.select`writers`;

q.build();
// => {
//  text: `SELECT director, year FROM movies WHERE title = $1 AND year >= $2 LIMIT 5'
//  sql => 'SELECT director, year FROM movies WHERE title = ? AND year >= ? LIMIT 5'
//  values => ['Memento', 2001]
// }
```

## API

### sql\`string\`

Returns: `Object`

The string can contain nested SQLiterally `query` and `sql` objects. 
Indexes and values are taken care of automatically.

You can pass this directly to [`node-pg`](https://github.com/brianc/node-postgres) and [`mysql`](https://github.com/mysqljs/mysql).

```js
let name = 'Harry Potter';
let max = 10, min = 0;

sub = sql`age > ${min} AND age < ${max}`;
sql`SELECT * FROM x WHERE name = ${name} OR (${sub}) LIMIT 2`;
// => { 
//  text: 'SELECT * FROM x WHERE name = $1 OR (age > $2 OR age < $3) LIMIT 2', 
//  sql: 'SELECT * FROM x WHERE name = ? OR (age > ? OR age < ?) LIMIT 2',
//  values: ['Harry Potter', 0, 10]
// }

let script = sql`
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';
`
// => { text: 'CREATE OR REPL...', sql: 'CREATE OR REPL...' values: [] }
```

#### text

Type: `String`

Getter that returns the parameterized string for [Postgres](https://github.com/brianc/node-postgres).


#### sql

Type: `String`

Getter that returns the parameterized string for [MySQL](https://github.com/mysqljs/mysql).


#### values

Type: `Array`

Getter that returns the corresponding values in order.


### query

Build a query by adding clauses. The order in which clauses are added doesn't matter. The final output is sorted and returned in the correct order no matter what order you call the methods in.

You can nest as many `query` and `sql` as you like. You don't have to build sub-queries before nesting them.

`query` is immutable and all method calls return a new instance. This means you can build up a base query and re-use it. For example, with conditional where clauses or joins.

> **OBS:** If you call a method multiple times, the values are concatenated in the same order you called them.

```js
let age = 13, limit = 10, page = 1, paginate = false;

let sub = query
    .select`id`
    .from`customers`
    .where`salary > 45000`;

let main = query
    .select`*`
    .from`customers`
    .where`age > '${age}'`
    .where`id IN (${sub})`;

main = paginate ? main.limit`${limit} OFFSET ${limit * page}` : main;

main.build();
```

#### build(delimiter?)

Constructs the final query and returns a [`sql`](#sql) query object ready for [`node-pg`](https://github.com/brianc/node-postgres) and [`mysql`](https://github.com/mysqljs/mysql).

> You can still append to the returned `sql` object or use it as a sub-query. You don't have to call `.build()` when nesting queries – there's no reason to call build before you need the parameterized string and values. 

##### delimiter

Type: `String`<br>
Default: `\n`

Change the delimiter used to combine clauses. The default is a line break.

#### select\`string\`

Returns: `query`

All `.select` calls get reduced and joined with `, ` on `.build()`.

```js
query.select`*`.build() 
// => SELECT *
query.select`cat`.select`zebra`.build() 
// => SELECT cat, zebra
query.select`cat, dog`.select`zebra`.build() 
// => SELECT cat, dog, zebra
query.select`something`.select`5 * 3 AS result`.build() 
// => SELECT something, 5 * 3 AS result
```


#### update\`string\`

Returns: `query`

Calling `.update` more than once result in the clause being overwritten.

```js
query.update`film`.build() 
// => UPDATE film
query.update`film`.update`books`.build() 
// => UPDATE books
```

#### set\`string\`

Returns: `query`

All `.set` calls get reduced and joined with `, ` on `.build()`.

```js
query.set`a = b`.build() 
// => SET a = b
query.set`a = b`.set`z = y`.build() 
// => SET a = b, z = y
```

#### from\`string\`

Returns: `query`

Calling `.from` more than once result in the clause being overwritten.

```js
query.from`film`.build() 
// => FROM film
query.from`film AS f`.build() 
// => FROM film AS f
query.from`film`.from`books`.build() 
// => FROM books
```

#### join\`string\`

Returns: `query`

```js
query.join`c ON d`.build() 
// => JOIN c ON d
query.join`a ON b.id`.join`c ON d`.build() 
// => JOIN a ON b.id\nJOIN c ON d
```

#### leftJoin\`string\`

```js
query.leftJoin`c ON d`.build() 
// => LEFT JOIN c ON d
query.leftJoin`a ON b.id`.leftJoin`c ON d`.build() 
// => LEFT JOIN a ON b.id\nLEFT JOIN c ON d
```

#### where\`string\`

Returns: `query`

All `.where` calls get reduced and joined with ` AND ` on `.build()`.

```js
query.where`a < b`.build() 
// => WHERE a < b
query.where`a < b`.where`z = y`.build() 
// => WHERE a < b AND z = y
query.where`a = z OR a = y`.build() 
// => WHERE a = z OR a = y
```

#### orWhere\`string\`

Returns: `query`

All `.orWhere` calls get reduced and joined with ` OR ` on `.build()`.

```js
query.orWhere`a < b`.build()
// => WHERE a < b
query.orWhere`a < b`.orWhere`z = y`.build() 
// => WHERE a < b OR z = y
```

#### having\`string\`

Returns: `query`

All `.having` calls get reduced and joined with ` AND ` on `.build()`.

```js
query.having`MAX (list_price) > 4000`
// => HAVING MAX (list_price) > 4000
query.having`MAX (list_price) > 4000`.having`MIN (list_price) < 500`
// => HAVING MAX (list_price) > 4000 AND MIN (list_price) < 500'
```

#### orHaving\`string\`

Returns: `query`

All `.orHaving` calls get reduced and joined with ` OR ` on `.build()`.

```js
query.orHaving`MAX (list_price) > 4000`
// => HAVING MAX (list_price) > 4000
query.orHaving`MAX (list_price) > 4000`.orHaving`MIN (list_price) < 500`
// => HAVING MAX (list_price) > 4000 OR MIN (list_price) < 500'
```

#### groupBy\`string\`

Returns: `query`

All `.groupBy` calls get reduced and joined with `, ` on `.build()`.

```js
query.groupBy`a, b`.groupBy`c`.groupBy`d`.build()
// => GROUP BY a, b, c, d
```

#### orderBy\`string\`

Returns: `query`

All `.orderBy` calls get reduced and joined with `, ` on `.build()`.

```js
query.orderBy`a, b`.orderBy`COUNT(c) DESC`.orderBy`d`.build()
// => ORDER BY a, b, COUNT(c) DESC, d
```

#### limit\`string\`

Returns: `query`

Calling `.limit` more than once result on the clause being overwritten.

```js
query.limit`5`.build()
// => LIMIT 5
query.limit`5 OFFSET 2`.build()
// => LIMIT 5 OFFSET 2
query.limit`5`.limit`10`.build()
// => LIMIT 10
```

#### returning\`string\`

Returns: `query`

All `.returning` calls get reduced and joined with `, ` on `.build()`.

```js
query.returning`a, b`.returning`c`.returning`d`.build()
// => RETURNING a, b, c, d
```

#### lockInShareMode

Returns: `query`

Getter method. Multiple invocations get ignored.

```js
query.lockInShareMode.build()
// => LOCK IN SHARE MODE
query.select`*`.from`x`.lockInShareMode.build()
// => SELECT * FROM x LOCK IN SHARE MODE
```

#### forUpdate

Returns: `query`

Getter method. Multiple invocations get ignored.

```js
query.forUpdate.build()
// => FOR UPDATE
query.select`*`.from`x`.forUpdate.build()
// => SELECT * FROM x FOR UPDATE
query.select`*`.from`x`.lockInShareMode.forUpdate.build()
// => SELECT * FROM x LOCK IN SHARE MODE FOR UPDATE
```

## Credit

This module is inspired by [sql-concat](https://github.com/TehShrike/sql-concat) but with a different implementation, support for Postgres, single queries and with a reduced API.

The `sql` function and merge algorithm are based on [prepare-sql](https://github.com/hyperdivision/prepare-sql).


## [License](./LICENSE)

MIT © [Terkel Gjervig](https://terkel.com)
