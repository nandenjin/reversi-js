
import { Cursor } from './Cursor.js';

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

    const colors = this.constructor.colors;

    if( ![ colors.BLACK, colors.WHITE ].includes( color ) )
      console.warn( "Board.getPiece: color must be Board.colors.BLACK or Board.colors.WHITE." );

    if( this.getPiece( cursor ) !== colors.EMPTY ) return null;

    const opColor = color === colors.BLACK ? colors.WHITE : colors.BLACK;

    const affected = [];

    [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ -1, 0 ], [ 0, -1 ], [ -1, -1 ], [ -1, 1 ], [ 1, -1 ] ]
      .forEach( d => {

        const dx = d[ 0 ], dy = d[ 1 ];
        const c = cursor.clone().shift( dx, dy );
        const t = [];

        while( this.contains( c ) ) {

          const pieceColor = this.getPiece( c );

          if( pieceColor == color ) {

            affected.push.apply( affected, t );
            break;

          }else if( pieceColor == opColor ) {

            t.push( c.clone() );

          }else if( pieceColor == colors.EMPTY ){

            break;

          }

          c.shift( dx, dy );

        }

      } );

    if( affected.length === 0 ) return null;

    if( !dryRun ){

      this.setPiece( cursor, color );
      affected.forEach( c => this.setPiece( c, color ) );

      this.emit( 'put', cursor, affected );

    }

    return affected;

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

export { Board };
