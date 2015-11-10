'use strict'

require( './polyfills' )

const oneArity = [ 'INBOX', 'OUTBOX' ]
const twoArity = [ 'COPYFROM', 'COPYTO', 'ADD', 'SUB', 'BUMPUP', 'BUMPDN', 'JUMP', 'JUMPZ', 'JUMPN' ]
const jumps = [ 'JUMP', 'JUMPZ', 'JUMPN' ]

//make list of instructions before putting COMMENT in as comment is not a real instr
const instr = oneArity.concat( twoArity )

twoArity.push( 'COMMENT' )

const tokens = {
  comment: {
    start: /\-\-/,
    end: /\n/
  },
  define: {
    start: /DEFINE\s+(?:COMMENT|LABEL)\s+\d+\s+eJ[-a-z0-9+/=\s]+;/i,
    end: /;/
  },
  label: {
    start: /[a-z][a-z0-9]*:/,
    end: /:/
  },
  direct: {
    start: /\d+/,
    end: /\s/
  },
  reference: {
    start: /\[\d+\]/,
    end: /\]/
  },
  word: {
    start: /\w/,
    end: /\s/
  },
  whitespace: {
    start: /\s/,
    end: /\s/
  }
}

const mappers = {
  define: node => {
    const segs = node.value
      .split( /\s/ )
      .filter( s => s !== '' )
      
    return { 
      type: segs[ 1 ].toLowerCase() + 's', 
      id: Number( segs[ 2 ] ), 
      image: segs.slice( 3 ).join( '' ) 
    }
  },
  direct: node => Number( node.value ),
  word: node => {
    if( instr.includes( node.value.toUpperCase() ) )
      return node.value.toUpperCase()    
    
    return node.value
  }
}

const next = str => {
  const matches = Object.keys( tokens ).map( key => {
    return {
      key: key,
      match: tokens[ key ].start.exec( str )
    }
  })
  
  const start = matches.find( m => m.match && m.match.index === 0 )
  const end = tokens[ start.key ].end.exec( str )
  
  return { 
    key: start.key,
    start: start.match.index, 
    end: end.index
  }
}

const tokenize = str => {
  const tokens = []
  
  str += ' '

  while( str.length > 0 ){
    let n = next( str )    
    let token = str.substring( n.start, n.end + 1 )
    
    tokens.push( {
      key: n.key,
      value: token.trim()
    })
    
    str = str.substring( n.end + 1 )
  }

  return tokens
    .filter( t => t.value !== '' )
    .map( node =>
      mappers[ node.key ] ? {
        key: node.key,
        value: mappers[ node.key ]( node )
      } : node
    )    
}

const Ast = tokens => {
  const ast = []
  let line = []
  
  while( tokens.length > 0 ){
    let token = tokens.shift()    
    let isWord = token.key === 'word'
    let isInstr = instr.includes( token.value )    
    let current = JSON.parse( JSON.stringify( token ) )
    
    if( twoArity.includes( token.value ) ){
      current.arg = tokens.shift()
    }
    
    line.push( current )
    
    if( tokens.length === 0 || ( isWord && isInstr ) ){    
      ast.push( line )
      line = []
    }
  }
  
  return ast  
}

const build = ( str, callback ) => {  
  const isCb = typeof callback === 'function'
  
  const meta = {
    comments: {},
    jumps: {},
    images: {
      comments: {},
      labels: {}      
    }
  }
  
  let tokens  
  try{ 
    tokens = tokenize( str )
  } catch( e ){
    var error = Error( 'Unexpected value' )
    if( isCb ) {
      callback( error )
    } else {
      throw error
    }
    return
  }
  
  const defines = tokens.filter( t => t.key === 'define' )
  const commentDefines = defines.filter( t => t.value.type === 'comments' )
  const labelDefines = defines.filter( d => d.value.type === 'labels' )
  
  const ast = Ast( tokens.filter( t => t.key !== 'define' ) )  

  labelDefines.forEach( d => {
    meta.images.labels[ d.value.id ] = d.value.image
  })

  const program = []  
  
  const handlers = {
    word: ( node, line ) => {
      const isInstr = instr.includes( node.value )
      
      if( isInstr ){
        if( oneArity.includes( node.value ) ){
          program.push([ node.value ])
        } else {
          let arg = node.arg.value
          program.push([ node.value, arg ])
        }        
      } else if( node.value === 'COMMENT' ){
        if( !Array.isArray( meta.images.comments[ line ] ) )
          meta.images.comments[ line ] = []
        
        const define = commentDefines.find( d => d.value.id === node.arg.value )
        
        meta.images.comments[ line ].push( define.value.image )
      }         
    },
    comment: ( node, line ) => {
      if( !Array.isArray( meta.comments[ line ] ) )            
        meta.comments[ line ] = []
      
      meta.comments[ line ].push( node.value )
    },
    label: ( node, line ) => {
      const name = node.value.replace( ':', '' )
      
      meta.jumps[ name ] = {
        to: line
      }
    }
  }
  
  ast.forEach( ( line, i ) =>
    line.forEach( node =>
      handlers[ node.key ]( node, i )
    )       
  )
  
  program.forEach( ( line, i ) => {
    const instr = line[ 0 ]
    
    if( jumps.includes( instr ) ){
      const name = line[ 1 ]
      const to = meta.jumps[ name ].to
      
      line[ 1 ] = to
      meta.jumps[ name ].from = i
    }
  })
  
  if( isCb ){   
    callback( null, program, meta )
  } else {
    return program
  }
}

module.exports = ( asm, callback ) => {
  const isCb = typeof callback === 'function'
  
  if( isCb ){
    build( asm, callback )
  } else {
    return build( asm )
  }
}