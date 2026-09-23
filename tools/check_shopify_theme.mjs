// Lint the Shopify theme with Shopify's Theme Check (same rules as `shopify theme check`).
//   npm run shopify:check
import { themeCheckRun } from '@shopify/theme-check-node';
import { resolve } from 'node:path';

const root = resolve('shopify/theme');
const { offenses } = await themeCheckRun(root, undefined, () => {});
const sev = ['error', 'warning', 'info'];
for (const o of offenses) {
  console.log(`${sev[o.severity] ?? o.severity}  ${o.uri.replace(/^file:\/\//, '').replace(root + '/', '')}:${o.start.line + 1}  ${o.check}  ${o.message}`);
}
const errors = offenses.filter((o) => o.severity === 0).length;
console.log(`\n${offenses.length} offenses (${errors} errors)`);
process.exit(errors ? 1 : 0);
