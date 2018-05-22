# SQLiteraly [![Build Status](https://travis-ci.org/terkelg/sqliteraly.svg?branch=master)](https://travis-ci.org/terkelg/sqliteraly)

> Build safe prepared/parameterized statements using tagged template literals

## Installation

```
npm install sqliteraly
```


## Usage

```js
const SQL = require('sqliteraly');

let movie = 'Memento';
let director = 'Christopher Nolan';

let query = SQL`SELECT director FROM movies WHERE title = ${movie}`;

// query.text => 'SELECT director FROM movies WHERE title = $1'
// query.values => ['Memento']
```


## API

### SQL\`string\`

Initializes a new SQLiteraly object based on tagged template string.
The string can contain nested SQLiteraly objects. Indexes and values are taken care of autimatically.

```js
let sub = SQL`${1} + ${1} = 2`;
let main = SQL`${2} + ${2} = 4 and ${sub}`;  

// query.text => 'Main $1 + $2 = 4 and $3 + $4 = 2'
// query.values => [2, 2, 1, 1];
```

### sqliteraly.text

Returns: `String`

Getter that returns the parameterized string.

### sqliteraly.values

Returns: `Array`

Getter that returns the corresponding values in order.


## License

MIT © [Terkel Gjervig](https://terkel.com)