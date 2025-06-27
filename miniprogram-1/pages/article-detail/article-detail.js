const app = getApp()

Page({
  data: {
    article: null,
    loading: false,
    error: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadArticle(options.id);
    } else {
      this.setData({ error: '缺少文章ID' });
    }
  },

  async loadArticle(id) {
    try {
      this.setData({ loading: true, error: null });
      const db = wx.cloud.database();
      const res = await db.collection('articles').doc(id).get();
      this.setData({ article: res.data });

      // 阅读数自增 1，带 await 和异常捕获
      try {
        await db.collection('articles').doc(id).update({
          data: {
            views: db.command.inc(1)
          }
        });
      } catch (e) {
        console.error('阅读数自增失败', e);
      }
    } catch (e) {
      this.setData({ error: '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  }
}); 