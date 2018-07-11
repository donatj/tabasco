.PHONY : build lint zip release clean

VERSION = $(shell cat manifest.json | jq .version -r)

build: lint style.css
	./node_modules/.bin/tsc

lint:
	./node_modules/.bin/tslint -c tslint.json 'ts/**/*.ts' --fix

style.css: style.scss
	sass style.scss:style.css

zip:
	zip release-${VERSION}.zip manifest.json *.html *.css *.png *.js *.md

release: clean build zip

clean:
	-rm *.zip
	-rm *.css
	-rm index.js