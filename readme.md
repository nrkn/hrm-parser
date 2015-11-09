# hrm-parser

## A parser for Human Resouce Machine programs

![Screenshot](http://tomorrowcorporation.com/blog/wp-content/themes/tcTheme2/images/hrm/screenshots/hrm_04.png)

> Human Resource Machine is a puzzle game. In each level, your boss gives you a job. Automate it by programming your little office worker! If you succeed, you'll be promoted up to the next level for another year of work in the vast office building. Congratulations!

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

If you want to handle errors yourself, or get metadata about comments, labels etc. you can use the async version:

```javascript
parser( source, ( err, program, meta ) => {
  //...
})
```

`program` will be in the same format as above.

`meta` contains the following, all references to the program and line numbers are the `program` array above:

```javascript
{
  //source comments - the key in the object is the line nubmer in the program
  //above which these comments appear
  "comments": {    
    "0": [
      "-- HUMAN RESOURCE MACHINE PROGRAM --"
    ]
  },
  
  //information about jumps - the key is the original label name without the 
  //trailing colon, to is the program line above which the jump's arrow points,
  //from is the program line where the jump originated
  "jumps": {
    "a": {
      "to": 5,
      "from": 14
    },
    "b": {
      "to": 5,
      "from": 11
    }
  },
  
  //information about images embedded in the program
  "images": {
  
    //the key in the comments object is the line number above which these 
    //comment images appear
    "comments": {
      "5": [
        "eJyrZmBgeCCVoGkkclTntoC3YQL/bJsE/sm+MwUfRUwUKU07LHm0UF/xeRGTmn2ujcbODKByhhX6e21X6L92P2ow2feWSV0oj1VMCIttgHeyrZmlmw2HfraVvYahxR/VMLM/qjImCZogPaV+l6oSvGJCFnnyeC7yzDWq9W7SmuWToBnh+0f1it8tlfUBsupnAo/qdAV9NusKcnbKDVzhGhDw2v2nz0k3kH6f2OlKT+M/mzElRljZJFdZi6eaWU5O22CyIf2PanNOTIhjbkJec87RQvZsjhKTNI4SkB7nls9ms9r1vCZ11YVq96pFp/a7x8yf6B6zZ9KjCJD89Cmv3funHwz3ncESlTVzfpjGrADvkzPtNUBy31fnGlWv+my2YEWqs+OKAO//KySDZFYdDL+0tiuOZfP7xIYt7xP/bHWPid5WFxq9bYvf/S2KjpobL5neWtWkBdKfcGC2jfWhzFjrQ5N95Q5+NrtyxNvQ4UyuEUhu560uyTk3pyv9vhlhNeWOdbDCjdfu7VeBbrkkGWRw6WzCySuyOczX7XNtb/7J2nlrenr5bcHkKXfqQkF6l77VMtB8k2t06vUlU803bS52H74H6H1zj+n9ditT8X1C3qnXsjlrX93K9HtVmgZR7214/z2HfvCXCCuGUTAKsAAAB3jLcg;"
      ],
      "12": [
        "eJyLYWBgaOUVTE7gL03jFfuTxSr5J0tK1ijlhmxMiJLUa3d/UWcnZ757dsd5Xrtz8rBEZfCcTXjCuzNDVDii/rRYaoeULG8f0AgGE23RWhNtjpIdmrcyIzWtgz9p63np6L12VzHk8YwzvuZvafooYoIFRwlIrbVPoU+Cl57XeZcA7+uOjyKuO66J3+Rsn8vpzlFyxzu3/KdPV9xPnw0mtd63VBi9zkqD9KzI+h6wNy8ktbjoT9aE4j9Zp0pDUpMrDobfr3wU8aV2evr5+udF3o1HC9WaQ1JbmzNj1ZoVHUH6Hk645t80ITM2dtKtzKrJ9rkXpx0tfDZrSQHTnOnpiXPcY1xnWwe/m77C9eK0VOebk9tcYie9dp8/sdAHpJd9WZsL+7Jr/o+WCyYvWBGSGrfymv+tVc5OYWvu2fFsmG0DUhNw7LV7xOE2l0X7U53P7zrptmnnFr9NO98n6u2+lZmxNyFP7mBC3s9Df7LEjlzz3364S5JhFIyCQQYAmMqZXQ;"
      ]
    },
    
    //the key in the labels object is the floor tile which this label is 
    //assigned to
    "labels": {
      "16": "eJxTYGBgKBE2q5so0rQFyGQ4LcZw6rDkyQvzpE9eKFTYe1xf8fMBkHiO2JKtp8VmH+sUVzoN4v8Q/B4AosW1+ivydHdmqBieTdhrvCZ+q1lI6gSLhDxN69c9HdY712ZbNW25ZO6z+5bJ3uN7je+d+GN/8sJUp5MXNjm3nRN0gZg1CkbBKBg4AACGCzVc;",
      "17": "eJyTYmBguCz8KOKFeIB3iiSP5wOpVGcpWQaHzfLOTpnKhT42GlqlkZoBE3Zo7j0OVMrgo/S6x1xuRZe7xIqu2wIBExbxzZ/9hHfNEme+0tW3Bew38Yot2XpDdsnWPsXEzQfUpq+J1Hw8N1KzbhbDKBgFo2BQAgCttie8;"
    }
  }
}  
```

### Similar projects

[hrm-grammar](https://github.com/sixlettervariables/hrm-grammar) uses a proper expression grammar and produces an AST
