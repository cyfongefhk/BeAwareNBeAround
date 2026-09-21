.PHONY: i18n-check test lint build e2e-test-full

i18n-check:
	@set -eu; \
	backup_dir=$$(mktemp -d); \
	for catalog in src/i18n/locales/*.po; do cp "$$catalog" "$$backup_dir/$$(basename "$$catalog")"; done; \
	restore_catalogs() { for catalog in src/i18n/locales/*.po; do cp "$$backup_dir/$$(basename "$$catalog")" "$$catalog"; done; rm -rf "$$backup_dir"; }; \
	trap restore_catalogs EXIT; \
	npm run i18n:check; \
	for catalog in src/i18n/locales/*.po; do \
		if [ "$$(sha256sum "$$catalog" | cut -d ' ' -f 1)" != "$$(sha256sum "$$backup_dir/$$(basename "$$catalog")" | cut -d ' ' -f 1)" ]; then \
			printf '%s\n' "i18n catalogs are out of date. Run npm run i18n:extract, translate changed entries, then npm run i18n:compile." >&2; \
			exit 1; \
		fi; \
	done

test: i18n-check
	npm test

lint:
	npm run lint

build:
	npm run build

e2e-test-full:
	npm run e2e && npm run test:visual
