# hrm-parser

## A parser for Human Resouce Machine programs

![Screenshot](http://tomorrowcorporation.com/blog/wp-content/themes/tcTheme2/images/hrm/screenshots/hrm_04.png)

> Human Resource Machine is a puzzle game. In each level, your boss gives you a job. Automate it by programming your little office worker! If you succeed, you'll be promoted up to the next level for another year of work in the vast office building. Congratulations!

Note that it throws away source comments, comments and labels - if you need 
these I recommend using [hrm-grammar](https://github.com/sixlettervariables/hrm-grammar) 
instead, it uses a proper expression grammar and will produce an AST

### NPM

`npm install hrm-parser`

### Usage

Requires node 4.x - uses ES6

```javascript

const parser = require( 'hrm-parser' )

//source is a string in the Human Resource Machine format
const source = getSource()

const parsed = parser( source )
```

It will output something like:
```json
[ 
  [ "BUMPUP", 24 ],
  [ "INBOX" ],
  [ "JUMPZ", 9 ],
  [ "COPYTO", "[24]" ],
  [ "JUMP", 0 ],
  [ "COPYFROM", "[19]" ],
  [ "OUTBOX" ],
  [ "COPYFROM", "[24]" ],
  [ "COPYTO", "[19]" ],
  [ "BUMPDN", 24 ],
  [ "JUMPZ", 0 ],
  [ "COPYTO", 23 ],
  [ "COPYFROM", 23 ],
  [ "COPYTO", 19 ],
  [ "BUMPDN", 23 ],
  [ "JUMPZ", 5 ],
  [ "COPYFROM", "[23]" ],
  [ "SUB", "[19]" ],
  [ "JUMPN", 12 ],
  [ "JUMP", 14 ] 
]
```