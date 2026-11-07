.PHONY: help setup dev build check test verify db-start db-stop

help:
	@echo "Voicely foundation (Bun): setup, dev, build, check, test, verify, db-start, db-stop"
	@echo "See README.md. Legacy prototypes are outside the active workspace."

setup:
	bun run setup

dev:
	bun run dev

build:
	bun run build

check:
	bun run check

test:
	bun run test
	bun run test:integration
	bun run test:e2e

verify:
	bun run verify

db-start:
	bun run db:up

db-stop:
	bun run db:stop
