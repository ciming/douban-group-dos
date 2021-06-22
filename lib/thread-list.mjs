import axios from 'axios'
import ScrollableList from 'term-list-scrollable'
export default class ThreadList {
  constructor(list) {
    this.renderlist = new ScrollableList({
      marker: '',
      markerLength: 2,
      viewportSize: 5
    });
    list.header('Bookmarks');
    threadList.forEach(item => {
      list.add(item.url, item.title)
    });
    list.footer('press RETURN to open');
    list.start();
  }
}