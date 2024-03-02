## Installation

This is a Node.js express server application build to integrate with fallout api

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install
```

## Serve

1. Through local development:
```console
$ npm run dev
```

2. Through a container:
```console
$ docker build --env-file ./.env -t fallout-api .
$ docker run -p 3000:3000 fallout-api
```