.PHONY: i18n-check test lint build e2e-test-full

i18n-check:
	@set -eu; \
	if command -v cmp >/dev/null 2>&1; then \
		compare_catalogs() { cmp -s "$$1" "$$2"; }; \
	elif command -v sha256sum >/dev/null 2>&1; then \
		compare_catalogs() { [ "$$(sha256sum "$$1" | cut -d ' ' -f 1)" = "$$(sha256sum "$$2" | cut -d ' ' -f 1)" ]; }; \
	elif command -v shasum >/dev/null 2>&1; then \
		compare_catalogs() { [ "$$(shasum -a 256 "$$1" | cut -d ' ' -f 1)" = "$$(shasum -a 256 "$$2" | cut -d ' ' -f 1)" ]; }; \
	else \
		printf '%s\n' "i18n-check requires cmp, sha256sum, or shasum for catalog drift detection." >&2; \
		exit 1; \
	fi; \
	backup_dir=$$(mktemp -d); \
	for catalog in src/i18n/locales/*.po; do cp "$$catalog" "$$backup_dir/$$(basename "$$catalog")"; done; \
	restore_catalogs() { for catalog in src/i18n/locales/*.po; do cp "$$backup_dir/$$(basename "$$catalog")" "$$catalog"; done; rm -rf "$$backup_dir"; }; \
	trap restore_catalogs EXIT; \
	npm run i18n:check; \
	for catalog in src/i18n/locales/*.po; do \
		if ! compare_catalogs "$$catalog" "$$backup_dir/$$(basename "$$catalog")"; then \
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
