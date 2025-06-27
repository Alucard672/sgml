# 游戏攻略小程序

一个基于微信小程序和云开发的游戏攻略网站系统，包含小程序前端和后台管理系统。

## 功能特性

### 小程序前端
- 🏠 **首页**：轮播图展示 + 固定分类（公告、推荐、攻略）+ 文章列表
- 📂 **分类页**：展示所有分类，支持自定义分类
- 📖 **文章详情**：富文本内容展示，支持图片、代码等
- 🎨 **极简设计**：扁平化图标，现代化UI设计

### 后台管理系统
- 📊 **仪表盘**：数据统计概览
- 🖼️ **轮播图管理**：添加、编辑、删除轮播图
- 📁 **分类管理**：创建、编辑、删除文章分类
- 📝 **文章管理**：文章列表、编辑、删除
- ✍️ **发布文章**：富文本编辑器，支持图片上传

### 技术特性
- ☁️ **微信云开发**：云函数 + 云数据库 + 云存储
- 📱 **小程序原生开发**：高性能，原生体验
- 🎯 **Vue.js后台**：现代化管理界面
- 📄 **富文本支持**：文章内容支持HTML格式

## 项目结构

```
WeChatProjects/
├── miniprogram-1/          # 小程序前端
│   ├── pages/              # 页面文件
│   │   ├── index/          # 首页
│   │   ├── category/       # 分类页
│   │   └── article/        # 文章详情页
│   ├── components/         # 组件
│   ├── app.js             # 小程序入口
│   ├── app.json           # 小程序配置
│   └── app.wxss           # 全局样式
├── cloudfunctions/         # 云函数
│   ├── getBanners/        # 获取轮播图
│   ├── getArticles/       # 获取文章
│   └── getCategories/     # 获取分类
├── admin/                 # 后台管理系统
│   ├── index.html         # 后台入口
│   ├── css/               # 样式文件
│   └── js/                # JavaScript文件
└── database/              # 数据库相关
    └── init.js            # 数据库初始化脚本
```

## 数据库设计

### banners（轮播图）
```javascript
{
  _id: "轮播图ID",
  title: "轮播图标题",
  imageUrl: "图片地址",
  linkType: "链接类型", // none, article, url
  linkUrl: "链接地址",
  sort: 1, // 排序
  status: "active", // active, inactive
  createTime: "创建时间"
}
```

### categories（分类）
```javascript
{
  _id: "分类ID",
  name: "分类名称",
  icon: "图标",
  description: "描述",
  sort: 1, // 排序
  status: "active", // active, inactive
  createTime: "创建时间"
}
```

### articles（文章）
```javascript
{
  _id: "文章ID",
  title: "文章标题",
  summary: "文章摘要",
  content: "文章内容(HTML)",
  categoryId: "分类ID",
  coverImage: "封面图片",
  status: "published", // published, draft
  isRecommend: true, // 是否推荐
  views: 0, // 阅读量
  sort: 1, // 排序
  createTime: "创建时间"
}
```

## 安装和部署

### 1. 小程序端

1. 在微信开发者工具中导入项目
2. 开通云开发功能
3. 修改 `app.js` 中的云环境ID
4. 上传并部署云函数
5. 运行数据库初始化脚本

### 2. 后台管理系统

1. 将 `admin` 目录部署到微信静态网站托管
2. 配置云函数调用权限
3. 访问后台管理界面

### 3. 数据库初始化

在微信开发者工具的控制台中运行：

```javascript
// 引入初始化脚本
const { initDatabase } = require('./database/init.js')

// 执行初始化
initDatabase()
```

## 使用说明

### 小程序端
1. 首页展示轮播图和固定分类
2. 点击分类查看对应文章列表
3. 点击文章进入详情页
4. 分类页面展示所有分类

### 后台管理
1. 轮播图管理：添加、编辑、删除首页轮播图
2. 分类管理：创建自定义分类
3. 文章管理：查看、编辑、删除文章
4. 发布文章：使用富文本编辑器创建文章

## 开发说明

### 固定分类
系统预设了三个固定分类：
- `announcement`：公告
- `recommend`：推荐  
- `guide`：攻略

这些分类在首页固定显示，文章可以分配到这些分类中。

### 自定义分类
后台可以创建自定义分类，支持：
- 分类名称
- 图标（emoji或文字）
- 描述
- 排序权重

### 富文本编辑
文章内容支持HTML格式，包括：
- 标题（h1-h6）
- 段落
- 图片
- 列表
- 引用
- 代码块

## 注意事项

1. 需要在微信开发者工具中配置云开发环境
2. 云函数需要上传并部署
3. 数据库权限需要正确配置
4. 图片上传需要配置云存储权限

## 更新日志

### v1.0.0
- 初始版本发布
- 基础功能实现
- 小程序前端和后台管理系统

## 许可证

MIT License 