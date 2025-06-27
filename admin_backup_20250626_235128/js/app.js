// 后台管理系统主逻辑
const CLOUD_API_URL = 'https://cloud1-3gczd9wwc26ab81f-1317506172.ap-shanghai.app.tcloudbase.com/adminApi'; // 替换为你的真实地址

function callCloud(action, data = {}) {
    return axios.post(CLOUD_API_URL, {
        action,
        data
    }).then(res => {
        console.log('callCloud', action, '返回:', res.data);
        if (res.data.code === 0) return res.data.data;
        throw new Error(res.data.msg || '云函数调用失败');
    });
}

new Vue({
    el: '#app',
    data: {
        activeMenu: 'dashboard',
        stats: {
            articleCount: 0,
            categoryCount: 0,
            bannerCount: 0
        },
        banners: [],
        categories: [],
        articles: [],
        articleForm: {
            title: '',
            categoryId: '',
            content: '',
            summary: '',
            coverImage: '',
            status: 'published',
            isRecommend: false
        },
        categoryDialogVisible: false,
        categoryForm: {
            name: '',
            icon: '',
            status: 'active',
            sort: 1,
            showOnHome: true
        },
        categoryDialogType: 'add',
        bannerDialogVisible: false,
        bannerForm: {
            title: '',
            imageUrl: '',
            linkType: '',
            linkUrl: '',
            status: 'active',
            sort: 1
        },
        bannerDialogType: 'add',
        editor: null
    },
    
    mounted() {
        this.loadStats();
        this.loadBanners();
        this.loadCategories();
        this.loadArticles();
        this.$nextTick(() => {
            if (this.activeMenu === 'publish') {
                this.initEditor();
            }
        });
    },
    
    watch: {
        activeMenu(val) {
            if (val === 'publish') {
                this.$nextTick(() => {
                    this.initEditor();
                });
            }
        }
    },
    
    methods: {
        // 菜单选择
        handleMenuSelect(key) {
            this.activeMenu = key;
        },
        
        // 加载统计数据
        async loadStats() {
            try {
                const articles = await callCloud('getArticles') || [];
                const categories = await callCloud('getCategories') || [];
                const banners = await callCloud('getBanners') || [];
                this.stats = {
                    articleCount: Array.isArray(articles) ? articles.length : 0,
                    categoryCount: Array.isArray(categories) ? categories.length : 0,
                    bannerCount: Array.isArray(banners) ? banners.length : 0
                };
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        },
        
        // 加载轮播图
        async loadBanners() {
            try {
                const res = await callCloud('getBanners');
                this.banners = Array.isArray(res) ? res : [];
            } catch (e) {
                this.banners = [];
            }
        },
        
        // 加载分类
        async loadCategories() {
            try {
                const res = await callCloud('getCategories');
                this.categories = Array.isArray(res) ? res : [];
                console.log('categories:', this.categories);
            } catch (e) {
                this.categories = [];
                console.log('categories 加载失败:', e);
            }
        },
        
        // 加载文章
        async loadArticles() {
            try {
                const res = await callCloud('getArticles');
                // 动态为每篇文章添加 categoryName
                this.articles = Array.isArray(res) ? res.map(article => {
                    const cat = this.categories.find(c => c._id === article.categoryId);
                    return { ...article, categoryName: cat ? cat.name : '' };
                }) : [];
            } catch (e) {
                this.articles = [];
            }
        },
        
        // 显示轮播图对话框
        showBannerDialog(type, banner = null) {
            this.bannerDialogType = type;
            if (type === 'add') {
                this.bannerForm = { title: '', imageUrl: '', linkType: '', linkUrl: '', status: 'active', sort: 1 };
            } else if (type === 'edit' && banner) {
                this.bannerForm = { ...banner };
            }
            this.bannerDialogVisible = true;
        },
        
        // 编辑轮播图
        editBanner(banner) {
            this.showBannerDialog('edit', banner);
        },
        
        // 删除轮播图
        async deleteBanner(banner) {
            try {
                await callCloud('deleteBanner', { id: banner._id });
                this.$message.success('删除成功');
                this.loadBanners();
            } catch (error) {
                this.$message.error('删除失败');
            }
        },
        
        // 显示分类对话框
        showCategoryDialog(type, category = null) {
            this.categoryDialogType = type;
            if (type === 'add') {
                this.categoryForm = { name: '', icon: '', status: 'active', sort: 1, showOnHome: true };
            } else if (type === 'edit' && category) {
                this.categoryForm = { ...category };
                if (typeof this.categoryForm.showOnHome === 'undefined') this.categoryForm.showOnHome = true;
            }
            this.categoryDialogVisible = true;
        },
        
        // 编辑分类
        editCategory(category) {
            this.showCategoryDialog('edit', category);
        },
        
        // 删除分类
        async deleteCategory(category) {
            try {
                await callCloud('deleteCategory', { id: category._id });
                this.$message.success('删除成功');
                this.loadCategories();
            } catch (error) {
                this.$message.error('删除失败');
            }
        },
        
        // 编辑文章
        editArticle(article) {
            this.activeMenu = 'publish';
            this.articleForm = { ...article };
            this.$nextTick(() => {
                this.initEditor();
            });
        },
        
        // 删除文章
        async deleteArticle(article) {
            try {
                await callCloud('deleteArticle', { id: article._id });
                this.$message.success('删除成功');
                this.loadArticles();
            } catch (error) {
                this.$message.error('删除失败');
            }
        },
        
        // 跳转到发布页面
        goToPublish() {
            this.activeMenu = 'publish';
            this.articleForm = {
                title: '',
                categoryId: '',
                content: '',
                summary: '',
                coverImage: '',
                status: 'published',
                isRecommend: false
            };
            this.$nextTick(() => {
                this.initEditor();
            });
        },
        
        // 提交文章
        async submitArticle() {
            try {
                if (!this.articleForm.title || !this.articleForm.categoryId || !this.articleForm.content) {
                    this.$message.error('请填写完整信息');
                    return;
                }
                if (this.articleForm._id) {
                    // 编辑
                    const { _id, createTime, _openid, ...rest } = this.articleForm;
                    await callCloud('updateArticle', { id: _id, ...rest });
                    this.$message.success('编辑成功');
                } else {
                    // 新增
                    await callCloud('addArticle', this.articleForm);
                    this.$message.success('发布成功');
                }
                this.loadArticles();
                this.activeMenu = 'articles';
            } catch (error) {
                this.$message.error('发布失败');
            }
        },
        
        // 退出登录
        logout() {
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 实现退出登录逻辑
                console.log('退出登录');
                this.$message.success('已退出登录');
            });
        },
        
        // 深度去除_id、_openid、createTime
        deepRemoveId(obj) {
            if (Array.isArray(obj)) return obj.map(this.deepRemoveId);
            if (obj && typeof obj === 'object') {
                const o = {};
                for (const k in obj) {
                    if (k === '_id' || k === '_openid' || k === 'createTime') continue;
                    o[k] = this.deepRemoveId(obj[k]);
                }
                return o;
            }
            return obj;
        },
        async submitCategory() {
            try {
                if (!this.categoryForm.name) {
                    this.$message.error('请填写分类名称');
                    return;
                }
                if (this.categoryDialogType === 'add') {
                    await callCloud('addCategory', this.categoryForm);
                    this.$message.success('分类添加成功');
                } else if (this.categoryDialogType === 'edit') {
                    const { _id, createTime, _openid, ...rest } = this.categoryForm;
                    const safeData = this.deepRemoveId(rest);
                    console.log('updateCategory params', { id: _id, data: safeData });
                    await callCloud('updateCategory', { id: _id, data: safeData });
                    this.$message.success('分类编辑成功');
                }
                this.categoryDialogVisible = false;
                this.loadCategories();
            } catch (e) {
                this.$message.error('分类操作失败');
                console.error('submitCategory error', e);
            }
        },
        
        async submitBanner() {
            try {
                if (!this.bannerForm.title || !this.bannerForm.imageUrl) {
                    this.$message.error('请填写完整信息');
                    return;
                }
                if (this.bannerDialogType === 'add') {
                    await callCloud('addBanner', this.bannerForm);
                    this.$message.success('添加成功');
                } else if (this.bannerDialogType === 'edit') {
                    // 只传可更新字段，去除_id、createTime、_openid等
                    const { _id, createTime, _openid, ...rest } = this.bannerForm;
                    await callCloud('updateBanner', { id: _id, ...rest });
                    this.$message.success('编辑成功');
                }
                this.bannerDialogVisible = false;
                this.loadBanners();
            } catch (e) {
                this.$message.error('操作失败');
                console.error('submitBanner error', e);
            }
        },
        
        initEditor() {
            console.log('开始初始化编辑器...');
            console.log('window.wangEditor:', window.wangEditor);
            
            if (!window.wangEditor) {
                console.error('wangEditor 未加载！');
                this.$message.error('富文本编辑器加载失败，请刷新页面重试');
                return;
            }
            
            // 销毁旧编辑器
            if (this.editor) {
                console.log('销毁旧编辑器');
                this.editor.destroy();
                this.editor = null;
            }
            
            // 检查DOM元素是否存在
            const toolbarEl = document.getElementById('editor-toolbar');
            const contentEl = document.getElementById('editor-content');
            
            if (!toolbarEl || !contentEl) {
                console.error('编辑器DOM元素不存在！');
                this.$message.error('编辑器DOM元素不存在');
                return;
            }
            
            console.log('DOM元素检查通过，开始创建编辑器');
            
            try {
                const E = window.wangEditor;
                this.editor = new E('#editor-toolbar', '#editor-content');
                window._lastEditorInstance = this.editor;
                
                // 基础配置
                this.editor.config.height = 400;
                this.editor.config.placeholder = '请输入文章内容，可支持段落、颜色、加粗、列表等富文本格式';
                
                // 粘贴相关配置 - 每次粘贴都覆盖内容，保证所有格式都能粘贴显示
                this.editor.config.customPaste = (editor, event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    let html = (event.clipboardData || window.clipboardData).getData('text/html');
                    let text = (event.clipboardData || window.clipboardData).getData('text');
                    let clean = '';
                    if (html) {
                        let doc = new DOMParser().parseFromString(html, 'text/html');
                        doc.querySelectorAll('style, font, span').forEach(el => el.remove());
                        doc.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
                        clean = '';
                        doc.body.childNodes.forEach(node => {
                            if (node.nodeType === 1 && (node.tagName === 'P' || node.tagName === 'BR')) {
                                clean += node.outerHTML;
                            } else if (node.nodeType === 3) {
                                clean += node.textContent;
                            }
                        });
                        if (!clean) clean = doc.body.textContent || '';
                    } else if (text) {
                        clean = text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
                        if (!clean.startsWith('<p>')) clean = '<p>' + clean;
                        if (!clean.endsWith('</p>')) clean = clean + '</p>';
                    }
                    // 直接覆盖内容，保证显示
                    editor.txt.html(clean);
                    return false;
                };
                this.editor.config.pasteFilterStyle = false;
                this.editor.config.pasteIgnoreImg = false;
                this.editor.config.pasteTextHandle = function(content) { return content; };
                
                // 工具栏配置
                this.editor.config.menus = [
                    'head',
                    'bold',
                    'italic',
                    'underline',
                    'strikeThrough',
                    'foreColor',
                    'backColor',
                    'link',
                    'list',
                    'justify',
                    'quote',
                    'image',
                    'table',
                    'code',
                    'undo',
                    'redo'
                ];
                
                // 内容变化监听
                this.editor.config.onchange = html => {
                    this.articleForm.content = html;
                };
                
                // 创建编辑器
                this.editor.create();
                console.log('编辑器创建成功');
                
                // 回显内容
                if (this.articleForm.content) {
                    this.editor.txt.html(this.articleForm.content);
                }
                
                this.$message.success('富文本编辑器初始化成功');
                
            } catch (error) {
                console.error('编辑器初始化失败:', error);
                this.$message.error('富文本编辑器初始化失败: ' + error.message);
            }
        }
    }
});

// 全局粘贴事件兜底
if (typeof window._editorPasteHandlerAdded === 'undefined') {
    document.addEventListener('paste', function(e) {
        if (window._lastEditorInstance && document.activeElement && document.activeElement.id === 'editor-content') {
            e.preventDefault();
            let text = (e.clipboardData || window.clipboardData).getData('text');
            let html = text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
            if (!html.startsWith('<p>')) html = '<p>' + html;
            if (!html.endsWith('</p>')) html = html + '</p>';
            window._lastEditorInstance.txt.html(html);
        }
    });
    window._editorPasteHandlerAdded = true;
} 