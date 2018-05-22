/**
 * Generate prepared statement (parameterized) queries
 * using template literals
 */
class SQLiteraly {
  /**
   * @param {Array} strings Strings to combine
   * @param {Array} values Array of values
   * @param {String} [prefix='$'] Prefix sign
   */
  constructor(strings, values, prefix='$') {
    this._strings = strings;
    this._values = values;
    this.prefix = prefix;
  }

  /**
   * Generate parameterized querie string recursively
   * @param {Number} [index=0] Start index
   * @returns {String} parameterzied string
   * @private
   */
  generate(index = 1) {
    return this._strings.reduce((prev, curr, i) => {
      if (this._values[i-1] instanceof SQLiteraly) {
        let curr = this._values[i-1].generate(index);
        index += this._values.length-1;
        return prev+curr;
      }
      return `${prev}${this.prefix}${index++}${curr}`;
    });
  }

  /**
   * Get parameterzied query
   * @returns {String} query string
   */
  get text() {
    return this.generate();
  }

  /**
   * Get ordered values
   * @returns {Array} values
   */
  get values() {
    return this._values.reduce((prev, curr, i) => {
      return curr instanceof SQLiteraly ? prev.concat(...curr.values) : prev.concat(curr);
    }, []);
  }
}

function SQL(strings, ...values) {
  return new SQLiteraly(strings, values);
}

module.exports = SQL;
