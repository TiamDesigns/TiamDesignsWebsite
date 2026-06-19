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
## 2026-05-24 - Allow Google CDN for DRACOLoader decoders
**Vulnerability:** Broken CSP for DRACOLoader decoders
**Learning:** Three.js DRACOLoader dynamically fetches WASM decoders from Google's CDN (`https://www.gstatic.com/draco/v1/decoders/`). If `https://www.gstatic.com` is omitted from the `connect-src` directive in the Content-Security-Policy, the decoders will be blocked by the browser, resulting in a failure to load compressed 3D models.
**Prevention:** Whenever a library (like Three.js DRACOLoader) dynamically fetches resources from external CDNs, explicitly allow the CDN's origin in the `connect-src` directive of the CSP.
