This repository demos an issue I have with npm (8.11 and other versions)

I need to build the same module against different registries, and the
registries include different 'implementations' of the same npm package version.
They have different integrity and dependencies.

I understand this is a weird use case and npm is not designed for mutable
package versions - especially not when using a lock file. However, this is the
situation I'm in.

One thing I've tried is to call `npm update <list of mutable packages>`.
Interestingly this will install the current registries version of the package,
but it will not install their dependencies.

This repo includes a script - `registry.mjs` that demonstrates this behavior.

### output

Started two registries, /green and /blue.
Both host a different revision of 'pivot' and the same copy of 'common'
pivot in /green has no dependencies
pivot in /blue depends on common

```
added 1 package in 185ms
npm-unlocked-demo@ /home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo
└── pivot@1.0.0


> start
> node index.js

im green
```

Installed this module with the /green registry
```
added 1 package in 188ms
npm-unlocked-demo@ /home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo
└── pivot@1.0.0


> start
> node index.js

im blue
node:internal/modules/cjs/loader:936
  throw err;
  ^

Error: Cannot find module 'common'
Require stack:
- /home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo/node_modules/pivot/index.js
- /home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo/index.js
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo/node_modules/pivot/index.js:2:1)
    at Module._compile (node:internal/modules/cjs/loader:1105:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Module.require (node:internal/modules/cjs/loader:1005:19) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo/node_modules/pivot/index.js',
    '/home/ANT.AMAZON.COM/calebev/github/everett1992/npm-unlocked-demo/index.js'
  ]
}
npm start exited 1
```

Removed node_modules (but not package-lock) and update-installed with /blue

node_modules/pivot/index.js is updated to the blue version and printed 'im blue'
but it could not find 'common'.
