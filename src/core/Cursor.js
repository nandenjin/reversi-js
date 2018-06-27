
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

export { Cursor };
