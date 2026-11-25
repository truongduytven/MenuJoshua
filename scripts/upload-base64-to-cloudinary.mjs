import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_API_BASE = 'https://menu-food.joshuatools.dev';
const DEFAULT_FOLDER = 'menu_joshua';
const BASE64_IMAGE_PREFIX = /^data:image\/[a-zA-Z0-9+.-]+;base64,/;

/**
 * Load key=value pairs from .env / .env.local into process.env when unset.
 */
function loadEnvFiles(rootDir) {
  for (const filename of ['.env', '.env.local']) {
    const filePath = path.join(rootDir, filename);
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx <= 0) continue;

      const key = line.slice(0, eqIdx).trim();
      let value = line.slice(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

/**
 * Parse supported CLI flags.
 */
function parseArgs(argv) {
  const options = {
    dryRun: false,
    limit: Infinity,
    id: null,
    folder: DEFAULT_FOLDER,
    apiBase: DEFAULT_API_BASE,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--limit=')) {
      const parsed = Number.parseInt(arg.slice('--limit='.length), 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`Invalid --limit value: ${arg}`);
      }
      options.limit = parsed;
    } else if (arg.startsWith('--id=')) {
      options.id = arg.slice('--id='.length).trim();
    } else if (arg.startsWith('--folder=')) {
      options.folder = arg.slice('--folder='.length).trim() || DEFAULT_FOLDER;
    } else if (arg.startsWith('--api-base=')) {
      options.apiBase = arg.slice('--api-base='.length).replace(/\/+$/, '');
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage: node scripts/upload-base64-to-cloudinary.mjs [options]',
          '',
          'Options:',
          '  --dry-run           Inspect items and verify config without uploading or updating',
          '  --limit=N           Process at most N base64 items',
          '  --id=RES_ID         Process only the restaurant with matching id',
          '  --folder=NAME       Cloudinary folder (default: menu_joshua)',
          '  --api-base=URL      Target API origin (default: https://menu-food.joshuatools.dev)',
        ].join('\n')
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function getRequestHeaders(apiBase) {
  return {
    accept: '*/*',
    'accept-language': 'vi,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    referer: `${apiBase}/`,
    origin: apiBase,
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
  };
}

/**
 * Generate a Cloudinary SHA-1 signature for sorted upload parameters.
 */
function signCloudinaryParams(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${serialized}${apiSecret}`)
    .digest('hex');
}

async function fetchRestaurants(apiBase) {
  const res = await fetch(`${apiBase}/api/restaurants`, {
    method: 'GET',
    headers: getRequestHeaders(apiBase),
  });

  const payload = await res.json();
  if (!res.ok || !payload.success || !Array.isArray(payload.data)) {
    throw new Error(
      `Failed to fetch restaurants (${res.status}): ${payload.error || 'Unexpected response'}`
    );
  }
  return payload.data;
}

async function uploadBase64ToCloudinary({ dataUri, publicId, folder, cloudName, apiKey, apiSecret }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = {
    folder,
    overwrite: 'true',
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const signature = signCloudinaryParams(signedParams, apiSecret);

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', signedParams.timestamp);
  form.append('folder', signedParams.folder);
  form.append('public_id', signedParams.public_id);
  form.append('overwrite', signedParams.overwrite);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const result = await res.json();
  if (!res.ok || !result.secure_url) {
    throw new Error(
      `Cloudinary upload failed (${res.status}): ${result.error?.message || JSON.stringify(result)}`
    );
  }

  return result.secure_url;
}

async function updateRestaurantImageUrl(apiBase, id, imageUrl) {
  const res = await fetch(`${apiBase}/api/restaurants/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      ...getRequestHeaders(apiBase),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(
      `Update restaurant ${id} failed (${res.status}): ${payload.error || 'Unexpected response'}`
    );
  }

  return payload.data;
}

async function main() {
  const rootDir = process.cwd();
  loadEnvFiles(rootDir);
  const options = parseArgs(process.argv.slice(2));

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET in environment/.env'
    );
  }

  console.log(`Fetching restaurants from ${options.apiBase}/api/restaurants ...`);
  const allRestaurants = await fetchRestaurants(options.apiBase);

  let targets = allRestaurants.filter(
    (item) => typeof item.imageUrl === 'string' && BASE64_IMAGE_PREFIX.test(item.imageUrl)
  );

  if (options.id) {
    targets = targets.filter((item) => item.id === options.id);
  }

  if (Number.isFinite(options.limit)) {
    targets = targets.slice(0, options.limit);
  }

  console.log(
    `Total restaurants: ${allRestaurants.length} | Base64 targets to process: ${targets.length} | Folder: ${options.folder}`
  );

  if (targets.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  if (options.dryRun) {
    console.log('\n[DRY RUN] No images will be uploaded and no records will be updated:');
    targets.forEach((item, index) => {
      const approxKb = Math.round((item.imageUrl.length * 3) / 4 / 1024);
      console.log(`  ${index + 1}. ${item.id} | ${item.name} (~${approxKb} KB)`);
    });
    return;
  }

  const failures = [];
  let succeeded = 0;

  for (let i = 0; i < targets.length; i += 1) {
    const item = targets[i];
    const label = `[${i + 1}/${targets.length}] ${item.id} (${item.name})`;

    try {
      const secureUrl = await uploadBase64ToCloudinary({
        dataUri: item.imageUrl,
        publicId: item.id,
        folder: options.folder,
        cloudName,
        apiKey,
        apiSecret,
      });

      await updateRestaurantImageUrl(options.apiBase, item.id, secureUrl);
      succeeded += 1;
      console.log(`✓ ${label} -> ${secureUrl}`);
    } catch (error) {
      failures.push({ id: item.id, name: item.name, error: error.message });
      console.error(`✗ ${label} -> ${error.message}`);
    }
  }

  console.log(`\nDone. Succeeded: ${succeeded}/${targets.length}, Failed: ${failures.length}`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
