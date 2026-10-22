# Nyuppsättning Web

## Overview

Nyuppsättning Web is the frontend of Nyuppsättning, which supports the steering groups of Chalmersspex revivals. It
talks to [Nyuppsättning Server][1] over GraphQL and logs users in with the FGV realm in Keycloak. The product spec and
feature specs are in [fgv-revival-spec][2].

## Stack

Next.js 16 (App Router), React 19, TypeScript, next-intl (Swedish by default, and English), urql with GraphQL codegen,
Better Auth (stateless, Keycloak), Tailwind and shadcn on Base UI. Tests use Vitest with Testing Library, and
Playwright against a mock backend.

What a user may do with a revival comes from the server's `Revival.permissions`; the web never computes it. Global
roles (`USER`, `SUPER_ADMIN`, `OBSERVER` on `fgv-revival`) only decide which pages to show.

The guide is read one chapter at a time: `/guide` and `/revivals/[id]/guide` show the introduction and the chapters,
and `/guide/[chapterKey]` and `/revivals/[id]/guide/[chapterKey]` one chapter, with search, the changes between
versions (`/guide/changes`), suggestions and a PDF download (`/api/guide-pdf`, which adds the user's token on the
server). Super admins edit and publish it under `/admin/guide`: the draft's chapters are added, renamed, reordered and
removed at `/admin/guide/draft`, and each is edited at `/admin/guide/draft/[chapterKey]`.

Each revival has a decision log at `/revivals/[id]/log` (with the Excel import at `/log/import`, through
`apiFetch`), meetings at `/revivals/[id]/meetings`, where a meeting in progress records what was done to each row and
closed minutes can be emailed, and checklists at `/revivals/[id]/checklists`: one per chapter of the revival's guide
version, with the guide's requirements and tips, and dated event checklists. Super admins keep checklist templates
under `/admin/checklist-templates`. Nothing on these pages is ever deleted, with one exception: a revival that moves to
a guide version without a chapter loses its checklist for it, which the web asks to confirm (see `AGENTS.md`). The
Excel log import is sent through a server action, so `next.config.ts` allows server action bodies of 11 MB.

## Running locally

The committed `.env` holds `SUPPORT_EMAIL`, `FEEDBACK_EMAIL`, `SUPPORTED_LOCALES` and `DEFAULT_LOCALE`. Create
`.env.local` for the rest:

| Variable                 | Example                                              | What                                         |
|--------------------------|------------------------------------------------------|----------------------------------------------|
| `AUTH_SECRET`            | output of `openssl rand -base64 32`                  | Signs the session cookie                     |
| `KEYCLOAK_CLIENT_ID`     | `fgv-revival`                                        | Keycloak client                              |
| `KEYCLOAK_CLIENT_SECRET` | secret of `fgv-revival`                              | Keycloak client secret                       |
| `KEYCLOAK_ISSUER`        | `https://auth.fgv.local.nu:8443/auth/realms/fgv`     | The FGV realm                                |
| `API_GRAPHQL_ENDPOINT`   | `https://api.revival.fgv.local.nu:8443/api/graphql`  | Nyuppsättning Server                         |
| `BETTER_AUTH_URL`        | `http://localhost:3001`                              | This application's own address               |
| `UMAMI_URL`              | `https://analytics.fgv.local.nu:8443`                | Optional: Umami, for visitor statistics      |
| `UMAMI_WEBSITE_ID`       | printed by `fgv-infra-deploy/local/bin/configure-umami.sh` | Optional: the Umami website            |

Then run `npm ci` and `npm run dev`. The dev server is on port 3001, next to Spexregister Web on 3000. `npm run dev`
and `docker compose` trust the root certificate of fgv-infra-deploy's local Caddy
(`local/.docker/caddy/data/caddy/pki/authorities/local/root.crt`), read from `../fgv-infra-deploy`, or from
`INFRA_DEPLOY` if it is checked out elsewhere.

## Docker

`docker compose up --build` runs the production build behind its own Caddy, on `https://revival.fgv.local.nu:9443`
if your hosts file is configured. Port 9443 keeps it clear of Spexregister Web's Caddy on 443. It reads the same
`.env.local` and talks to the server's API at `api.revival.fgv.local.nu:8443` and to Keycloak at
`auth.fgv.local.nu:8443`, both behind fgv-infra-deploy's local Caddy, which forwards to the `revival-api` container
or to a server started with `bootRun`. To log in, `FGV_REVIVAL_URL` in fgv-infra-deploy's `local/.env` must be
`https://revival.fgv.local.nu:9443`, since the realm only accepts redirects to that address.

Visitor statistics go to Umami only when both Umami variables are set. The tracker is served as `/stats/script.js`
and events go through `/stats/api/send`, without query strings and never with personal data (`src/utils/umami.ts`).
The cookie banner (c15t) only informs: the application uses strictly necessary cookies, and Umami sets none.

## Scripts

```
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test          # Vitest
npm run test:coverage # Vitest with coverage thresholds
npm run test:e2e      # Playwright, with the mock backend in e2e/mock-backend.mjs
npm run build         # production build
npm run gql-codegen   # regenerate src/gql/ from a sibling fgv-revival-server checkout
```

The generated `src/gql/` is committed, so CI needs no sibling checkout. Regenerate and commit it whenever the
server's schema changes.

## Published images

CI publishes `bloomper/fgv-revival-web` for `linux/amd64`. One image serves every environment:
there are no `NEXT_PUBLIC_*` variables.

## License

Nyuppsättning Web is Open Source software released under the [Apache 2.0 license][3].

[1]: https://github.com/bloomper/fgv-revival-server
[2]: https://github.com/bloomper/fgv-revival-spec
[3]: https://www.apache.org/licenses/LICENSE-2.0.html
