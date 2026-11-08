import {defineConfig, devices} from "@playwright/test";
import {APP_PORT, AUTH_SECRET, BASE_URL, MOCK_PORT} from "./e2e/constants";

const appEnv: Record<string, string> = {
    // Everything the app reads is set here, or a developer's .env.local (which points at the local stack) would win
    AUTH_SECRET,
    KEYCLOAK_CLIENT_ID: "fgv-revival",
    KEYCLOAK_CLIENT_SECRET: "e2e",
    KEYCLOAK_ISSUER: `http://localhost:${MOCK_PORT}/realms/fgv`,
    API_GRAPHQL_ENDPOINT: `http://localhost:${MOCK_PORT}/api/graphql`,
    BETTER_AUTH_URL: BASE_URL,
    SUPPORT_EMAIL: "support.revival@example.org",
    FEEDBACK_EMAIL: "feedback.revival@example.org",
    UMAMI_URL: "",
    UMAMI_WEBSITE_ID: "",
    SUPPORTED_LOCALES: "sv,en",
    DEFAULT_LOCALE: "sv",
    // No other application to switch to, so the header's title is just the name
    SPEXREGISTER_WEB_URL: "",
    FGV_REVIVAL_WEB_URL: "",
    SPEXIFY_WEB_URL: "",
    SPEXFLIX_WEB_URL: "",
    SPEXGRAM_WEB_URL: "",
    ARCHIVE_WEB_URL: "",
};

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI
        ? [["github"], ["html", {open: "never"}], ["junit", {outputFile: "test-results/e2e-results.xml"}]]
        : [["list"], ["html", {open: "never"}]],
    timeout: 30_000,
    use: {
        baseURL: BASE_URL,
        locale: "sv-SE",
        trace: "on-first-retry",
    },
    projects: [
        {name: "chromium", use: {...devices["Desktop Chrome"]}},
    ],
    webServer: [
        {
            command: "node e2e/mock-backend.mjs",
            port: MOCK_PORT,
            env: {MOCK_PORT: String(MOCK_PORT)},
            reuseExistingServer: !process.env.CI,
            stdout: "pipe",
        },
        {
            command: `next build && next start -p ${APP_PORT}`,
            port: APP_PORT,
            env: {...appEnv, PORT: String(APP_PORT)},
            timeout: 240_000,
            reuseExistingServer: !process.env.CI,
            stdout: "pipe",
        },
    ],
});
