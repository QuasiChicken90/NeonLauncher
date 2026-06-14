import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir, cb) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  }
}

walk('build', (p) => {
  if (p.endsWith('.html') || p.endsWith('.js') || p.endsWith('.css')) {
    let content = readFileSync(p, 'utf-8');
    const fixed = content
      .replace(/(["'`])\/_app\//g, '$1./_app/')
      .replace(/from\s*["']\/_app\//g, 'from"./_app/')
      .replace(/import\(["']\/_app\//g, 'import("./_app/');
    if (fixed !== content) writeFileSync(p, fixed);
  }
});

