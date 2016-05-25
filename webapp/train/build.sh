#!/bin/sh
rm -rf output

mkdir -p output/webroot/fe/webapp/train

cp -r ./*  output/webroot/fe/webapp/train


cd output
find ./ -name .svn -exec rm -rf {} \;

tar cvzf train-fe.tar.gz webroot
rm -rf webapp webroot

