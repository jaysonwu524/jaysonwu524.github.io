import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { Converter } from 'opencc-js';

const convert = Converter({ from: 'cn', to: 'tw' });
// Traditional Chinese is a reproducible character conversion of the authored
// Simplified Chinese source. Keep English and Japanese as independently edited files.
for (const collection of ['articles', 'projects']) {
  const base = new URL(`../src/content/${collection}/`, import.meta.url);
  const target = new URL('zh-tw/', base);
  await mkdir(target, { recursive: true });
  for (const file of await readdir(base)) {
    if (!file.endsWith('.md')) continue;
    const source = await readFile(new URL(file, base), 'utf8');
    const translated = convert(source)
      .replaceAll('../../assets/', '../../../assets/')
      .replace(/\]\(\/(articles|projects)(\/[^)]*)?\)/g, '](/zh-tw/$1$2)');
    const output = new URL(file, target);
    const previous = await readFile(output, 'utf8').catch(() => '');
    if (previous !== translated) await writeFile(output, translated);
  }
}
