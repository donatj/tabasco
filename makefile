.PHONY : build lint sync release clean

VERSION = $(shell jq .version -r manifest.json)
DESCR = $(shell jq .description -r manifest.json)

build: lint style.css index.html sidebar.html
	npx tsc

lint:
	npx eslint ts/**/*.ts

sync:
	jq --arg V "${VERSION}" --arg D "${DESCR}" '.version = $$V | .description = $$D' -r package.json > package.json.tmp
	mv package.json.tmp package.json

clean:
	-rm *.zip
	-rm *.css
	-rm -rf js
	-rm index.html sidebar.html

style.css: style.scss
	./node_modules/.bin/sass style.scss:style.css

index.html sidebar.html: template.html
	PAGETYPE=popup   envsubst < template.html > index.html
	PAGETYPE=sidebar envsubst < template.html > sidebar.html

release: sync release-${VERSION}.zip

release-${VERSION}.zip: clean build
	zip -r release-${VERSION}.zip manifest.json *.html *.css *.png *.js js *.md
