# Shared appearance counts

GitHub Pages serves the UI. This small Cloudflare Worker and D1 database store the shared counts. No OpenAI key or Google sign-in is used. The site works without this service; counts stay unavailable until it is connected.

1. Sign into a Cloudflare account with `npx wrangler login` from this directory.
2. Create the database: `npx wrangler d1 create lucily-appearance-choices`.
3. Copy the returned database ID into `wrangler.jsonc`.
4. Create the table: `npx wrangler d1 execute lucily-appearance-choices --remote --file=schema.sql`.
5. Deploy: `npx wrangler deploy`.
6. Copy the resulting HTTPS Worker URL into `counterUrl` in `../../assets/preferences-config.js`, then publish the website.

A selection counts once per browser storage ID. Switching appearances moves that browser's vote. Reloading, navigating, and repeatedly selecting the same choice do not add votes. Default settings are not counted until the visitor explicitly chooses. Counts describe saved browser choices, not verified individual people; clearing storage or using another browser can create another ID. No name, email, IP address, or account identifier is stored in the database. CORS limits normal website usage to the configured origin, but is not authentication or protection against scripted vote manipulation. For stronger vote integrity, add a server-verified bot challenge or authentication before presenting totals as people.

For local development use a separate local D1 database (`--local` rather than `--remote`), and add the local website origin to `ALLOWED_ORIGINS`. Never commit account credentials or Cloudflare API tokens. The Cloudflare account holder should check the applicable service limits and billing before deployment.

The request body is bounded to 1 KiB and uses prepared SQL statements. Concurrent updates retain exactly one row per browser ID. Errors show unavailable totals rather than invented values. This service has no uploads, access requests, or moderation.

If updating an already deployed two-appearance counter, run `npx wrangler d1 execute lucily-appearance-choices --remote --file=migrate-four-appearances.sql` once before deploying the new Worker. This preserves existing selections and allows Material Chris and Material ChrisGlass. Do not run that migration on a fresh database.
