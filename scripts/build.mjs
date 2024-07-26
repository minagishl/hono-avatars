// I've forced myself to implement it and look forward to the future.
// If you have a good idea, please create a pull request!

import fs from 'node:fs';
import path from 'node:path';

// Rename index.js to _worker.js
fs.renameSync(path.resolve('dist/index.js'), path.resolve('dist/_worker.js'));

// Delete unnecessary files
fs.unlinkSync(path.resolve('dist/index.js.map'));
fs.unlinkSync(path.resolve('dist/README.md'));
