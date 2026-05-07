# Security Documentation

This document describes the security measures implemented in the ROLI Dashboard project.

## Table of Contents

1. [HTTP Security Headers](#http-security-headers)
2. [Content Security Policy](#content-security-policy)
3. [Dependency Management](#dependency-management)
4. [Code Security](#code-security)
5. [Data Protection](#data-protection)
6. [Security Audit Commands](#security-audit-commands)
7. [Known Limitations](#known-limitations)

---

## HTTP Security Headers

The following security headers are configured in `vercel.json` and applied to all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing attacks |
| `X-Frame-Options` | `DENY` | Prevents clickjacking by blocking iframe embedding |
| `X-XSS-Protection` | `1; mode=block` | Enables browser's built-in XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information sent with requests |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables access to sensitive browser APIs |

---

## Content Security Policy

A strict Content Security Policy (CSP) is implemented to prevent XSS and code injection attacks:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob:;
connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
```

### CSP Directives Explained

| Directive | Allowed Sources | Reason |
|-----------|-----------------|--------|
| `default-src` | `'self'` | Only allow resources from same origin by default |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | Required for React bundled scripts |
| `style-src` | `'self' 'unsafe-inline'` + Google Fonts | Allow inline styles and Google Fonts |
| `font-src` | `'self'` + Google Fonts + `data:` | Allow fonts from self and Google |
| `img-src` | `'self' data: blob:` | Allow images and SVG data URIs |
| `connect-src` | `'self'` + Google Fonts | Allow fetch/XHR to self and fonts |

---

## Dependency Management

### Automated Security Measures

1. **npm overrides** in `package.json` force secure versions of transitive dependencies:
   ```json
   "overrides": {
     "underscore": "^1.13.8",
     "postcss": "^8.5.10",
     "serialize-javascript": "^7.0.5",
     "nth-check": "^2.1.1"
   }
   ```

2. **Security audit scripts** available:
   ```bash
   npm run audit        # Check for high-severity vulnerabilities
   npm run audit:fix    # Automatically fix vulnerabilities
   ```

### Dependency Security Status

| Category | Status |
|----------|--------|
| Direct dependencies | Regularly updated |
| Transitive dependencies | Patched via overrides where possible |
| Development dependencies | Isolated from production |

### Regular Maintenance

Run these commands periodically:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## Code Security

### Secure Coding Practices

| Practice | Status | Description |
|----------|--------|-------------|
| No `dangerouslySetInnerHTML` | Implemented | Prevents XSS via innerHTML |
| No `eval()` or `new Function()` | Implemented | Prevents code injection |
| No hardcoded secrets | Implemented | No API keys or credentials in code |
| Input sanitization | N/A | App displays read-only data |
| HTTPS only | Implemented | All external resources use HTTPS |

### Files Excluded from Repository

The `.gitignore` file excludes sensitive files:

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
/data/
```

---

## Data Protection

### Data Handling

| Aspect | Implementation |
|--------|----------------|
| Data source | Static JSON file (no database) |
| User data collection | None |
| Authentication | Not required (public dashboard) |
| API keys | None required |
| Cookies | None set by application |
| Local storage | Used only for caching public data |

### Cache Security

- **localStorage caching** stores only public ROLI data
- Cache is version-controlled and invalidated on updates
- No sensitive information is cached

---

## Security Audit Commands

```bash
# Full security audit
npm audit

# Audit only high/critical vulnerabilities
npm run audit

# Automatically fix vulnerabilities
npm run audit:fix

# Force fix (may include breaking changes)
npm audit fix --force
```

---

## Known Limitations

### Unfixable Vulnerabilities

Some vulnerabilities cannot be fixed without breaking changes:

| Package | Issue | Risk Level | Mitigation |
|---------|-------|------------|------------|
| `xlsx` | Prototype Pollution, ReDoS | High | Development dependency only, not in production bundle |
| `react-scripts` | Transitive dependencies | Medium | Pinned to stable version, upgrade when CRA releases fix |

### Why xlsx vulnerability is acceptable:

1. `xlsx` is a **devDependency** only
2. Used exclusively in `scripts/parse-roli-data.js` for offline data parsing
3. Never included in production bundle
4. Never processes untrusted user input
5. Only runs locally by maintainers

### Future Improvements

- Consider migrating from Create React App to Vite for fewer dependencies
- Replace `xlsx` with `exceljs` if more security is needed for data parsing
- Implement Subresource Integrity (SRI) for external resources

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. Contact the maintainers directly
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure

---

## Last Security Audit

- **Date:** 2025-05-07
- **Vulnerabilities before:** 23
- **Vulnerabilities after:** 13
- **High severity reduced:** 12 → 1 (xlsx only, dev dependency)
- **Fixed via overrides:** serialize-javascript, nth-check

---

## References

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
