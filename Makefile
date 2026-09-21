.PHONY: test lint build e2e-test-full

test:
	npm test

lint:
	npm run lint

build:
	npm run build

e2e-test-full:
	npm run e2e
