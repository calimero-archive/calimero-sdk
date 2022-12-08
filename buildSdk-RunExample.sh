#Script for :
#1. Cleanup all old node_modules
#2. add node dependencies in the calimero-sdk (js-sha256)
#3. add node depencencies in the react example (near-api-js and bn.js)
#4. install & build new dependency version of calimero-sdk (pnpm install && build)
#5. install and run react exampe project

cd packages/calimero-sdk && rm -rf node_modules && pnpm add js-sha256 && \
    cd ../.. && rm -rf node_modules && pnpm install && pnpm build && \
    cd examples/simple-login && rm -rf node_modules && \
    pnpm install && pnpm add near-api-js && pnpm add bn.js && \
    pnpm run start