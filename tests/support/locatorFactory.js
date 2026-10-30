import fs from 'fs';
import path from 'path';

const SELECTOR_FILE = path.resolve(process.cwd(), 'tests/support/selectors/element-selectors.xml');

function parseSelectors() {
  const xml = fs.readFileSync(SELECTOR_FILE, 'utf8');
  const pageRegex = /<page\s+name="([^"]+)"\s*>([\s\S]*?)<\/page>/g;
  const selectorMap = {};

  for (const pageMatch of xml.matchAll(pageRegex)) {
    const pageName = pageMatch[1];
    const pageContent = pageMatch[2];
    const keyRegex = /<key\s+name="([^"]+)"\s*>([\s\S]*?)<\/key>/g;

    for (const keyMatch of pageContent.matchAll(keyRegex)) {
      const keyName = keyMatch[1];
      const selector = keyMatch[2].trim();
      selectorMap[`${pageName}.${keyName}`] = selector;
    }
  }

  return selectorMap;
}

const selectorMap = parseSelectors();

export function getSelector(pageName, keyName) {
  const selectorKey = `${pageName}.${keyName}`;
  const selector = selectorMap[selectorKey];

  if (!selector) {
    throw new Error(`Missing selector for '${selectorKey}' in XML locator file.`);
  }

  return selector;
}

export function getPageSelectors(pageName) {
  return Object.fromEntries(
    Object.entries(selectorMap)
      .filter(([key]) => key.startsWith(`${pageName}.`))
      .map(([key, value]) => [key.replace(`${pageName}.`, ''), value])
  );
}
