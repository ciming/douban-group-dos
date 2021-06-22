import blessed from 'blessed'
import cheerio from 'cheerio'
// import chalk from 'chalk'
import axios from 'axios'

export default class Group {
  constructor(douban) {
    this.douban = douban
    this.url = null
    this.page = 1
    this.postList = []
    this.selectedIndex = 0 
    this.panel = blessed.List({
      parent: this.douban.screen,
      label: '列表(l)',
      bottom: 0,
      left: 0,
      width: "50%-1",
      height: '100%-3',
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
  async start(groupId) {
    try {
      this.url = groupId ? `https://www.douban.com/group/${groupId}/discussion`: this.url
      const data = await axios.get(this.url, {
        params: {
          start: (this.page - 1) * 25
        }
      })
      this.parsingHtml(data.data)
      this.renderList();
      return  data
    } catch (error) {
      console.log(error);
      // console.log(chalk.red('小组不存在，请重新选择'))
    }
  }
  /**
   * @description 解析html
   * @param html {String} - html代码
   */
  parsingHtml(html) {
    const $ = cheerio.load(html);
    const postList = []
    if(this.page > 1) {
      postList.push({
        title: 'prev',
        url: 'prev'
      })
    }
    $('table.olt tr').not('.th').each((index, element) => {
      const linkObj = $(element).find('a')
      const title = linkObj.attr('title')
      const url = linkObj.attr('href')
      postList.push({
        title,
        url
      })
    })
    postList.push({
      title: 'next',
      url: 'next'
    })
    this.postList = postList
  }
  renderList() {
    // console.log(this.postList);
    this.panel.clearItems()
    this.postList.forEach(item => {
      this.panel.addItem(item.title)
    })
    this.panel.focus()
    this.selectedIndex = 0 
    this.douban.update()
  }
  /**
   * 绑定键盘事件
   */
  bindKeyboard() {
    this.panel.key(['up'],() => {
      if(this.selectedIndex >0) {
        this.selectedIndex --
      }
      this.panel.select(this.selectedIndex)
      this.douban.update()
    })
    this.panel.key(['down'],() => {
      if(this.selectedIndex < this.postList.length - 1) {
        this.selectedIndex ++
      }
      this.panel.select(this.selectedIndex)
      this.douban.update()
    })
    this.panel.key(['C-r'],() => {
      this.page = 1
      this.start()
    })
    this.panel.key(['enter'],() => {
      const url = this.postList[this.selectedIndex].url
      if(url === 'prev') {
        this.page -= 1
        this.start()
        return 
      }
      if(url === 'next') {
        this.page += 1
        this.start()
        return 
      }
      this.douban.post.start(url)
    })
  }
}