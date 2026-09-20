#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import db, { APP_ROOT } from './db.js';

const execFileAsync = promisify(execFile);

const server = new McpServer({
  name: 'earth-innovators-mcp',
  version: '1.0.0',
});

server.registerTool(
  'db_list_tables',
  {
    title: 'List database tables',
    description: 'List all tables in the Earth Innovators application database.',
    inputSchema: {},
  },
  async () => {
    const tables = await db.listTables();
    return { content: [{ type: 'text', text: JSON.stringify(tables, null, 2) }] };
  }
);

server.registerTool(
  'db_describe_table',
  {
    title: 'Describe a table',
    description: 'Show column definitions for a given table.',
    inputSchema: { table: z.string() },
  },
  async ({ table }) => {
    const columns = await db.describeTable(table);
    return { content: [{ type: 'text', text: JSON.stringify(columns, null, 2) }] };
  }
);

server.registerTool(
  'db_query',
  {
    title: 'Run a read-only SQL query',
    description: 'Run a SELECT query against the application database and return rows.',
    inputSchema: { sql: z.string(), params: z.array(z.union([z.string(), z.number(), z.null()])).optional() },
  },
  async ({ sql, params }) => {
    if (!/^\s*select/i.test(sql)) {
      throw new Error('db_query only accepts SELECT statements. Use db_execute for writes.');
    }
    const rows = await db.query(sql, params || []);
    return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
  }
);

server.registerTool(
  'db_execute',
  {
    title: 'Execute a write SQL statement',
    description:
      'Full-access tool: run INSERT/UPDATE/DELETE/DDL statements against the application database. Use with care — this mutates real data.',
    inputSchema: { sql: z.string(), params: z.array(z.union([z.string(), z.number(), z.null()])).optional() },
  },
  async ({ sql, params }) => {
    const result = await db.query(sql, params || []);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  'artisan',
  {
    title: 'Run an artisan command',
    description:
      'Full-access tool: run a `php artisan` command against the Earth Innovators app (e.g. "migrate", "db:seed --class=CoreCatalogSeeder", "tinker --execute=...").',
    inputSchema: { args: z.array(z.string()) },
  },
  async ({ args }) => {
    const { stdout, stderr } = await execFileAsync('php', ['artisan', ...args], {
      cwd: APP_ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { content: [{ type: 'text', text: stdout + (stderr ? `\n[stderr]\n${stderr}` : '') }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
