import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    tables: [],
    columns: null,
    nullColumns: [],
    duplicateColumn: null,
    piiColumns: [],
    pageSize: 1000,
    maxRows: null,
    out: null,
  };

  const tokens = argv.slice(2);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    const next = () => {
      const v = tokens[i + 1];
      if (v === undefined || v.startsWith('--')) throw new Error(`Missing value for ${t}`);
      i++;
      return v;
    };

    if (t === '--table') {
      args.tables.push(next());
      continue;
    }
    if (t === '--tables') {
      args.tables.push(...next().split(',').map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (t === '--columns') {
      args.columns = next().split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (t === '--null') {
      args.nullColumns = next().split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (t === '--dup') {
      args.duplicateColumn = next();
      continue;
    }
    if (t === '--pii') {
      args.piiColumns = next().split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (t === '--page-size') {
      args.pageSize = Number(next());
      if (!Number.isFinite(args.pageSize) || args.pageSize <= 0) throw new Error('Invalid --page-size');
      continue;
    }
    if (t === '--max-rows') {
      args.maxRows = Number(next());
      if (!Number.isFinite(args.maxRows) || args.maxRows <= 0) throw new Error('Invalid --max-rows');
      continue;
    }
    if (t === '--out') {
      args.out = next();
      continue;
    }
    if (t === '--help' || t === '-h') {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${t}`);
  }

  return args;
}

function usage() {
  return [
    'Supabase table scan (JSON report)',
    '',
    'Required env:',
    '  SUPABASE_URL',
    '  SUPABASE_KEY',
    '',
    'Usage:',
    '  node scripts/supabase-scan.mjs [options]',
    '',
    'Options:',
    '  --table <name>           Table to scan (repeatable)',
    '  --tables a,b,c           Comma-separated tables',
    '  --columns a,b,c          Only select these columns (default: *)',
    '  --null a,b,c             Flag rows where any of these columns is null/empty',
    '  --dup <column>           Flag duplicate values in a column',
    '  --pii a,b,c              PII-like pattern scan on these columns',
    '  --page-size <n>          Pagination size (default: 1000)',
    '  --max-rows <n>           Stop after reading n rows per table',
    '  --out <path>             Write JSON report to a file',
    '  (no --table/--tables)    Auto-discover tables and scan/dump all accessible tables',
    '',
    'Examples:',
    '  node scripts/supabase-scan.mjs --table members --null email,name --dup email --pii email,phone --out report.json',
    '  node scripts/supabase-scan.mjs --out db-dump.json',
  ].join('\n');
}

function isEmptyValue(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

function piiMatch(value) {
  if (value === null || value === undefined) return null;
  const s = String(value);

  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const phone = /(?:(?:\+?\d{1,3})?[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/;
  const creditCardLike = /\b(?:\d[ -]*?){13,19}\b/;

  if (email.test(s)) return 'email';
  if (creditCardLike.test(s)) return 'credit_card_like';
  if (phone.test(s)) return 'phone_like';
  return null;
}

function parseDotEnv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

async function loadEnvLocal() {
  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'client', '.env.local'),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '.env.local'),
  ];

  for (const p of candidates) {
    try {
      const content = await fs.readFile(p, 'utf8');
      const parsed = parseDotEnv(content);
      for (const [k, v] of Object.entries(parsed)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
      return;
    } catch {
      continue;
    }
  }
}

async function discoverTables({ url, key }) {
  const baseUrl = url.replace(/\/+$/, '');
  const openApiUrl = `${baseUrl}/rest/v1/?apikey=${encodeURIComponent(key)}`;

  const res = await fetch(openApiUrl, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      accept: 'application/openapi+json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to discover tables from PostgREST OpenAPI: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  const spec = await res.json();
  const paths = spec?.paths ?? {};

  const tables = Object.keys(paths)
    .map((p) => p.replace(/^\//, '').split('/')[0])
    .filter((t) => !!t && !t.startsWith('rpc'))
    .filter((t) => !t.includes('{'));

  return Array.from(new Set(tables)).sort();
}

async function dumpTable(client, table, args) {
  const selectClause = args.columns && args.columns.length > 0 ? args.columns.join(',') : '*';
  const rowsOut = [];

  let offset = 0;
  while (true) {
    const { data, error } = await client.from(table).select(selectClause).range(offset, offset + args.pageSize - 1);
    if (error) throw new Error(`Failed reading ${table}: ${error.message}`);

    const rows = data ?? [];
    if (rows.length === 0) break;

    rowsOut.push(...rows);

    if (args.maxRows && rowsOut.length >= args.maxRows) {
      rowsOut.length = args.maxRows;
      break;
    }

    offset += rows.length;
    if (rows.length < args.pageSize) break;
  }

  return rowsOut;
}

async function scanTable(client, table, args) {
  const selectClause = args.columns && args.columns.length > 0 ? args.columns.join(',') : '*';

  const report = {
    table,
    scannedRows: 0,
    issues: {
      nullOrEmpty: [],
      duplicates: [],
      piiLike: [],
    },
    meta: {
      pageSize: args.pageSize,
      maxRows: args.maxRows,
      columns: args.columns,
      nullColumns: args.nullColumns,
      duplicateColumn: args.duplicateColumn,
      piiColumns: args.piiColumns,
    },
  };

  const dupSeen = args.duplicateColumn ? new Map() : null;

  let offset = 0;
  while (true) {
    const from = client.from(table).select(selectClause);
    const { data, error } = await from.range(offset, offset + args.pageSize - 1);
    if (error) throw new Error(`Failed reading ${table}: ${error.message}`);

    const rows = data ?? [];
    if (rows.length === 0) break;

    for (const row of rows) {
      report.scannedRows++;

      if (args.nullColumns.length > 0) {
        const missing = args.nullColumns.filter((c) => isEmptyValue(row?.[c]));
        if (missing.length > 0) {
          report.issues.nullOrEmpty.push({ row, missingColumns: missing });
        }
      }

      if (dupSeen && args.duplicateColumn) {
        const v = row?.[args.duplicateColumn];
        if (!isEmptyValue(v)) {
          const key = String(v);
          const prev = dupSeen.get(key);
          if (prev) {
            report.issues.duplicates.push({ column: args.duplicateColumn, value: v, rows: [prev, row] });
          } else {
            dupSeen.set(key, row);
          }
        }
      }

      if (args.piiColumns.length > 0) {
        for (const c of args.piiColumns) {
          const hit = piiMatch(row?.[c]);
          if (hit) {
            report.issues.piiLike.push({ column: c, kind: hit, value: row?.[c], row });
          }
        }
      }

      if (args.maxRows && report.scannedRows >= args.maxRows) break;
    }

    if (args.maxRows && report.scannedRows >= args.maxRows) break;

    offset += rows.length;
    if (rows.length < args.pageSize) break;
  }

  return report;
}

async function main() {
  await loadEnvLocal();

  const args = parseArgs(process.argv);
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing env SUPABASE_URL');
  if (!key) throw new Error('Missing env SUPABASE_KEY');

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (args.tables.length === 0) {
    args.tables = await discoverTables({ url, key });
    if (args.tables.length === 0) throw new Error('No tables discovered. Check your key/permissions and that tables exist in the exposed schema.');
  }

  const doScan = args.nullColumns.length > 0 || !!args.duplicateColumn || args.piiColumns.length > 0;

  let report;
  if (!doScan) {
    const tables = {};
    for (const table of args.tables) {
      tables[table] = await dumpTable(client, table, args);
    }

    report = {
      generatedAt: new Date().toISOString(),
      mode: 'dump',
      tables,
    };
  } else {
    const results = [];
    for (const table of args.tables) {
      results.push(await scanTable(client, table, args));
    }

    report = {
      generatedAt: new Date().toISOString(),
      mode: 'scan',
      tables: results,
    };
  }

  const json = JSON.stringify(report, null, 2);
  process.stdout.write(`${json}\n`);

  if (args.out) {
    await fs.writeFile(args.out, json, 'utf8');
  }
}

main().catch((err) => {
  process.stderr.write(`${err?.message ?? String(err)}\n`);
  process.exit(1);
});
