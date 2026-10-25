# Nyuppsättning Web

## Overview

Nyuppsättning Web is the frontend of Nyuppsättning, which supports the steering groups of Chalmersspex revivals. It
talks to [Nyuppsättning Server][1] over GraphQL. The product spec, feature specs and plans are in
[fgv-revival-spec][2].

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling:** [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) &
  [Tailwind CSS 4](https://tailwindcss.com/)
- **Data Fetching:** [urql](https://formidable.com/open-source/urql/) (GraphQL) with GraphQL Code Generator
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Authentication:** [Better Auth](https://better-auth.com/) (Keycloak integration, stateless sessions)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Supports Swedish & English)

## Getting Started

### Prerequisites

- Node.js 26 (see `.nvmrc`)
- npm (package manager)
- Docker & Docker Compose (optional, for containerized setup)

### Development

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Configure environment:**
   Start fgv-infra-deploy's local stack and [Nyuppsättning Server][1]'s, then create `.env.local` (`.env` already
   holds the rest):
   ```
   BETTER_AUTH_URL=http://localhost:3001
   AUTH_SECRET=<random string of at least 32 characters>
   KEYCLOAK_CLIENT_ID=fgv-revival
   KEYCLOAK_CLIENT_SECRET=<secret of the fgv-revival client>
   KEYCLOAK_ISSUER=https://auth.fgv.local.nu:8443/auth/realms/fgv
   API_GRAPHQL_ENDPOINT=https://api.revival.fgv.local.nu:8443/api/graphql
   ```
   For visitor statistics, run fgv-infra-deploy's `local/bin/configure-umami.sh` and put the ID it prints in
   `.env.local` as `UMAMI_WEBSITE_ID`, with `UMAMI_URL=https://analytics.fgv.local.nu:8443`.
   `npm run dev` and `docker compose` trust the root certificate of fgv-infra-deploy's local Caddy
   (`local/.docker/caddy/data/caddy/pki/authorities/local/root.crt`), read from `../fgv-infra-deploy`, or from
   `INFRA_DEPLOY` if it is checked out elsewhere.

3. **Generate GraphQL types:**
   If you change GraphQL queries or the schema, regenerate types from a sibling `fgv-revival-server` checkout:
   ```bash
   npm run gql-codegen
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) with your browser to see the result. Port 3001 keeps it
   clear of Spexregister Web on 3000.

## Docker

The project includes a `Dockerfile` and `docker-compose.yaml` for containerized deployment, including a Caddy reverse
proxy setup for local development with HTTPS.

### Running with Docker Compose

To start the application along with the Caddy reverse proxy:

```bash
docker compose up --build
```

The application will be accessible at `https://revival.fgv.local.nu:9443` if your hosts file is configured. Port
9443 keeps it clear of Spexregister Web's Caddy on 443. It talks to the server's API at
`api.revival.fgv.local.nu:8443` and to Keycloak at `auth.fgv.local.nu:8443`, both behind fgv-infra-deploy's local
Caddy. To log in, `FGV_REVIVAL_URL` in fgv-infra-deploy's `local/.env` must be `https://revival.fgv.local.nu:9443`,
since the realm only accepts redirects to that address.

### Published images

CI publishes `bloomper/fgv-revival-web` for `linux/amd64`:

| Trigger              | Tags                              |
|----------------------|-----------------------------------|
| push to `develop`    | `develop`, `sha-<commit>`         |
| push of tag `vX.Y.Z` | `X.Y.Z`, `latest`, `sha-<commit>` |

To release, set `version` in `package.json` to `X.Y.Z`, merge to `main`, then
`git tag vX.Y.Z && git push origin vX.Y.Z`. The publish fails if the tag doesn't match the version or if `X.Y.Z` is
already on Docker Hub.

The image contains no environment-specific values. All configuration is read at runtime: `BETTER_AUTH_URL`,
`AUTH_SECRET`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ISSUER`, `API_GRAPHQL_ENDPOINT`,
`SUPPORT_EMAIL`, `FEEDBACK_EMAIL`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `UMAMI_URL` and `UMAMI_WEBSITE_ID`. Visitor
statistics go to Umami only when both Umami variables are set.

## Building and Deployment

### Tests

`npm run test` runs the unit tests and `npm run test:e2e` the Playwright tests. See the [contributor guidelines][5]
for the checks CI runs.

### Production Build

To create an optimized production build manually:

```bash
npm run build
npm run start
```

## Contributing

Contributors to this project agree to uphold its [code of conduct][3].

You can contribute to Nyuppsättning Web by:

- Opening a [pull request][4]. Please see the [contributor guidelines][5] for details

## License

Nyuppsättning Web is open source software released under the [Apache 2.0 license][6].

[1]: https://github.com/bloomper/fgv-revival-server

[2]: https://github.com/bloomper/fgv-revival-spec

[3]: CODE_OF_CONDUCT.md

[4]: https://help.github.com/articles/using-pull-requests/

[5]: CONTRIBUTING.md

[6]: https://www.apache.org/licenses/LICENSE-2.0.html
