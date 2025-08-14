#!/usr/bin/env python3
"""
Cross‑platform console server manager for Bingo app.

Features
- Detects OS (Windows/Linux/macOS) and adapts commands accordingly
- Pre‑flight checks (python/node/npm/sqlite DB path)
- Start/stop/status for the Node server (`npm run dev`)
- Persist server PID in .server_pid for reliable stop/status
- Simple log viewer (tails most recent debugging/server-*.log if present)

Usage examples
  python scripts/server_manager_cli.py start
  python scripts/server_manager_cli.py stop
  python scripts/server_manager_cli.py status
  python scripts/server_manager_cli.py logs --lines 150
  python scripts/server_manager_cli.py env
  python scripts/server_manager_cli.py cleanup

Notes
- No GUI; safe to run on EC2 Linux or local Windows.
- Avoids shell quoting issues by invoking npm directly via full path.
"""

from __future__ import annotations
import argparse
import os
import platform
import shutil
import signal
import subprocess
import sys
from pathlib import Path
from time import sleep

REPO_ROOT = Path(__file__).resolve().parents[1]
PID_FILE = REPO_ROOT / ".server_pid"
DEBUG_DIR = REPO_ROOT / "debugging"
DATA_DIR = REPO_ROOT / "data"
DB_FILE = DATA_DIR / "bingo.db"


def is_windows() -> bool:
    return platform.system().lower().startswith("win")


def which_npm() -> str:
    # Prefer portable discovery; fall back to common install path on Windows
    npm = shutil.which("npm.cmd" if is_windows() else "npm")
    if npm:
        return npm
    if is_windows():
        candidate = Path("C:/Program Files/nodejs/npm.cmd")
        if candidate.exists():
            return str(candidate)
    raise RuntimeError("npm executable not found. Ensure Node.js is installed and in PATH.")


def preflight() -> None:
    print("🔍 Pre-flight checks...")
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version.split()[0]}")
    # Node/npm
    npm = which_npm()
    try:
        subprocess.run([npm, "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print("❌ npm not available:", e)
        raise
    else:
        print("✅ npm available:", subprocess.run([npm, "--version"], stdout=subprocess.PIPE).stdout.decode().strip())
    # Ensure dirs
    DEBUG_DIR.mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)
    print("📂 Debugging dir:", DEBUG_DIR)
    print("📂 Data dir:", DATA_DIR)
    if DB_FILE.exists():
        print("✅ SQLite DB detected:", DB_FILE)
    else:
        print("ℹ️  SQLite DB will be created on first run:", DB_FILE)


def read_pid() -> int | None:
    if PID_FILE.exists():
        try:
            return int(PID_FILE.read_text().strip())
        except Exception:
            return None
    return None


def write_pid(pid: int) -> None:
    PID_FILE.write_text(str(pid))


def remove_pid() -> None:
    if PID_FILE.exists():
        PID_FILE.unlink(missing_ok=True)


def process_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except Exception:
        return False


def start_server(env: str = "development") -> None:
    preflight()
    if (pid := read_pid()) and process_alive(pid):
        print(f"⚠️  Server already running with PID {pid}")
        return

    npm = which_npm()
    use_script = "start" if env.lower() == "production" else "dev"
    print(f"🚀 Starting server (npm run {use_script})...")
    # Use env vars cross‑platform
    env_map = os.environ.copy()
    env_map["NODE_ENV"] = env
    # Spawn from repo root to ensure package.json is visible
    proc = subprocess.Popen([npm, "run", use_script], cwd=str(REPO_ROOT), env=env_map)
    write_pid(proc.pid)
    print(f"✅ Server process started (PID {proc.pid}). Waiting for initialization...")
    sleep(1.0)


def stop_server() -> None:
    pid = read_pid()
    if not pid:
        print("ℹ️  No PID file. Server may not be running.")
        return
    if not process_alive(pid):
        print("ℹ️  PID not alive. Cleaning up PID file.")
        remove_pid()
        return
    print(f"🛑 Stopping server PID {pid}...")
    try:
        if is_windows():
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], check=False)
        else:
            os.kill(pid, signal.SIGTERM)
    finally:
        remove_pid()
    print("✅ Server stopped.")


def status() -> None:
    pid = read_pid()
    if pid and process_alive(pid):
        print(f"🟢 Server running (PID {pid})")
    else:
        print("🔴 Server not running")


def tail_logs(lines: int = 200) -> None:
    if not DEBUG_DIR.exists():
        print("No debugging directory found.")
        return
    server_logs = sorted(DEBUG_DIR.glob("server-*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not server_logs:
        print("No server logs found in", DEBUG_DIR)
        return
    target = server_logs[0]
    print(f"📄 Tailing {target} (last {lines} lines)\n")
    with target.open("r", encoding="utf-8", errors="ignore") as f:
        content = f.read().splitlines()
        for line in content[-lines:]:
            print(line)


def cleanup() -> None:
    # Lightweight: remove PID file; optional: clear logs/db on request
    remove_pid()
    print("🧹 Cleanup done (PID file removed).")


def env_info() -> None:
    print("Environment Info:")
    print("  OS:", platform.platform())
    print("  Python:", sys.version.replace("\n", " "))
    print("  Repo Root:", REPO_ROOT)
    print("  npm:", which_npm())
    print("  DB:", DB_FILE)


def main() -> None:
    parser = argparse.ArgumentParser(description="Bingo server manager (console)")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("start").add_argument("--env", default="development")
    sub.add_parser("stop")
    sub.add_parser("status")
    logs_p = sub.add_parser("logs")
    logs_p.add_argument("--lines", type=int, default=200)
    sub.add_parser("env")
    sub.add_parser("cleanup")

    args = parser.parse_args()
    cmd = args.cmd or "status"
    try:
        if cmd == "start":
            start_server(env=getattr(args, "env", "development"))
        elif cmd == "stop":
            stop_server()
        elif cmd == "status":
            status()
        elif cmd == "logs":
            tail_logs(lines=getattr(args, "lines", 200))
        elif cmd == "env":
            env_info()
        elif cmd == "cleanup":
            cleanup()
        else:
            parser.print_help()
    except Exception as e:
        print("❌", e)
        sys.exit(1)


if __name__ == "__main__":
    main()


