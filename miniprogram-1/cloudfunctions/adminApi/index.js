// 云函数入口文件
const cloud = require('wx-server-sdk')
console.log('HELLO CLOUD');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 工具函数
const success = (data) => ({ code: 0, data })
const fail = (msg) => ({ code: 1, msg })

exports.main = async (event, context) => {
  let action, data;
  // 兼容 HTTP 触发器和普通调用
  if (event.body) {
    let body = event.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return fail('body 解析失败');
      }
    }
    action = body.action;
    data = body.data;
  } else {
    action = event.action;
    data = event.data;
  }
  try {
    // 文章相关
    if (action === 'getArticles') {
      const { categoryId } = data || {};
      let query = {};
      if (categoryId) query.categoryId = categoryId;
      const res = await db.collection('articles').where(query).orderBy('sort', 'asc').get();
      return success(res.data);
    }
    if (action === 'addArticle') {
      if (data && data._id) delete data._id; // 防止主键冲突
      await db.collection('articles').add({ data })
      return success('ok')
    }
    if (action === 'deleteArticle') {
      await db.collection('articles').doc(data.id).remove()
      return success('ok')
    }
    if (action === 'updateArticle') {
      const { id, ...rest } = data
      // 去除只读字段
      delete rest._id; delete rest._openid; delete rest.createTime;
      console.log('updateArticle', { id, data: rest });
      await db.collection('articles').doc(id).update({ data: rest })
      return success('ok')
    }
    // 分类相关
    if (action === 'getCategories') {
      const res = await db.collection('categories').orderBy('sort', 'asc').get();
      console.log('categories from db:', JSON.stringify(res.data));
      return success(res.data);
    }
    if (action === 'addCategory') {
      await db.collection('categories').add({ data })
      return success('ok')
    }
    if (action === 'deleteCategory') {
      await db.collection('categories').doc(data.id).remove()
      return success('ok')
    }
    if (action === 'updateCategory') {
      console.log('updateCategory event', JSON.stringify(event));
      let { id, data: updateData } = data;
      if (!updateData) { updateData = { ...data }; delete updateData.id; }
      // 深度去除_id
      function deepRemoveId(obj) {
        if (Array.isArray(obj)) return obj.map(deepRemoveId);
        if (obj && typeof obj === 'object') {
          const o = {};
          for (const k in obj) {
            if (k === '_id' || k === '_openid' || k === 'createTime') continue;
            o[k] = deepRemoveId(obj[k]);
          }
          return o;
        }
        return obj;
      }
      updateData = deepRemoveId(updateData);
      console.log('updateCategory id', id);
      console.log('updateCategory updateData', JSON.stringify(updateData));
      await db.collection('categories').doc(id).update({ data: updateData })
      return success('ok')
    }
    // 轮播图相关
    if (action === 'getBanners') {
      const res = await db.collection('banners').orderBy('sort', 'asc').get()
      return success(res.data)
    }
    if (action === 'addBanner') {
      await db.collection('banners').add({ data })
      return success('ok')
    }
    if (action === 'deleteBanner') {
      await db.collection('banners').doc(data.id).remove()
      return success('ok')
    }
    if (action === 'updateBanner') {
      const { id, ...rest } = data
      delete rest._id; delete rest._openid; delete rest.createTime;
      console.log('updateBanner', { id, data: rest });
      await db.collection('banners').doc(id).update({ data: rest })
      return success('ok')
    }
    // 登录相关
    if (action === 'login') {
      const { username, password } = data;
      if (!username || !password) return fail('请输入账号和密码');
      const res = await db.collection('admins').where({ username, password }).get();
      if (res.data && res.data.length > 0) {
        return success({ token: 'mock-token', user: res.data[0] });
      } else {
        return fail('账号或密码错误');
      }
    }
    return fail('未知操作')
  } catch (e) {
    return fail(e.message)
  }
} 