build: install
	mkdir -p build
	browserify -r ./index.js:drag-element > build/build.js

clean:
	rm -rf build

distclean: clean
	rm -rf node_modules

install:
	npm install
