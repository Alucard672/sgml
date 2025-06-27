// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { categoryId, isRecommend, limit = 20, skip = 0 } = event
  
  try {
    let query = db.collection('articles').where({
      status: 'published'
    })
    
    if (categoryId) {
      query = query.where({
        categoryId: categoryId
      })
    }
    
    if (isRecommend) {
      query = query.where({
        isRecommend: true
      })
    }
    
    const result = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
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