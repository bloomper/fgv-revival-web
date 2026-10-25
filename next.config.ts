import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {key: "Content-Security-Policy", value: contentSecurityPolicy},
                    {key: "X-Content-Type-Options", value: "nosniff"},
                    {key: "X-Frame-Options", value: "DENY"},
                    {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
                    {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()"},
                ],
            },
            {
                source: "/api/receipts/:transactionId",
                headers: [{key: "Content-Security-Policy", value: "default-src 'none'; sandbox"}],
            },
            {
                source: "/api/revival-poster/:id",
                headers: [{
                    key: "Content-Security-Policy",
                    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox"
                }],
            },
            {
                source: "/api/swish-qr/:revivalId",
                headers: [{
                    key: "Content-Security-Policy",
                    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox"
                }],
            },
        ];
    },
    turbopack: {
        root: __dirname,
    },
    output: "standalone",
    reactCompiler: true,
    cacheComponents: true,
    partialPrefetching: true,
    experimental: {
        authInterrupts: true,
        instantInsights: {
            validationLevel: "manual-warning",
        },
        proxyClientMaxBodySize: "11mb",
    },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
