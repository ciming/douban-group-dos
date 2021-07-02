import blessed from 'blessed'
import cheerio from 'cheerio'
import axios from 'axios'
import chalk from 'chalk'
import asciify from 'asciify-image'

export default class Post {
  constructor(douban) {
    this.douban = douban
    this.url = null
    this.scrollOffset = 0
    this.nextUrl = null
    this.title = null
    this.content = null
    this.imageList = null
    this.comments = []
    this.isLoadingComments = false
    this.panel = blessed.box({
      parent: this.douban.screen,
      label: '帖子(p)',
      top: 0,
      right: 0,
      width: "50%-1",
      height: '100%',
      scrollable: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'white'
        },
        item: {

        },
        selected: {
          fg: '#ffff54'
        },
        focus: {
          border: {
            fg: '#00BFFF'
          },
        },
      }
    })
    this.bindKeyboard()
  }
  async start(url) {
    this.url = url || this.url
    try {
      const {data} = await axios.get(this.url, {})
      const $ = cheerio.load(data);
      this.parsingContent($)
      
      return  data
    } catch (error) {
      console.log(error);
      // console.log(chalk.red('小组不存在，请重新选择'))
    }
  }
  async parsingContent($) {
    this.title = $('h1').text().trim()
    this.content = $('#link-report').text().trim()
    const imageList = []
    $('#link-report').find('img').each((index, item) => {
      imageList.push($(item).attr('src'))
      // console.log($(item).attr('src'));
    })
    this.imageList = await this.renderImageList(imageList)
   
    // return 
    const comments = []
    $('#comments').find('.reply-item').each((index, item) => {
      const user = $(item).find('h4').find('a').text()
      const content = $(item).find('.reply-content').text()
      comments.push({
        user,
        content
      })
    })
    this.comments = comments
    this.nextUrl = $('.next').find('a').attr('href')
    this.renderConent()
    this.panel.resetScroll()
    this.scrollOffset = 0
    this.panel.focus()
  }
  async renderImageList(imageList) {
    const promises = await Promise.all(imageList.map(v => this.renderImage(v)))
    return promises.join('\n')
    
  }
  renderImage(url) {
    return new Promise((resolve, reject) => {
      // imageToAscii(url, {
      // }, (err, converted) => {
      //   resolve(err || converted)
      // });
      const options = {
        fit:    'width',
        width:  30,
      }
      asciify(url, options, function (err, asciified) {
        if (err) reject(err);
        resolve(asciified);
      });
    })
  }
  renderConent() {
    let comment = ''
    this.comments.forEach((item) => {
      comment += `\n\n${chalk.gray(item.user)}:「${item.content}」`
    })
    // let imageList = this.imageList.join('\n')
    this.panel.setContent(`${this.title}\n\n${this.content}\n${this.imageList}\n----\n${comment}`)
    
  }
 
  /**
   * 加载下一页评论
   */
  async loadComment() {
    if(this.isLoadingComments || !this.nextUrl) return 
    this.isLoadingComments = true
    try {
      const {data} = await axios.get(this.nextUrl)
      const $ = cheerio.load(data)
      $('#comments').find('.reply-item').each((index, item) => {
        const user = $(item).find('h4').find('a').text()
        const content = $(item).find('.reply-content').text()
        this.comments.push({
          user,
          content
        })
      })
      this.nextUrl = $('.next').find('a').attr('href') || null
      this.renderConent()
    } catch (error) {
      console.log(error)
    }
    this.isLoadingComments = false
  }
  /**
   * 绑定键盘事件
   */
   bindKeyboard() {
    this.panel.key(['up'],() => {
      this.scrollOffset =  this.scrollOffset - 5
      if(this.scrollOffset < 0 ) {
        this.scrollOffset = 0
      }
      this.panel.scrollTo(this.scrollOffset)
    })
    this.panel.key(['down'],() => {
      this.scrollOffset =  this.scrollOffset + 5
      const height = this.panel.getScrollHeight()
      if(this.scrollOffset >= height ) {
        this.scrollOffset = height
        this.loadComment()
      }
      this.panel.scrollTo(this.scrollOffset)
    })
    // this.panel.on('keypress', (_, key)=> {
    //   console.log(key);
    // })
  }
}