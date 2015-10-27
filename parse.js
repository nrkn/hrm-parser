require( './polyfills' )

const oneArity = [ 'INBOX', 'OUTBOX' ]
const twoArity = [ 'COPYFROM', 'COPYTO', 'ADD', 'SUB', 'BUMPUP', 'BUMPDN', 'JUMP', 'JUMPZ', 'JUMPN', 'COMMENT' ]
const jumps = [ 'JUMP', 'JUMPZ', 'JUMPN' ]

const regex = {
  comment: /\-\-\s.*?\s\-\-/g,
  define: /DEFINE\s+(?:COMMENT|LABEL)\s+\d+\s+eJ[-a-z0-9+/=\s]+;/gi,
  label: /^[a-z]:$/i,
  direct: /^\d+$/,
  reference: /^\[\d+\]$/,
  address: /^\d+$|^\[\d+\]$/
}

const strip = [ regex.comment, regex.define ]
    
const parse = source => {
  const tokens = strip.reduce( 
      ( source, regex ) =>
        source.replace( regex, '' ),
      source 
    )
    .split( /\s+/ )
    .filter( token => token !== '' )
    
  const len = tokens.length
  var lines = []
  var i = 0
  
  while( i < len ){
    var current = tokens[ i ]
    
    if( regex.label.test( current ) || oneArity.includes( current.toUpperCase() ) ){
      lines.push( [ current ] )
      i++
    } else if( twoArity.includes( current.toUpperCase() ) ){
      lines.push( [ current, tokens[ i + 1 ] ] )
      i += 2
    } else {
      throw Error( `Unexpected token: "${ current }"` )
    }
  }
  
  lines = lines.filter( l => l[ 0 ] !== 'COMMENT' )
  
  const labels = {}
  i = 0
  
  lines = lines.reduce( ( lines, words ) => {
    const first = words[ 0 ]
    
    if( regex.label.test( first ) ){
      const label = first.replace( ':', '' )
      
      labels[ label ] = i
      
      return lines
    }
    
    lines.push( words )
    i++
    
    return lines
  }, [] )  
  
  lines = lines.map( words => {
    const instr = words[ 0 ].toUpperCase()
    
    if( twoArity.includes( instr ) ){
      var arg = words[ 1 ]
      
      if( jumps.includes( instr ) ){
        if( !arg in labels ){
          throw Error( 'No such label: ' + arg )
        }
        
        arg = labels[ arg ]
      }
      
      if( !regex.address.test( arg ) ){
        throw Error( 'Invalid address: ' + arg )
      }
      
      if( regex.direct.test( arg ) ){
        arg = Number( arg )
      } 
      
      return [ instr, arg ]
    }
    
    return [ instr ]
  })  
  
  return lines
}

module.exports = parse