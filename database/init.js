// 数据库初始化脚本
// 需要在微信开发者工具的云开发控制台运行

const db = wx.cloud.database()

async function initDatabase() {
  try {
    // 创建集合（如果不存在）
    await db.createCollection('banners').catch(()=>{})
    await db.createCollection('categories').catch(()=>{})
    await db.createCollection('articles').catch(()=>{})

    // 插入默认轮播图
    const banners = [
      {
        title: '欢迎来到游戏攻略',
        imageUrl: 'https://via.placeholder.com/750x400/007AFF/FFFFFF?text=游戏攻略',
        linkType: 'none',
        linkUrl: '',
        sort: 1,
        status: 'active',
        createTime: new Date()
      },
      {
        title: '最新攻略发布',
        imageUrl: 'https://via.placeholder.com/750x400/28A745/FFFFFF?text=最新攻略',
        linkType: 'none',
        linkUrl: '',
        sort: 2,
        status: 'active',
        createTime: new Date()
      }
    ]
    for (const banner of banners) {
      await db.collection('banners').add({ data: banner })
    }

    // 插入默认分类
    const categories = [
      {
        name: '公告',
        icon: '📢',
        description: '系统公告',
        sort: 1,
        status: 'active',
        createTime: new Date(),
        showOnHome: true
      },
      {
        name: '推荐',
        icon: '⭐',
        description: '热门推荐',
        sort: 2,
        status: 'active',
        createTime: new Date(),
        showOnHome: true
      },
      {
        name: '攻略',
        icon: '📖',
        description: '游戏攻略',
        sort: 3,
        status: 'active',
        createTime: new Date(),
        showOnHome: true
      }
    ]
    for (const category of categories) {
      await db.collection('categories').add({ data: category })
    }

    // 插入示例文章
    const articles = [
      {
        title: '新手入门指南',
        summary: '这是一篇新手入门指南，帮助新手快速上手游戏',
        content: '<h1>新手入门指南</h1><p>欢迎来到游戏世界！本指南将帮助你快速上手游戏。</p>',
        categoryId: '', // 可手动补充
        coverImage: 'https://via.placeholder.com/400x300/007AFF/FFFFFF?text=新手指南',
        status: 'published',
        isRecommend: true,
        views: 0,
        sort: 1,
        createTime: new Date()
      },
      {
        title: '高级技巧分享',
        summary: '分享一些高级游戏技巧，提升你的游戏水平',
        content: '<h1>高级技巧分享</h1><p>掌握这些技巧，让你的游戏水平更上一层楼。</p>',
        categoryId: '', // 可手动补充
        coverImage: 'https://via.placeholder.com/400x300/28A745/FFFFFF?text=高级技巧',
        status: 'published',
        isRecommend: true,
        views: 0,
        sort: 2,
        createTime: new Date()
      }
    ]
    for (const article of articles) {
      await db.collection('articles').add({ data: article })
    }

    console.log('数据库初始化完成！')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }
}

initDatabase()

// 导出函数供外部调用
module.exports = {
  initDatabase
} 