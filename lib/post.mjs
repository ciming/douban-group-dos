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
      const {data} = await axios.get(this.url, {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          Cookie: 'bid=F9W3A4NyIjA; douban-fav-remind=1; push_doumail_num=0; __utmv=30149280.11627; douban-profile-remind=1; gr_user_id=cba5b727-8bf4-4375-88c5-0b59cdd2ced7; _vwo_uuid_v2=D42736BAE0FDA3630CE68C6B1090CBAD7|1471dce7e66c80a78c2b0c59d01c9699; _ga=GA1.2.1979593813.1610597110; Hm_lvt_19fc7b106453f97b6a84d64302f21a04=1623052721; viewed="30216624_26979890"; ll="118172"; ct=y; dbcl2="116277928:8kAhj43AyFk"; ck=_iDa; __utmc=30149280; push_noty_num=0; __utmz=30149280.1627811592.1133.28.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1627971778%2C%22https%3A%2F%2Fsec.douban.com%2F%22%5D; __utma=30149280.1979593813.1610597110.1627951323.1627971778.1142; _pk_id.100001.8cb4=48b889cf419dbc4d.1610597110.1138.1627971856.1627951417.; _gid=GA1.2.1582365932.1627973792',
          Host: 'www.douban.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'
        }
      })
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
      // const options = {
      //   fit:    'width',
      //   width:  20,
      // }
      // asciify(url, options, function (err, asciified) {
      //   if (err) reject(err);
      //   resolve(asciified);
      // });
      resolve(url)
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