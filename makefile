.PHONY : build lint zip release clean

VERSION = $(shell jq .version -r manifest.json)

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
	-rm -rf js