import fs from 'fs';
import path from 'path';

const paths = [
  'dist/server/server.js',
  'dist/client/server/server.js'
];

let found = false;
for (const p of paths) {
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, 'api/server.js');

    const assetsSource = path.join(path.dirname(p), 'assets');
    if (fs.existsSync(assetsSource)) {
      fs.rmSync('api/assets', { recursive: true, force: true });
      fs.cpSync(assetsSource, 'api/assets', { recursive: true });
      console.log(`Successfully copied assets from ${assetsSource} to api/assets`);
    }

    console.log(`Successfully copied ${p} to api/server.js`);
    found = true;
    break;
  }
}

if (!found) {
  console.error('Could not find server.js in any of the expected locations:');
  paths.forEach(p => console.error(` - ${p}`));
  process.exit(1);
}
