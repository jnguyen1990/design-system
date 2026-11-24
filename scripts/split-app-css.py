#!/usr/bin/env python3
"""One-off splitter for PLAT-27 (round three, 2026-11-24): moves the rules in
design-system.css's per-app sections ("Mealplanner components", "Fitness
components", "Base components", "Budgeter components") into apps/<app>.css —
but only the rule blocks none of whose classes appear anywhere else: the other
five app repos (postings included, which keeps loading the shared file alone),
the gem's views/helpers, the shared scripts, and the other apps' kits. A block
that is used elsewhere stays in design-system.css, where it was.

    python3 scripts/split-app-css.py --dry-run     # report only
    python3 scripts/split-app-css.py               # rewrite the files

Kept in the repo for the record and to re-run the usage check; not part of any
build.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPOS = os.path.dirname(ROOT)
APPS = ["base", "budgeter", "fitness", "mealplanner", "upkeep", "postings"]
SECTIONS = {  # header line text → app
    "Mealplanner components": "mealplanner",
    "Fitness components": "fitness",
    "Base components": "base",
    "Budgeter components": "budgeter",
}
SHARED_JS = ["shared-core.js", "session-render.js", "goal-render.js", "apps-launcher.js", "modal-keys.js"]
EXTS = (".erb", ".rb", ".js", ".html", ".mjs")


def corpus_for(app):
    """Text of everything that is NOT this app: the other apps, the gem, shared JS, other kits."""
    chunks = []
    for other in APPS:
        if other == app:
            continue
        for sub in ("app", "lib", "config"):
            base = os.path.join(REPOS, other, sub)
            for dp, _, fs in os.walk(base):
                for f in fs:
                    if f.endswith(EXTS):
                        chunks.append(open(os.path.join(dp, f), errors="replace").read())
    for dp, _, fs in os.walk(os.path.join(REPOS, "personal-app-client", "app")):
        for f in fs:
            if f.endswith(EXTS):
                chunks.append(open(os.path.join(dp, f), errors="replace").read())
    for f in SHARED_JS:
        chunks.append(open(os.path.join(ROOT, f), errors="replace").read())
    kits = os.path.join(ROOT, "claude-design-export", "ui_kits")
    for k in os.listdir(kits):
        if k == app:
            continue
        for dp, _, fs in os.walk(os.path.join(kits, k)):
            for f in fs:
                if f.endswith(".html"):
                    chunks.append(open(os.path.join(dp, f), errors="replace").read())
    return "\n".join(chunks)


def blocks(text):
    """Split CSS text into top-level chunks: comments, whitespace and rule/@ blocks (brace-matched)."""
    out, i, n = [], 0, len(text)
    while i < n:
        if text.startswith("/*", i):
            j = text.index("*/", i) + 2
            out.append(("comment", text[i:j])); i = j; continue
        if text[i].isspace():
            j = i
            while j < n and text[j].isspace():
                j += 1
            out.append(("ws", text[i:j])); i = j; continue
        j = text.index("{", i); depth = 0; k = j
        while k < n:
            if text.startswith("/*", k):
                k = text.index("*/", k) + 2; continue
            if text[k] == "{": depth += 1
            elif text[k] == "}":
                depth -= 1
                if depth == 0: break
            k += 1
        out.append(("rule", text[i:k + 1])); i = k + 1
    return out


def section_bounds(css):
    """(start, end, app) character ranges of the per-app sections: from the
    ==== banner opening the named header to the next ==== banner."""
    banners = [m.start() for m in re.finditer(r"/\* =+\n", css)]
    found = []
    for idx, b in enumerate(banners):
        head = css[b:b + 200]
        for title, app in SECTIONS.items():
            if re.search(r"\n   " + re.escape(title) + r"\b", head):
                end = banners[idx + 1] if idx + 1 < len(banners) else len(css)
                found.append((b, end, app))
    return sorted(found)


def classes_in(selector_text):
    sel = re.sub(r"\{[^{}]*\}", "", selector_text)  # drop declarations (no nested braces left at this point)
    return set(re.findall(r"\.(-?[_a-zA-Z][\w-]*)", sel))


def selectors_of(chunk):
    """Every selector in a rule, or in each rule inside an @media/@supports block."""
    if chunk.startswith("@"):
        inner = chunk[chunk.index("{") + 1:chunk.rindex("}")]
        out = []
        for kind, c in blocks(inner):
            if kind == "rule":
                out += selectors_of(c)
        return out
    return [x.strip() for x in chunk.split("{")[0].split(",") if x.strip()]


def foreign_selectors(chunk, app, corpus, _memo={}):
    """Selectors that are not this app's alone. A selector is the app's when it is
    scoped [data-app="<app>"], or when at least one of its classes appears in no
    other app, the gem, the shared scripts or another kit (it cannot match there)."""
    bad = []
    for sel in selectors_of(chunk):
        if '[data-app="%s"]' % app in sel:
            continue
        if re.search(r'\[data-app="(?!%s")' % app, sel):
            bad.append(sel); continue
        cls = classes_in(sel)
        if not cls:
            bad.append(sel); continue
        if any(not _memo.setdefault((app, c), used_elsewhere(c, corpus)) for c in cls):
            continue
        bad.append(sel)
    return bad


def used_elsewhere(cls, corpus):
    return re.search(r"(?<![\w-])" + re.escape(cls) + r"(?![\w-])", corpus) is not None


def main():
    dry = "--dry-run" in sys.argv
    path = os.path.join(ROOT, "design-system.css")
    css = open(path).read()
    moved = {}
    kept_report = {}
    new_css, last = [], 0
    for start, end, app in section_bounds(css):
        corpus = corpus_for(app)
        section = css[start:end]
        banner_end = section.index("*/") + 2  # keep the banner comment in place
        keep, move = [section[:banner_end]], []
        for kind, chunk in blocks(section[banner_end:]):
            if kind != "rule":
                keep.append(chunk); move.append(chunk + "\n") if kind == "comment" else None; continue
            if chunk.startswith("@"):
                # Split an @media/@supports block rule by rule, so an app-only rule
                # inside it moves with the base rule it overrides (keeping their order).
                head = chunk[:chunk.index("{") + 1]
                inner = chunk[chunk.index("{") + 1:chunk.rindex("}")]
                mine, theirs = [], []
                for k2, c2 in blocks(inner):
                    if k2 != "rule":
                        continue
                    (theirs if foreign_selectors(c2, app, corpus) else mine).append(c2)
                if theirs:
                    keep.append(head + "\n    " + "\n    ".join(theirs) + "\n}")
                    kept_report.setdefault(app, []).append((head[:-1].strip() + " (split)", [t.split("{")[0].strip()[:30] for t in theirs][:4]))
                if mine:
                    move.append(head + "\n    " + "\n    ".join(mine) + "\n}"); move.append("\n")
                continue
            hits = foreign_selectors(chunk, app, corpus)
            if hits:
                keep.append(chunk); kept_report.setdefault(app, []).append((chunk.split("{")[0].strip()[:70], hits[:4]))
            else:
                move.append(chunk); move.append("\n")
        moved.setdefault(app, []).append("".join(move))
        new_css.append(css[last:start]); new_css.append("".join(keep)); last = end
    new_css.append(css[last:])
    shared = "".join(new_css)
    shared = re.sub(r"\n{3,}", "\n\n", shared)
    for app in APPS:
        body = "".join(moved.get(app, []))
        print("%-12s moved %6d bytes; kept %d block(s) shared" % (app, len(body), len(kept_report.get(app, []))))
        for sel, hits in kept_report.get(app, [])[:60]:
            print("    keep  %-70s used elsewhere: %s" % (sel, ", ".join(hits)))
    print("design-system.css %d → %d bytes" % (len(css), len(shared)))
    if dry:
        return
    open(path, "w").write(shared)
    os.makedirs(os.path.join(ROOT, "apps"), exist_ok=True)
    for app in APPS:
        body = "".join(moved.get(app, []))
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        head = ("/* %s — styles only %s uses (design system, round three PLAT-27).\n"
                "   Loaded by the gem's shell right after design-system.css, from the same\n"
                "   pinned release. Tokens and every component two or more apps use live in\n"
                "   design-system.css; a rule moves here only when no other app, the gem's\n"
                "   views or the shared scripts reference its classes. */\n\n" % (app, app))
        open(os.path.join(ROOT, "apps", app + ".css"), "w").write(head + (body + "\n" if body else ""))


if __name__ == "__main__":
    main()
