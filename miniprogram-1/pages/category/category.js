const app = getApp()

Page({
  data: {
    statusBarHeight: 0,
    categories: [], // 一级目录
    subCategories: [], // 二级目录
    showSub: false,
    selectedCategory: null,
    loading: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })
    this.loadCategories();
  },

  // 加载一级目录
  async loadCategories() {
    try {
      this.setData({ loading: true })
      const db = wx.cloud.database();
      const res = await db.collection('categories')
        .where({ parentId: db.command.or([null, '']) })
        .orderBy('sort', 'asc')
        .get();
      this.setData({ categories: res.data, loading: false, showSub: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  // 点击一级目录，加载二级目录
  async onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category, loading: true });
    const db = wx.cloud.database();
    const res = await db.collection('categories')
      .where({ parentId: db.command.or([category._id, String(category._id)]) })
      .orderBy('sort', 'asc')
      .get();
    console.log('查到的二级目录:', res.data);
    if (res.data.length > 0) {
      this.setData({ subCategories: res.data, showSub: true, loading: false });
    } else {
      // 没有二级目录，直接跳到文章列表
      wx.navigateTo({
        url: `/pages/article/article?categoryId=${category._id}&name=${encodeURIComponent(category.name)}`
      });
    }
  },

  // 点击二级目录，跳转到文章列表
  onSubCategoryTap(e) {
    const subCategory = e.currentTarget.dataset.category;
    wx.navigateTo({
      url: `/pages/article/article?categoryId=${subCategory._id}&name=${encodeURIComponent(subCategory.name)}`
    });
  },

  onPullDownRefresh() {
    this.loadCategories();
    wx.stopPullDownRefresh();
  }
}) 