[![Build Status](https://travis-ci.org/mabels/s3-autoindex.svg?branch=master)](https://travis-ci.org/mabels/s3-autoindex)
[![npm](https://img.shields.io/npm/v/s3-autoindex.svg)](https://www.npmjs.com/package/s3-autoindex)
[![Greenkeeper badge](https://badges.greenkeeper.io/mabels/s3-autoindex.svg)](https://greenkeeper.io/)

# s3-autoindex

Serve the contents of a S3 bucket (private or public) over HTTP.

```shell
$ npm install -g s3-autoindex
$ s3-autoindex --key $AWS_ACCESS_KEY_ID --secret $AWS_ACCESS_KEY_SECRET --bucket my-s3-bucket --port 9101
Serving my-s3-bucket on port 9101
```

S3 Autoindex is a proxy server which streams resources from an S3 bucket over HTTP. 
For example, in the example above, a request for "http://localhost:9101/index.html" 
would return the contents of "index.html" in the "my-s3-bucket", regardless of 
whether it's private or not (so long as the key provided has access).

## Parameters

* `--key` parameter or `AWS_ACCESS_KEY_ID` environment variable. Required.
* `--secret` parameter or `AWS_SECRET_ACCESS_KEY` environment variable. Required.
* `--bucket` parameter or `S3_SERVER_BUCKET` environment variable. Required.
* `--port` parameter or `S3_SERVER_PORT` environment variable. Optional, defaults to 3010.

## Run using Docker

A Docker image is available in Docker hub.  You need to provide several mandatory environment variables.  

### Method 1: single command
Replacing the asterisks with details you want, run this command

    docker run \
        -e "AWS_ACCESS_KEY_ID=****" \
        -e "AWS_SECRET_ACCESS_KEY=****" \
        -e "S3_BUCKET=****" \
        -p 8000:9000 \
        fastandfearless/s3-autoindex
Then browse to http://localhost:8000/

### Method 2: make your own Docker image
Create a file called `Dockerfile` with this contents, replacing the asterisks with details you want

    FROM fastandfearless/s3-autoindex
    
    ENV AWS_ACCESS_KEY_ID=****
    ENV AWS_SECRET_ACCESS_KEY=****
    ENV S3_BUCKET=u****
    ENV PORT=7777

Then run something like this:

    docker build -t s3
    docker run -p 8000:7777 s3

Then browse to http://localhost:8000/
