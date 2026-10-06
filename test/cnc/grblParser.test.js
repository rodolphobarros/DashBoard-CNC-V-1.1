import assert from 'node:assert/strict';
import test from 'node:test';

import { parseGrblLine } from '../../src/cnc/machine/grblParser.js';

test('normalizes Grbl Hold:0 status to HOLD', () => {
  const response = parseGrblLine('<Hold:0|MPos:1.000,2.000,3.000|FS:0,0>');

  assert.equal(response.type, 'STATUS');
  assert.equal(response.status, 'Hold');
});

test('normalizes Grbl Hold:1 status to HOLD', () => {
  const response = parseGrblLine('<Hold:1|MPos:1.000,2.000,3.000|FS:0,0>');

  assert.equal(response.type, 'STATUS');
  assert.equal(response.status, 'Hold');
});
