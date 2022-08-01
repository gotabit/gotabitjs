all: init build

init:
	@echo "Install dependencies"
	npm i

build: 
	npm run build

pack:
	npm run webpack

clean: 
	rm -rf ./dist ./build ./node_modules

.PHONY: all init build pack clean
