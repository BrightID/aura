import path from 'path';
import * as packageInfo from '../package.json';
import * as vercelDeployInfo from '../vercel.json';
import fs from 'fs/promises';

const buildDirectory = vercelDeployInfo.outputDirectory;

const versionStoreFile = 'versioning.txt';

async function main() {
  console.log('[*] Generating version file...');

  await fs.writeFile(
    path.join(buildDirectory, versionStoreFile),
    packageInfo.version,
  );

  console.log(
    '[*] Created a version successfully. make sure to increment the version inside the package.json for next release',
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
