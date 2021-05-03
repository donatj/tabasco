.PHONY : build lint release clean

VERSION = $(shell jq .version -r manifest.json)

build: lint style.css
	./node_modules/.bin/tsc

lint:
	./node_modules/.bin/tslint -c tslint.json 'ts/**/*.ts' --fix

clean:
	-rm *.zip
	-rm *.css
	-rm -rf js

style.css: style.scss
	sass style.scss:style.css

release: release-${VERSION}.zip

release-${VERSION}.zip: clean build
	zip -r release-${VERSION}.zip manifest.json *.html *.css *.png *.js js *.md
