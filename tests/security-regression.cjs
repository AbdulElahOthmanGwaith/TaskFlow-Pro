const assert = require('node:assert/strict');
const { escapeHtml } = require('../security-utils.js');

assert.equal(
    escapeHtml('<img src=x onerror="alert(1)"> & \'task\''),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;task&#39;'
);
assert.equal(escapeHtml(null), '');
assert.equal(escapeHtml(42), '42');

console.log('TaskFlow-Pro security regression tests passed');
