interface Literal {
	pieces: any[];
	values: any[];
	delimiter: string;
	text: string;
	sql: string;
	constructor(pieces?: string[], values?: any[], delimiter?: string);
	clone(): Literal;
	append(literal: string | Literal, delimiter?: string): Literal;
	prefix(string?: string): Literal;
	suffix(string?: string): Literal;
}

declare class Query {
	constructor(clauses?: any[]);

	build(delimited?: string): Literal;

	select(pieces: string, ...values: any[]): Query;
	update(pieces: string, ...values: any[]): Query;
	set(pieces: string, ...values: any[]): Query;
	from(pieces: string, ...values: any[]): Query;
	join(pieces: string, ...values: any[]): Query;
	leftJoin(pieces: string, ...values: any[]): Query;
	where(pieces: string, ...values: any[]): Query;
	orWhere(pieces: string, ...values: any[]): Query;
	having(pieces: string, ...values: any[]): Query;
	orHaving(pieces: string, ...values: any[]): Query;
	groupBy(pieces: string, ...values: any[]): Query;
	orderBy(pieces: string, ...values: any[]): Query;
	update(pieces: string, ...values: any[]): Query;
	limit(pieces: string, ...values: any[]): Query;
	returning(pieces: string, ...values: any[]): Query;
	lockInShareMode: Query;
	forUpdate: Query;
}

export const query: Query;

type Sql = (pieces: string, ...values: any[]) => Literal;

export const sql: Sql;
