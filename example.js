const { query, sql } = require('./dist/sqliterally.js');

const number = 34;
const name = 'Potter';

let result, sub;

// Simple query
result = sql`SELECT * FROM movies WHERE title = ${name}`;
console.log(result.text, result.values);

// Append string to query
result = sql`SELECT * FROM movies WHERE title = ${name}`.append(` LIMIT 5`);
console.log(result.text, result.values);

// Append subquery
sub = sql` AND age < ${number}`;
result = sql`SELECT * FROM movies WHERE title = ${name}`.append(sub);
console.log(result.text, result.values);

// Query
result = query.select`title`.select`id`.from`movies`.where`age < ${number}`
	.where`name = ${name}`.limit`5`.build();

console.log(result.text, result.values); // postgres
console.log(result.sql, result.values); // mysql
