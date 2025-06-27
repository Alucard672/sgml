// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 支持通过 event 传递 where 条件，否则返回所有分类
    const where = event && event.where ? event.where : {};
    const result = await db.collection('categories')
      .where(where)
      .orderBy('sort', 'asc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 