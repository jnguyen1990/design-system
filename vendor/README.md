# Vendored third-party builds

Served from the design-system host so no app loads code from a public CDN
(PLAT-11, 2026-11-24). Each directory names its version; the bytes never
change, so `_headers` serves `vendor/*` with a one-year immutable cache and
`Access-Control-Allow-Origin: *` (needed for `integrity` + `crossorigin`).

| Library | URL | SRI |
|---|---|---|
| Chart.js 4.6.1 | `https://design-system.joenguyen.ca/vendor/chart.js-4.6.1/chart.umd.min.js` | `sha384-Emf5ZVIUiarAdhkgtqK+5/Z5qIvM6QoVrS+qAVtfyZVuD5lIHrac0me485+Antp0` |
| Leaflet 1.9.4 (JS) | `https://design-system.joenguyen.ca/vendor/leaflet-1.9.4/leaflet.js` | `sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH` |
| Leaflet 1.9.4 (CSS) | `https://design-system.joenguyen.ca/vendor/leaflet-1.9.4/leaflet.css` | `sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H` |

```html
<script src="https://design-system.joenguyen.ca/vendor/chart.js-4.6.1/chart.umd.min.js"
        integrity="sha384-Emf5ZVIUiarAdhkgtqK+5/Z5qIvM6QoVrS+qAVtfyZVuD5lIHrac0me485+Antp0" crossorigin="anonymous"></script>
```

Source: the npm registry tarballs (`npm pack chart.js@4.6.1 leaflet@1.9.4`,
verified by npm against the registry's integrity), copied unmodified:
`dist/chart.umd.min.js` (the file jsDelivr served for `chart.js@4.6.1`) and
Leaflet's `dist/leaflet.js`, `dist/leaflet.css`, `dist/images/`. The bytes
match what cdn.jsdelivr.net and unpkg.com served on 2026-11-24, and Leaflet's
files match the sha256 SRI values Leaflet publishes. Licences beside each
(MIT, BSD-2-Clause). Source maps are not vendored (devtools shows a 404).

Upgrading: add a new `<name>-<version>/` directory beside the old one (never
overwrite a published version), recompute the hash with
`openssl dgst -sha384 -binary <file> | openssl base64 -A`, update this table,
then move apps over one at a time.
