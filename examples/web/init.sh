#!/bin/sh

rm -rf dist
cp -a ../../dist .
http-server -p 443
