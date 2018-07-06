(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.reversi = {})));
}(this, (function (exports) { 'use strict';

  class Cursor {

    constructor( x, y ) {

      this.x = x;
      this.y = y;

    }

    clone() {

      return new Cursor( this.x, this.y );

    }

    copy( c ) {

      this.x = c.x;
      this.y = c.y;
      
      return this;

    }

    set( x, y ) {

      this.x = x;
      this.y = y;

      return this;

    }

    shift( x, y ) {

      this.x += x;
      this.y += y;

      return this;

    }

    isEqualTo( c ) {

      return this.x === c.x && this.y === c.y;

    }

  }

  class Board {

    constructor( w, h, options ) {

      options = options || {};

      this.width = w;
      this.height = h;

      this.data = [];

      for( let i = 0; i < h; i++ ){

        this.data[ i ] = [];

        for( let j = 0; j < w; j++ ){

          this.data[ i ][ j ] = 0;

        }

      }

      this._listeners = {};

    }


    clone() {

      const w = this.width, h = this.height;
      const b = new Board( w, h );

      return b.copy( this );

    }


    copy( b, offset ) {

      offset = offset || new Cursor( 0, 0 );

      const w = b.width, h = b.height;
      const x = offset.x, y = offset.y;

      for( let i = 0; i < h; i++ ){

        for( let j = 0; j < w; j++ )
          this.setPiece( new Cursor( x + j, y + i ), b.getPiece( new Cursor( j, i ) ) );

      }

      return this;

    }


    loadArray( array ) {

      array.forEach( ( v, i )  => this.data[ Math.floor( i / this.width ) ][ i % this.width ] = v );

      return this;

    }


    toArray() {

      const result = [];

      this.data.forEach( d => d.forEach( e => result.push( e ) ) );

      return result;

    }


    getCellCursors() {

      const cursors = [];

      for( let i = 0; i < this.height; i++ )
        for( let j = 0; j < this.width; j++ )
          cursors.push( new Cursor( j, i ) );

      return cursors;

    }


    contains( cursor ) {

      return 0 <= cursor.x && cursor.x < this.width && 0 <= cursor.y && cursor.y < this.height;

    }


    clear() {

      for( let i = 0; i < h; i++ )
        for( let j = 0; j < w; j++ )
          this.data[ i ][ j ] = 0;

      return this;

    }


    setPiece( cursor, color ) {

      this.data[ cursor.y ][ cursor.x ] = color;

      this.emit( 'change', cursor );

      return this;

    }


    getPiece( cursor ) {

      return this.data[ cursor.y ][ cursor.x ];

    }


    putPiece( cursor, color, options ) {

      options = options || {};
      const dryRun = options.dryRun;

      const affected = this.simulateEffect( cursor, color );

      if( affected.length === 0 ) return null;

      if( !dryRun ){

        this.setPiece( cursor, color );
        affected.forEach( c => this.setPiece( c, color ) );

        this.emit( 'put', cursor, affected );

      }

      return affected;

    }


    simulateEffect( cursor, color ) {

      const colors = this.constructor.colors;
      const affected = [];

      if( ![ colors.BLACK, colors.WHITE ].includes( color ) )
        console.warn( "Board.getPiece: color must be Board.colors.BLACK or Board.colors.WHITE." );

      const opColor = color === colors.BLACK ? colors.WHITE : colors.BLACK;

      if( this.getPiece( cursor ) !== colors.EMPTY ) return null;

      [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ -1, 0 ], [ 0, -1 ], [ -1, -1 ], [ -1, 1 ], [ 1, -1 ] ]
        .forEach( d => {

          const dx = d[ 0 ], dy = d[ 1 ];
          const c = cursor.clone().shift( dx, dy );
          const t = [];

          while( this.contains( c ) ) {

            const pieceColor = this.getPiece( c );

            if( pieceColor == color ) {

              affected.push( ...t );
              break;

            }else if( pieceColor == opColor ) {

              t.push( c.clone() );

            }else if( pieceColor == colors.EMPTY ){

              break;

            }

            c.shift( dx, dy );

          }

        } );

      return affected;

    }

    getSuggestions( color ) {

      const result = [];

      this.getCellCursors().forEach( cursor => {

        const affected = this.simulateEffect( cursor, color );
        if( affected && affected.length > 0 ) result.push( cursor );

      } );

      return result;

    }


    on( type, listener ) {

      this._listeners[ type ] = this._listeners[ type ] || [];
      this._listeners[ type ].push( listener );

      return this;

    }


    emit( type, ...events ) {

      if( !this._listeners[ type ] ) return this;

      this._listeners[ type ].forEach( listener => listener( ...events ) );

      return this;

    }


    static get colors() {

      return  {

        EMPTY: 0,
        BLACK: 1,
        WHITE: 2,

      };

    }


  }

  class Renderer{

    constructor( board, options ) {

      options = options || {};

      this._listeners = {};

      this.board = board;

      board.on( 'change', cursor => this.update( [ cursor ] ) );

    }

    update( cursors ) {

      if( !cursors || cursors.length === 0 ) cursors = this.board.getCellCursors();

      return this;

    }


    on( type, listener ) {

      this._listeners[ type ] = this._listeners[ type ] || [];
      this._listeners[ type ].push( listener );

      return this;

    }


    emit( type, ...events ) {

      if( !this._listeners[ type ] ) return this;

      this._listeners[ type ].forEach( listener => listener( ...events ) );

      return this;

    }

  }

  class HTMLRenderer extends Renderer {


    constructor( board, options ) {

      super( board, options );
      
      options = options || {};
      this.clickable = options.clickable || false;
      this.role = options.role || null;


      const w = board.width;
      const h = board.height;

      this._listeners = {};

      const container = document.createElement( 'div' );
      container.classList.add( 'reversi-board' );
      container.style.cssText = `display: grid; grid-template-columns: repeat(${w}, 1fr); grid-template-rows: repeat(${h}, 1fr);`;


      this.cells = [];

      for( let i = 0; i < h; i++ ) {

        this.cells[ i ] = [];

        for( let j = 0; j < w; j++ ) {

          const cell = document.createElement( 'div' );

          cell.classList.add( 'reversi-board__cell' );
          cell.style.cssText = `grid-column: ${ j + 1 }; grid-row: ${ i + 1 }`;

          cell.addEventListener( 'click', ( ( x, y ) => e => this._onClicked( new Cursor( x, y ), this.role ) )( j, i ) );

          container.appendChild( cell );

          this.cells[ i ].push( cell );

        }

      }

      this.domElement = container;

      board.on( 'put', ( ...e ) => this._onPut( ...e ) );

      this.update();

    }


    update( cursors ) {

      super.update( cursors );

      if( !cursors || cursors.length === 0 ) cursors = this.board.getCellCursors();

      const board = this.board;
      const colors = board.constructor.colors;

      cursors.forEach( cursor => {

        const cell = this.cells[ cursor.y ][ cursor.x ];

        cell.classList.remove( 'reversi-board__cell--black', 'reversi-board__cell--white' );

        const color = board.getPiece( cursor );

        if( color == colors.BLACK ) cell.classList.add( 'reversi-board__cell--black' );
        if( color == colors.WHITE ) cell.classList.add( 'reversi-board__cell--white' );

      } );

      return this;

    }


    setRole( role ) {

      this.role = role;

      return this;

    }


    on( type, listener ) {

      this._listeners[ type ] = this._listeners[ type ] || [];
      this._listeners[ type ].push( listener );

      return this;

    }


    emit( type, ...events ) {

      if( !this._listeners[ type ] ) return this;

      this._listeners[ type ].forEach( listener => listener( ...events ) );

      return this;

    }


    _onClicked( cursor, color ) {

      if( !this.clickable ) return null;
      if( color === undefined || color === null ) return null;

      const r = this.board.putPiece( cursor, color );
      if( r ) this.emit( 'click', cursor );

      return r;

    }


    _onPut( cursor, affecteds ) {

      const board = this.board;
      const cells = this.cells;

      board.getCellCursors().forEach( c => {

        const dom = cells[ c.y ][ c.x ];

        dom.classList.remove( 'reversi-board__cell--last-put' );
        dom.classList.remove( 'reversi-board__cell--last-affected' );

        if( c.isEqualTo( cursor ) ) dom.classList.add( 'reversi-board__cell--last-put' );
        if( affecteds.some( a => c.isEqualTo( a ) ) ) dom.classList.add( 'reversi-board__cell--last-affected' );

      } );

      return;

    }


  }

  exports.Cursor = Cursor;
  exports.Board = Board;
  exports.Renderer = Renderer;
  exports.HTMLRenderer = HTMLRenderer;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
