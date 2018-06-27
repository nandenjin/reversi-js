
import { Cursor } from '../core/Cursor.js';
import { Renderer } from './Renderer.js';

class HTMLRenderer extends Renderer {


  constructor( board, options ) {

    super( board, options );
    
    options = options || {};
    this.clickable = options.clickable || false;
    this.role = options.role || null;


    const w = board.width;
    const h = board.height;

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


  _onClicked( cursor, color ) {

    this.emit( 'click', cursor );

    if( !this.clickable ) return this;
    if( color === undefined || color === null ) return this;

    return this.board.putPiece( cursor, color );

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

export { HTMLRenderer };
