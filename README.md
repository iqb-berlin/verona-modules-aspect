# Verona Modules Aspect

Repository for the Aspect Editor and Player. The applications have a shared code base, but can be run and built separately.

Meant to be used in [IQB-Teststudio](https://github.com/iqb-berlin/teststudio-lite-setup) and [IQB-Testcenter](https://github.com/iqb-berlin/testcenter-setup).

Both conform to the Verona API definition:

[Editor-API](https://verona-interfaces.github.io/editor/)

[Player-API](https://verona-interfaces.github.io/player/)

## Supported Browsers
last 1 Chrome version

last 1 Firefox version

last 2 Edge major versions

last 2 Safari major versions

last 2 iOS major versions

Firefox ESR

not IE 11


## Build & Run

To build the packages or run the local development environment, first install the NPM packages. You need to have a recent version of node and npm (tested and working with versions: 6,7,8) installed.
> npm install

### Run development server
Run the package on a local development server (this builds the app automatically).

>npm run start-editor-local

or

>npm run start-player-local

### Build
This produces an HTML file in the `dist` folder, named `iqb-{module}-aspect-{version}.html`.

>npm run build-editor

or

>npm run build-player
