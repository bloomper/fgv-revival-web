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

## Running locally

The committed `.env` holds `SUPPORT_EMAIL`, `FEEDBACK_EMAIL`, `SUPPORTED_LOCALES` and `DEFAULT_LOCALE`. Create
`.env.local` for the rest:

| Variable                 | Example                                              | What                                         |
|--------------------------|------------------------------------------------------|----------------------------------------------|
| `AUTH_SECRET`            | output of `openssl rand -base64 32`                  | Signs the session cookie                     |
| `KEYCLOAK_CLIENT_ID`     | `fgv-revival`                                        | Keycloak client                              |
| `KEYCLOAK_CLIENT_SECRET` | secret of `fgv-revival`                              | Keycloak client secret                       |
| `KEYCLOAK_ISSUER`        | `https://auth.fgv.local.nu:8443/auth/realms/fgv`     | The FGV realm                                |
| `API_GRAPHQL_ENDPOINT`   | `http://localhost:8081/api/graphql`                  | Nyuppsättning Server                         |
| `BETTER_AUTH_URL`        | `http://localhost:3001`                              | This application's own address               |
| `UMAMI_URL`              | `https://analytics.fgv.local.nu:8443`                | Optional: Umami, for visitor statistics      |
| `UMAMI_WEBSITE_ID`       | printed by `fgv-infra-deploy/local/bin/configure-umami.sh` | Optional: the Umami website            |

Then run `npm ci` and `npm run dev`. The dev server is on port 3001, next to Spexregister Web on 3000. It trusts the
local Caddy root certificate in `.docker/caddy/root.crt`; copy it from `fgv-infra-deploy/local/.docker/caddy/`.

To run the production build in a container instead, on the same port 3001, run `docker compose up -d --build`. It
reads the same `.env.local`, trusts Caddy's root certificate from a sibling `fgv-infra-deploy` checkout and calls the
server's `revival-api` container (`docker compose --profile api up -d` in `fgv-revival-server`). To use a server
started with `bootRun` instead, set `REVIVAL_API_GRAPHQL_ENDPOINT=http://host.docker.internal:8081/api/graphql`.

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
