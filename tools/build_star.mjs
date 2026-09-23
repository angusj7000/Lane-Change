// Builds the Lane Change four-point compass star (src/assets/brand/star.svg).
// Usage: node tools/build_star.mjs
import { writeFileSync } from 'node:fs';

// Four-point compass star with long vertical axis (brand star)
const star = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -70 100 140" fill="currentColor">
<path d="M0 -70 C3 -22 6 -6 50 0 C6 6 3 22 0 70 C-3 22 -6 6 -50 0 C-6 -6 -3 -22 0 -70Z"/>
</svg>
`;
writeFileSync('src/assets/brand/star.svg', star);
console.log('star written');
