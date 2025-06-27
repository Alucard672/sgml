// index.js
const app = getApp()

Page({
  data: {
    statusBarHeight: 0,
    banners: [],
    fixedCategories: [],
    currentCategory: null,
    articles: [],
    loading: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })
    this.loadBanners()
    this.loadHomeCategories()
  },

  onShow() {
    // 首页下方文章列表始终只显示公告分类
    this.loadBanners();
    this.loadHomeCategories();
  },

  // 加载轮播图
  async loadBanners() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('banners')
        .where({
          status: 'active'
        })
        .orderBy('sort', 'asc')
        .limit(5)
        .get()
      
      this.setData({
        banners: result.data
      })
    } catch (error) {
      console.error('加载轮播图失败:', error)
    }
  },

  // 根据分类加载文章
  async loadArticlesByCategory(categoryId) {
    try {
      this.setData({ loading: true })
      const db = wx.cloud.database()
      const result = await db.collection('articles')
        .where({
          status: 'published',
          categoryId: categoryId
        })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get()
      
      this.setData({
        articles: result.data.map(item => ({
          ...item,
          createTime: this.formatDate(item.createTime)
        }))
      })
    } catch (error) {
      console.error('加载分类文章失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.loadArticlesByCategory(category._id);
  },

  // 点击轮播图
  onBannerTap(e) {
    const banner = e.currentTarget.dataset.item
    if (banner.linkType === 'article' && banner.articleId) {
      wx.navigateTo({
        url: `/pages/article/article?id=${banner.articleId}`
      })
    } else if (banner.linkType === 'url' && banner.linkUrl) {
      // 可以打开外部链接或内部页面
      wx.navigateTo({
        url: banner.linkUrl
      })
    }
  },

  // 点击文章
  onArticleTap(e) {
    const article = e.currentTarget.dataset.article;
    wx.navigateTo({
      url: `/pages/article/article?id=${article._id}`
    });
  },

  // 点击更多
  onMoreTap() {
    if (this.data.currentCategory) {
      wx.switchTab({
        url: '/pages/category/category'
      })
    }
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    
    if (diff < 24 * 60 * 60 * 1000) {
      return '今天'
    } else if (diff < 48 * 60 * 60 * 1000) {
      return '昨天'
    } else {
      return `${d.getMonth() + 1}-${d.getDate()}`
    }
  },

  onPullDownRefresh() {
    this.loadBanners();
    this.loadHomeCategories();
    wx.stopPullDownRefresh();
  },

  // 加载首页分类
  async loadHomeCategories() {
    try {
      const db = wx.cloud.database()
      // 1. 加载所有首页展示分类
      const result = await db.collection('categories')
        .where({ status: 'active', showOnHome: true })
        .orderBy('sort', 'asc')
        .get()
      let categories = result.data;
      // 2. 默认显示公告分类
      let defaultCategory = categories.find(c => c.name === '公告') || categories[0];
      this.setData({
        fixedCategories: categories,
        currentCategory: defaultCategory || null
      });
      if (defaultCategory) {
        this.loadArticlesByCategory(defaultCategory._id);
      } else {
        this.setData({ articles: [] });
      }
    } catch (error) {
      console.error('加载首页分类失败:', error)
    }
  }
})
