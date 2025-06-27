const app = getApp()

// 将 HTML 字符串转为纯文本
function htmlToText(html) {
  if (!html) return '';
  // 去除标签，保留换行
  return html
    .replace(/<\/?(p|div|br|li|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// 提取 summary 纯文本
function extractTextFromSummary(summary) {
  if (typeof summary === 'string') return htmlToText(summary);
  if (Array.isArray(summary)) {
    return summary.map(extractTextFromSummary).join('');
  }
  if (summary && typeof summary === 'object') {
    if (summary.text) return summary.text;
    if (summary.children) return extractTextFromSummary(summary.children);
  }
  return '';
}

Page({
  data: {
    statusBarHeight: 0,
    articles: [],
    categoryName: '',
    loading: false,
    error: null
  },

  onLoad(options) {
    console.log('onLoad options:', options);
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })
    if (options.categoryId) {
      const categoryName = options.name ? decodeURIComponent(options.name) : '未命名分类';
      this.setData({ categoryId: options.categoryId, categoryName });
      console.log('onLoad set categoryId:', options.categoryId, 'categoryName:', categoryName);
      this.loadArticlesByCategory(options.categoryId, categoryName);
    } else {
      this.setData({ error: '缺少参数' })
      console.log('onLoad error: 缺少参数');
    }
  },

  // 加载分类下文章列表
  async loadArticlesByCategory(categoryId, categoryName) {
    try {
      this.setData({ loading: true, error: null, articles: [], categoryName: categoryName || '' })
      const db = wx.cloud.database()
      const result = await db.collection('articles')
        .where({
          status: 'published',
          categoryId: categoryId
        })
        .orderBy('sort', 'asc')
        .orderBy('createTime', 'desc')
        .limit(20)
        .get()
      const articles = result.data.map(item => ({
        ...item,
        summary: extractTextFromSummary(item.summary),
        createTime: this.formatDate(item.createTime)
      }))
      this.setData({ articles })
    } catch (error) {
      this.setData({ error: '加载失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },

  // 点击文章卡片
  onArticleTap(e) {
    const article = e.currentTarget.dataset.article;
    if (article && article._id) {
      wx.navigateTo({
        url: `/pages/article-detail/article-detail?id=${article._id}`
      });
    } else {
      wx.showToast({
        title: '无法获取文章详情',
        icon: 'none'
      });
    }
  },

  // 重试加载
  retryLoad() {
    if (this.data.categoryId) {
      this.loadArticlesByCategory(this.data.categoryId, this.data.categoryName)
    }
  }
}) 