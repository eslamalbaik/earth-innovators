# Earth Innovators MCP Server

MCP (Model Context Protocol) server exposing **full access** to the Earth
Innovators Laravel application to any MCP-compatible AI client (Claude
Desktop, Claude Code, etc.).

## Tools

- `db_list_tables` — list all tables in the app database.
- `db_describe_table` — show columns for a table.
- `db_query` — run a read-only `SELECT` query.
- `db_execute` — **full access**: run `INSERT`/`UPDATE`/`DELETE`/DDL statements.
- `artisan` — **full access**: run any `php artisan` command (migrations, seeders, tinker, queue jobs, etc.).

It reads DB credentials from the Laravel app's `.env` (`DB_CONNECTION`,
`DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) and supports both
`sqlite` and `mysql`.

## Setup

```bash
cd mcp-server
npm install
```

## Run standalone (stdio)

```bash
npm start
```

## Register with Claude Code / Claude Desktop

Add to your MCP client config:

```json
{
  "mcpServers": {
    "earth-innovators": {
      "command": "node",
      "args": ["/absolute/path/to/earth-innovators/mcp-server/src/index.js"]
    }
  }
}
```

## ⚠️ Security warning

This server has **unrestricted read/write access to the application
database and can execute arbitrary `php artisan` commands** on the host it
runs on. Only run it locally / in trusted environments, never expose the
process to an untrusted network, and never point it at a production
database unless you fully trust whatever MCP client is connected to it.
