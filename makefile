.PHONY : build zip release clean

build:
	tsc
	sass style.scss:style.css

zip:
	zip release.zip manifest.json *.css *.png *.js *.md

release: clean build zip

clean:
	-rm *.zip
	-rm *.css
	-rm index.js