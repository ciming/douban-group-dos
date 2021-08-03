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
        },
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          Cookie: 'bid=F9W3A4NyIjA; douban-fav-remind=1; push_doumail_num=0; __utmv=30149280.11627; douban-profile-remind=1; gr_user_id=cba5b727-8bf4-4375-88c5-0b59cdd2ced7; _vwo_uuid_v2=D42736BAE0FDA3630CE68C6B1090CBAD7|1471dce7e66c80a78c2b0c59d01c9699; _ga=GA1.2.1979593813.1610597110; Hm_lvt_19fc7b106453f97b6a84d64302f21a04=1623052721; viewed="30216624_26979890"; ll="118172"; ct=y; dbcl2="116277928:8kAhj43AyFk"; ck=_iDa; __utmc=30149280; push_noty_num=0; __utmz=30149280.1627811592.1133.28.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1627971778%2C%22https%3A%2F%2Fsec.douban.com%2F%22%5D; __utma=30149280.1979593813.1610597110.1627951323.1627971778.1142; _pk_id.100001.8cb4=48b889cf419dbc4d.1610597110.1138.1627971856.1627951417.; _gid=GA1.2.1582365932.1627973792',
          Host: 'www.douban.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'
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