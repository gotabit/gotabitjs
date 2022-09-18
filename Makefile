all: init build pack

init:
	@echo "Install dependencies"
	npm i

lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

build: 
	npm run build

pack:
	npm run webpack

clean: 
	rm -rf ./dist ./build ./node_modules

.PHONY: all init build pack clean lint
