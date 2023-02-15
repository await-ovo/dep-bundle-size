#!/bin/sh

cd test/fixtures/base-project && npm ci && cd ../pnpm-workspace && pnpm install --frozen-lockfile && cd ../yarn-workspace && yarn install --frozen-lockfile
