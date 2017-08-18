/*
 ---
 script: Array.sortOn.js
 description: Adds Array.sortOn function and related constants that works like in ActionScript for sorting arrays of objects (applying all same strict rules)
 license: MIT-style license.
 authors:
 - gonchuki
 docs: http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/Array.html#sortOn()
 requires:
 - core/1.2.4: [Array]
 provides:
 - [Array.sortOn, Array.CASEINSENSITIVE, Array.DESCENDING, Array.UNIQUESORT, Array.RETURNINDEXEDARRAY, Array.NUMERIC]
 ...
 */
const CASEINSENSITIVE = 1;

const DESCENDING = 2;

const UNIQUESORT = 4;

const RETURNINDEXEDARRAY = 8;

const NUMERIC = 16;

const toString = Object.prototype.toString;

const slice = Array.prototype.slice;

const isEnumerable = function(item){
  return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
};

const convert = function(item){
  if (item == null) return [];
  return (isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : slice.call(item) : [item];
};

const unique = function(array){
  let source = [];
  for (var i = 0, l = array.length; i < l; i++) {
    let item = array[i];
    if (source.indexOf(item) == -1) {
      source.push(item);
    }
  }
  return source;
};

const sort_fn = function(item_a, item_b, fields, options) {
  return (function sort_by(fields, options) {
    var ret, a, b,
        opts = options[0],
        sub_fields = fields[0].match(/[^.]+/g);

    (function get_values(s_fields, s_a, s_b) {
      var field = s_fields[0];
      if (s_fields.length > 1) {
        get_values(s_fields.slice(1), s_a[field], s_b[field]);
      } else {
        a = s_a[field].toString();
        b = s_b[field].toString();
      }
    })(sub_fields, item_a, item_b);

    if (opts & NUMERIC) {
      ret = (parseFloat(a) - parseFloat(b));
    } else {
      if (opts & CASEINSENSITIVE) { a = a.toLowerCase(); b = b.toLowerCase(); }

      ret = (a > b) ? 1 : (a < b) ? -1 : 0;
    }

    if ((ret === 0) && (fields.length > 1)) {
      ret = sort_by(fields.slice(1), options.slice(1));
    } else if (opts & DESCENDING) {
      ret *= -1;
    }

    return ret;
  })(fields, options);
};

const SortOnImpl = function(fields, options) {
  const dup_fn = (field, field_options)=> {
    var filtered = (field_options & NUMERIC)
        ? this.map(function(item) {return parseFloat(item[field]); })
        : (field_options & CASEINSENSITIVE)
        ? this.map(function(item) {return item[field].toLowerCase(); })
        : this.map(function(item) {return item[field]; });
    return filtered.length !== unique(filtered).length;
  };

  fields = convert(fields);
  options = convert(options);

  if (options.length !== fields.length) options = [];

  if ((options[0] & UNIQUESORT) && (fields.some(function(field, i){return dup_fn(field, options[i]);}))) return 0;

  var curry_sort = function(item_a, item_b) {
    return sort_fn(item_a, item_b, fields, options);
  };

  if (options[0] & RETURNINDEXEDARRAY)
    return this.slice().sort(curry_sort);
  else
    this.sort(curry_sort);
};

const SortOn = (array, ...params)=>{
  SortOnImpl.apply(array, params);
};

SortOn.CASEINSENSITIVE = CASEINSENSITIVE;

SortOn.DESCENDING = DESCENDING;

SortOn.UNIQUESORT = UNIQUESORT;

SortOn.RETURNINDEXEDARRAY = RETURNINDEXEDARRAY;

SortOn.NUMERIC = NUMERIC;

SortOn.polyfill = ()=>{

  Array.CASEINSENSITIVE = CASEINSENSITIVE;

  Array.DESCENDING = DESCENDING;

  Array.UNIQUESORT = UNIQUESORT;

  Array.RETURNINDEXEDARRAY = RETURNINDEXEDARRAY;

  Array.NUMERIC = NUMERIC;

  Array.prototype.sortOn = SortOnImpl;

  Object.defineProperty(Array.prototype, 'sortOn', { enumerable: false });
};

module.exports = SortOn;