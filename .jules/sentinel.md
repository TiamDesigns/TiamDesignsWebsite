## 2026-05-17 - Security Enhancements
**Vulnerability:** Lack of CSP and basic input limits
**Learning:** Adding defense-in-depth measures like CSP headers and maxlength attributes to form inputs improves baseline security, even if no critical vulnerabilities exist.
**Prevention:** Ensure future HTML pages and forms adhere to these baseline security principles by default.
## 2024-05-19 - Standardized Security Headers
**Vulnerability:** Missing HTTP Security Headers
**Learning:** The application was deployed across multiple platforms (Netlify, Vercel) but lacked consistent security headers, increasing vulnerability to clickjacking, MIME sniffing, and MITM attacks.
**Prevention:** Ensure that standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) are defined in all deployment configuration files (`netlify.toml`, `vercel.json`, `_headers`) by default.
