#!/usr/bin/env bash
# Creates a fresh Angular app of the given major version, installs the packed library (dist/mat-dynamic-form)
# like a user would, builds it and runs the in-browser smoke scenario with the native and the moment adapter.
#
#   tests/consumers/run.sh 13            # one version
#   tests/consumers/run.sh 11 12 13 14 15
#
# Requires: the library built (npm run build && npm run copy-assets), Node 14, Chrome (CHROME_BIN), python3.
# Results: $WORK/ng<version>/result-<adapter>.json and screenshot-<adapter>.png. Exit code != 0 if any check fails.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="${WORK:-${TMPDIR:-/tmp}/mdf-consumers}"
CHROME="${CHROME_BIN:-$(command -v google-chrome-stable || command -v google-chrome || command -v chromium)}"
export NG_CLI_ANALYTICS=false

mkdir -p "$WORK"
rm -f "$WORK"/mat-dynamic-form-*.tgz
(cd "$ROOT/dist/mat-dynamic-form" && npm pack --silent >/dev/null && mv mat-dynamic-form-*.tgz "$WORK/")
TARBALL="$(ls "$WORK"/mat-dynamic-form-*.tgz)"
echo "Library: $TARBALL"

failed=0
for VERSION in "$@"; do
  APP="$WORK/ng$VERSION"
  echo "=== Angular $VERSION ==="
  rm -rf "$APP"
  (cd "$WORK" && npm_config_yes=true npx -p "@angular/cli@$VERSION" ng new "ng$VERSION" --defaults --skip-git --skip-tests --skip-install --style=scss --routing=false >/dev/null)

  cd "$APP"
  npm install --no-audit --no-fund --loglevel=error >/dev/null
  npm install --no-audit --no-fund --loglevel=error \
    "@angular/material@$VERSION" "@angular/cdk@$VERSION" "@angular/material-moment-adapter@$VERSION" moment "$TARBALL" >/dev/null

  # A fresh Angular 14 app (no lockfile) resolves @types/node 26, which needs TypeScript 5 and breaks even an app
  # without this library. Real Angular 14 apps have a lockfile with an older version.
  if [ "$VERSION" -eq 14 ]; then
    npm install --no-audit --no-fund --loglevel=error --save-dev "@types/node@16" >/dev/null
  fi

  cp "$ROOT/tests/consumers/app/src/app/"*.ts src/app/
  rm -f src/app/app.component.html src/app/app.component.scss src/app/app.component.css
  if [ "$VERSION" -le 13 ]; then cp "$ROOT/tests/consumers/app/src/styles-11.scss" src/styles.scss
  else cp "$ROOT/tests/consumers/app/src/styles-14.scss" src/styles.scss; fi

  # Material Icons font, as `ng add @angular/material` adds it to real apps.
  sed -i 's|</head>|<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></head>|' src/index.html

  # Library assets (file type icons), no size budgets.
  node -e '
    const fs = require("fs"); const cfg = JSON.parse(fs.readFileSync("angular.json", "utf8"));
    const project = Object.values(cfg.projects)[0]; const build = project.architect.build;
    build.options.assets.push({ glob: "**/*", input: "node_modules/mat-dynamic-form/assets", output: "assets" });
    for (const c of Object.values(build.configurations || {})) delete c.budgets;
    fs.writeFileSync("angular.json", JSON.stringify(cfg, null, 2));'

  npx ng build > build.log 2>&1 || { echo "BUILD FAILED (see $APP/build.log)"; tail -30 build.log; failed=1; continue; }
  DIST="$(dirname "$(find dist -name index.html | head -1)")"

  PORT=$((4300 + VERSION))
  (cd "$DIST" && python3 -m http.server "$PORT" >/dev/null 2>&1) &
  SERVER=$!
  for _ in $(seq 1 50); do curl -s -o /dev/null "http://localhost:$PORT/" && break; sleep 0.2; done

  for ADAPTER in native moment; do
    URL="http://localhost:$PORT/?adapter=$ADAPTER"
    "$CHROME" --headless=new --no-sandbox --disable-gpu --window-size=1200,2600 --virtual-time-budget=20000 \
      --dump-dom "$URL" 2>"chrome-$ADAPTER.log" > "dom-$ADAPTER.html" || true
    "$CHROME" --headless=new --no-sandbox --disable-gpu --window-size=1200,2600 --virtual-time-budget=20000 \
      --screenshot="$APP/screenshot-$ADAPTER.png" "$URL" >/dev/null 2>&1 || true
    python3 - "$APP/dom-$ADAPTER.html" "$APP/result-$ADAPTER.json" <<'PY' || failed=1
import html, json, re, sys
dom = open(sys.argv[1]).read()
match = re.search(r'<pre id="smoke-result">(.*?)</pre>', dom, re.S)
text = html.unescape(match.group(1)) if match else '{"ok": false, "errors": ["no smoke result in the page"]}'
try:
    result = json.loads(text)
except ValueError:
    result = {"ok": False, "errors": ["unexpected smoke output: " + text[:200]]}
open(sys.argv[2], "w").write(json.dumps(result, indent=2))
failed = [k for k, v in result.get("results", {}).items() if v is not True and not k.startswith("info")]
info = {k: v for k, v in result.get("results", {}).items() if k.startswith("info")}
if failed: print("  info:", info)
print(("PASS" if result.get("ok") else "FAIL") + f"  adapter={result.get('adapter')}  failed={failed}  errors={result.get('errors')}")
sys.exit(0 if result.get("ok") else 1)
PY
  done
  kill $SERVER 2>/dev/null || true
  cd "$ROOT"
done

exit $failed
