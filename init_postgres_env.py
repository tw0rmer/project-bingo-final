#!/usr/bin/env python3
"""
Bootstrap script for switching the Bingo project from the mock DB to PostgreSQL.
• Creates/updates .env.example with safe defaults
• Creates .env interactively if it does not exist
• Optionally writes docker-compose.yml for a local Postgres service
• Runs Drizzle migration + seed commands
"""
import os
import pathlib
import subprocess
import textwrap
from typing import Optional

ROOT = pathlib.Path(__file__).resolve().parent
ENV_EXAMPLE = ROOT / '.env.example'
ENV_FILE = ROOT / '.env'
DC_FILE = ROOT / 'docker-compose.yml'

EXAMPLE_BODY = textwrap.dedent(
    """\
    # PostgreSQL connection string (edit user/password/DB as needed)
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/bingo_dev

    # If you really want the in-memory mock DB set this to 'true'
    USE_MOCK_DB=false

    # Express server port
    PORT=5000

    # JWT secret for auth tokens
    JWT_SECRET=your-secret-key
    """
)

DC_BODY = textwrap.dedent(
    """\
    version: '3.9'
    services:
      postgres:
        image: postgres:13
        restart: always
        environment:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bingo_dev
        ports:
          - "5432:5432"
        volumes:
          - pgdata:/var/lib/postgresql/data
    volumes:
      pgdata:
    """
)


def write_file(path: pathlib.Path, content: str):
    path.write_text(content, encoding='utf-8')
    print(f"✔ Wrote {path.relative_to(ROOT)}")


def ensure_env():
    if ENV_FILE.exists():
        print("ℹ .env already exists – leaving it unchanged.")
        return

    print("\nCreating .env interactively:")
    def ask(prompt: str, default: str) -> str:
        val = input(f" {prompt} [{default}]: ")
        return val.strip() or default

    user = ask('Postgres user', 'postgres')
    pwd = ask('Postgres password', 'postgres')
    dbn = ask('Database name', 'bingo_dev')
    host = ask('Host', 'localhost')
    port = ask('Port', '5432')

    body = EXAMPLE_BODY.replace(
        'postgres://postgres:postgres@localhost:5432/bingo_dev',
        f'postgres://{user}:{pwd}@{host}:{port}/{dbn}'
    )
    write_file(ENV_FILE, body)


def maybe_write_compose():
    if DC_FILE.exists():
        return
    ch = input("\nWrite docker-compose.yml for Postgres? [y/N]: ").lower()
    if ch == 'y':
        write_file(DC_FILE, DC_BODY)
        print("Run 'docker compose up -d' to start Postgres.")


def run(cmd: str):
    print(f"\n▶ {cmd}")
    subprocess.check_call(cmd, shell=True)


def main():
    write_file(ENV_EXAMPLE, EXAMPLE_BODY)
    ensure_env()
    maybe_write_compose()

    print("\nRunning migrations + seed…")
    run('npm install')
    run('npm run db:push')
    run('npm run db:seed')

    print("\n✅ Postgres environment ready. Start dev server with 'npm run dev'.")


if __name__ == '__main__':
    main()
