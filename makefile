.PHONY : build lint sync release clean

VERSION = $(shell jq .version -r manifest.json)
DESCR = $(shell jq .description -r manifest.json)

build: lint style.css
	./node_modules/.bin/tsc

lint:
	./node_modules/.bin/tslint -c tslint.json 'ts/**/*.ts' --fix

sync:
	jq --arg V "${VERSION}" --arg D "${DESCR}" '.version = $$V | .description = $$D' -r package.json > package.json.tmp
	mv package.json.tmp package.json

clean:
	-rm *.zip
	-rm *.css
	-rm -rf js

style.css: style.scss
	./node_modules/.bin/sass style.scss:style.css

release: sync release-${VERSION}.zip

release-${VERSION}.zip: clean build
	zip -r release-${VERSION}.zip manifest.json *.html *.css *.png *.js js *.md
