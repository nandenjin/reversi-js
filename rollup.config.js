
// import babel        from 'rollup-plugin-babel'

export default {

  input: 'src/index.js',

  output: [

    {
      format: 'umd',
      name: 'reversi',
      file: 'build/reversi.js',
    },

    {
      format: 'es', 
      file: 'build/reversi.module.js',
    }

  ]
}
