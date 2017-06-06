.PHONY : build zip release clean

VERSION = $(shell cat manifest.json | jq .version -r)

build:
	tsc
	sass style.scss:style.css

zip:
	zip release-${VERSION}.zip manifest.json *.html *.css *.png *.js *.md

release: clean build zip

clean:
	-rm *.zip
	-rm *.css
	-rm index.js