const fs = require('fs');
const path = require('path');

const from = process.argv[2];
const to = process.argv[3];

if (!from || !to) {
  console.error('Usage: npm run generate-migration <fromVersion> <toVersion>');
  console.error('Example: npm run generate-migration 4.11 4.12');
  process.exit(1);
}

const fromSafe = from.replace(/\./g, 'm');
const toSafe = to.replace(/\./g, 'm');
const fileName = `v${from}-to-v${to}.migration.ts`;
const className = `Migration${fromSafe}To${toSafe}`;

const template = `/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

export class ${className} extends UnitTraversalMigration {
  fromVersion = '${from}';
  toVersion = '${to}';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const newElement = { ...element };
    // Add your migration logic here
    return newElement;
  }
}
`;

const projectRoot = path.join(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'projects/common/migrations');
const filePath = path.join(migrationsDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`Error: File ${fileName} already exists.`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`Success: Created ${fileName} in projects/common/migrations/`);
console.log(`Don't forget to register it in projects/common/services/migration-manager.ts`);
