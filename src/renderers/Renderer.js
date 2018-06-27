
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


  emit( type, event ) {

    if( !this._listeners[ type ] ) return this;

    this._listeners[ type ].forEach( listener => listener( event ) );

    return this;

  }

}

export { Renderer };
