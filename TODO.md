1. packages need a dev script because we are building the package to import with tsdown. so those packages needs to build on watch mode with tsdown for hmr. make sure, turbo json dev depennds on those packages being built. otherwise a fresh package that just ran git clone and bun i and bun dev, it fails, becaus ethe module import could befound, when bun run build is run, then bun dev works.

## setup project
- create .env.example and .dev-vars.example and make sure they are git ignored, and setup script should automatically setup the values. for the values that can be set, others should be like xxxxx with a comment line on top how to get it, one liner maybe a link url
- reset git and inintlize git on setup script
