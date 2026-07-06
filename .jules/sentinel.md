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
## 2026-05-24 - Restoring Core Functionality by Relaxing Overly Strict CSP
**Vulnerability:** Overly strict CSP (specifically `connect-src 'self'`) blocked Three.js DRACOLoader from fetching decoders from Google's CDN (`https://www.gstatic.com/draco/v1/decoders/`), breaking the 3D model loading functionality.
**Learning:** While strict CSPs are important, they must accommodate external services required for core functionality. Relaxing a policy to restore core features (like adding required CDN domains to `connect-src`) qualifies as a valid configuration fix, because completely broken sites often lead to full CSP removal by frustrated developers.
**Prevention:** Thoroughly test the application (especially third-party integrations and loaders) after applying or tightening a Content-Security-Policy to ensure all required external domains are explicitly allowed.
