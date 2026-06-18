## 2026-05-17 - Security Enhancements
**Vulnerability:** Lack of CSP and basic input limits
**Learning:** Adding defense-in-depth measures like CSP headers and maxlength attributes to form inputs improves baseline security, even if no critical vulnerabilities exist.
**Prevention:** Ensure future HTML pages and forms adhere to these baseline security principles by default.
## 2024-05-19 - Standardized Security Headers
**Vulnerability:** Missing HTTP Security Headers
**Learning:** The application was deployed across multiple platforms (Netlify, Vercel) but lacked consistent security headers, increasing vulnerability to clickjacking, MIME sniffing, and MITM attacks.
**Prevention:** Ensure that standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) are defined in all deployment configuration files (`netlify.toml`, `vercel.json`, `_headers`) by default.
## 2026-05-21 - Add Permissions-Policy header
**Vulnerability:** Weak Permissions Policy
**Learning:** Adding the Permissions-Policy header strengthens defense-in-depth by explicitly disabling browser features like camera, microphone, and geolocation, even if the application does not actively request them.
**Prevention:** Always verify standard security headers, including Permissions-Policy, are present in the server/deployment configurations.
## 2026-05-22 - Add Subresource Integrity (SRI) to CDN scripts
**Vulnerability:** Missing Subresource Integrity (SRI) for external scripts
**Learning:** Loading external scripts from CDNs without SRI attributes exposes the application to risks if the CDN is compromised, allowing malicious code execution.
**Prevention:** Always use Subresource Integrity (SRI) attributes (`integrity` and `crossorigin="anonymous"`) when including external scripts from CDNs.
## 2026-06-18 - Fix CSP for Three.js DRACOLoader
**Vulnerability:** The `connect-src` directive in the Content-Security-Policy (CSP) was set to `'self'`, which inadvertently blocked the Three.js DRACOLoader from fetching necessary decoding resources from Google's CDN (`https://www.gstatic.com/draco/v1/decoders/`). This led to broken 3D model rendering for users while simultaneously maintaining an overly restrictive policy.
**Learning:** When using external libraries that dynamically fetch resources (like DRACO decoders hosted on a CDN), the CSP must be explicitly configured to allow those specific external domains in the relevant directives (e.g., `connect-src`). The assumption that `script-src` or `default-src` covers these dynamic fetches is incorrect.
**Prevention:** Before deploying 3D assets or complex client-side libraries, review the network requests they generate to ensure the CSP explicitly allows necessary external connections (such as CDNs for workers or decoders).
