#!/bin/sh
rm -rf output

mkdir -p output/webroot/fe/webapp/static

cp -r ./*  output/webroot/fe/webapp/static


cd output
find ./ -name .svn -exec rm -rf {} \;

tar cvzf static-fe.tar.gz webroot
rm -rf webapp webroot

