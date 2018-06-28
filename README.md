# reversi-js
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Dependencies](https://david-dm.org/nandenjin/reversi-js.svg)](https://david-dm.org/nandenjin/reversi-js)
[![devDependencies](https://david-dm.org/nandenjin/reversi-js/dev-status.svg)](https://david-dm.org/nandenjin/reversi-js?type=dev)

### Reversi simulation library for browser and Node.js

## Install
```shell
# MAKE SURE INSTALL FROM MASTER BRANCH BY ADDING #MASTER
# AT THE END OF REPO URL

npm install https://github.com/nandenjin/reversi-js.git#master
```

## Usage
### For web browsers
```javascript
// With bundlers like webpack
// import reversi from 'reversi';
// import 'reversi/examples/css/HTMLRenderer.css';

const board = new reversi.Board( 8, 8 );

const b = reversi.Board.colors.BLACK;
const w = reversi.Board.colors.WHITE;
board.loadArray( [ b, w, w, b ], new reversi.Cursor( 3, 3 ) );

const renderer = new reversi.HTMLRenderer( board, { clickable: true, role: b } );
document.body.appendChild( renderer.domElement );
```
