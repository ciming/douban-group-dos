import blessed from 'blessed'

export default class Search{
  constructor(douban) {
    this.douban = douban
    
    this.panel = blessed.Textbox({
      parent: this.douban.screen,
      label: '请输入组id(i)',
      mouse: true,
      keys: true,
      left: 0,
      bottom: 0,
      shrink: true,
      width: "50%-1",
      height: 3,
      inputOnFocus: true,
      padding: {
        left: 1,
        right: 1
      },
      left: 0,
      top: 0,
      shrink: true,
      border: 'line',
      style: {
       
        border: {
          fg: 'white'
        },
        focus: {
          border: {
            fg: '#00BFFF'
          },
        },
        hover: {
        }
      }
    });
    this.panel.on('submit', () => {
      const groupId = this.panel.getValue()
      if(groupId) {
        this.douban.group.start(groupId)
      }
    });
    this.panel.focus()
   
  }
  
}