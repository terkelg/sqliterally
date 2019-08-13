import Query from './query';
import Literal from './literal';
import {startingClauses} from './constants';

export const query = new Query(startingClauses);
export const sql = (pieces, ...values) => new Literal(pieces, values);
