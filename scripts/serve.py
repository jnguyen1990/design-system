#!/usr/bin/env python3
"""Serve this repo for local dev (DS_BASE=http://localhost:<port>).

Like `python3 -m http.server`, plus Access-Control-Allow-Origin: * — the
self-hosted fonts load cross-origin from the app's port, and without that
header the browser refuses them and the system fallback fonts show.

    python3 scripts/serve.py 8765
"""
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"design-system on http://localhost:{port}/ (CORS on)")
    http.server.ThreadingHTTPServer(("", port), functools.partial(Handler, directory=ROOT)).serve_forever()
