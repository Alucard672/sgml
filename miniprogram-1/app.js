// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-3gczd9wwc26ab81f', // 请替换为你的云开发环境ID
        traceUser: true,
      })
    }

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
  },

  globalData: {
    systemInfo: {},
    statusBarHeight: 0,
    // fixedCategories: [
    //   { id: 'announcement', name: '公告', icon: '📢' },
    //   { id: 'recommend', name: '推荐', icon: '⭐' },
    //   { id: 'guide', name: '攻略', icon: '📖' }
    // ]
    fixedCategories: []
  }
})
