import blessed from 'blessed'
import cheerio from 'cheerio'
import axios from 'axios'
import chalk from 'chalk'



export default class Post {
  constructor(douban) {
    this.douban = douban
    this.url = null
    this.offset = 0
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
      const data = await axios.get(this.url, {})
      this.parsingContent(data.data)
      
      return  data
    } catch (error) {
      console.log(error);
      // console.log(chalk.red('小组不存在，请重新选择'))
    }
  }
  parsingContent(html) {
    const $ = cheerio.load(html);
    const title = $('h1').text().trim()
    const content = $('#link-report').text().trim()
    let comment = ''
    $('#comments').find('.reply-item').each((index, item) => {
      const user = $(item).find('h4').find('a').text()
      const content = $(item).find('.reply-content').text()
      comment += `\n\n${chalk.gray(user)}:「${content}」`
    })
    this.panel.setContent(`${title}\n${content}\n----\n${comment}`)
    this.panel.resetScroll()
    this.panel.focus()
  }
  /**
   * 绑定键盘事件
   */
   bindKeyboard() {
    this.panel.key(['w'],() => {
      this.panel.scroll(-6)
    })
    this.panel.key(['s'],() => {
      this.panel.scroll(6)
    })
  }
}