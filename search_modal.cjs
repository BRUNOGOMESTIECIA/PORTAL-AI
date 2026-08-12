const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Bruno Gomes/Documents/PORTAL-AI/apps/web/src';

function searchInDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchInDir(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('adicionado ao board') || c.includes('Ticket criado!')) {
        console.log(full);
      }
    }
  }
}

searchInDir(srcDir);
