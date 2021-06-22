import fs from 'fs'

import blessed from 'blessed'
import Search from './search.mjs'
import Group from './group.mjs'
import Post from './post.mjs'
const rootDir = process.cwd()
const logPath = rootDir + '/blessed.log'
let logws = fs.createWriteStream(logPath,{
  flags: 'w', // 
  encoding: 'utf8',
})

let logger = new console.Console(logws);

export default class Douban{
  constructor() {
    this.screen = blessed.screen({
      debug: true,
      smartCSR: true,
      fullUnicode: true
    });
    this.screen.title = '豆瓣小组';
    this.search = new Search(this)
    this.group = new Group(this)
    this.post = new Post(this)
    this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
    this.screen.key(['i'], (ch, key) => {
      this.search.panel.focus()
    });
    this.screen.key(['l'], (ch, key) => {
      this.group.panel.focus()
    });
    this.screen.key(['p'], (ch, key) => {
      this.post.panel.focus()
    });
    this.update()
  }
  update() {
    this.screen.render();
  }
}