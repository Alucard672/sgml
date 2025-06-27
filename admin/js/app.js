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
            this.initEditor();
        });
        // 前端登录校验，未登录跳转到登录页
        if (!localStorage.getItem('token')) {
            window.location.href = 'login.html';
        }
    },
    
    watch: {
        activeMenu(val, oldVal) {
            if (oldVal === 'publish' && this.editor && this.editor.destroy) {
                this.editor.destroy();
                this.editor = null;
            }
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
                this.$set(this, 'categories', Array.isArray(res) ? res : []);
                console.log('categories:', this.categories, Array.isArray(this.categories), this.categories.length);
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
                if (this.editor) {
                    this.editor.setData(this.articleForm.content || '');
                }
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
                isRecommend: false,
                views: 0
            };
            this.$nextTick(() => {
                if (this.editor) {
                    this.editor.setData('');
                }
            });
        },
        
        // 提交文章
        async submitArticle() {
            try {
                if (!this.articleForm.title || !this.articleForm.content) {
                    this.$message.error('请填写完整内容');
                    return;
                }
                if (!this.articleForm.views) {
                    this.articleForm.views = 0;
                }
                if (!this.articleForm.status) {
                    this.articleForm.status = 'published';
                }
                if (this.articleForm._id) {
                    // 编辑
                    const { _id, createTime, _openid, ...rest } = this.articleForm;
                    const safeData = this.deepRemoveId(rest);
                    await callCloud('updateArticle', { id: _id, data: safeData });
                    this.$message.success('文章编辑成功');
                } else {
                    // 新增
                    await callCloud('addArticle', this.articleForm);
                    this.$message.success('文章发布成功');
                }
                this.activeMenu = 'articles';
                this.loadArticles();
            } catch (e) {
                this.$message.error('发布失败');
                console.error('submitArticle error', e);
            }
        },
        
        // 退出登录
        logout() {
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 清除 token 并跳转到登录页
                localStorage.removeItem('token');
                window.location.href = 'login.html';
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
            if (this.editor) return; // 只初始化一次
            const ckeditorContainer = document.getElementById('ckeditor');
            if (ckeditorContainer) {
                ckeditorContainer.innerHTML = '';
            } else {
                console.error('未找到 #ckeditor 容器');
            }
            if (typeof CKEDITOR === 'undefined') {
                console.error('CKEDITOR 未加载');
                return;
            }
            CKEDITOR.ClassicEditor
                .create(document.querySelector('#ckeditor'), {
                    removePlugins: [
                        'RealTimeCollaborativeComments',
                        'RealTimeCollaborativeTrackChanges',
                        'RealTimeCollaborativeRevisionHistory',
                        'RealTimeCollaborativeUsers',
                        'PresenceList',
                        'Comments',
                        'TrackChanges',
                        'TrackChangesData',
                        'RevisionHistory',
                        'Pagination',
                        'WProofreader',
                        'MathType',
                        'SlashCommand',
                        'Template',
                        'DocumentOutline',
                        'FormatPainter',
                        'TableOfContents',
                        'PasteFromOfficeEnhanced'
                    ],
                    toolbar: {
                        items: [
                            'heading', '|',
                            'bold', 'italic', 'underline', 'strikethrough', '|',
                            'fontColor', 'fontBackgroundColor', '|',
                            'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                            'undo', 'redo'
                        ]
                    },
                    fontColor: {
                        colors: [
                            { color: '#000000', label: '黑色' },
                            { color: '#FF0000', label: '红色' },
                            { color: '#FFA500', label: '橙色' },
                            { color: '#008000', label: '绿色' },
                            { color: '#0000FF', label: '蓝色' },
                            { color: '#800080', label: '紫色' },
                            { color: '#808080', label: '灰色' },
                            { color: '#FFFFFF', label: '白色' }
                        ]
                    },
                    fontBackgroundColor: {
                        colors: [
                            { color: '#FFFF00', label: '黄色' },
                            { color: '#00FFFF', label: '青色' },
                            { color: '#FFC0CB', label: '粉色' },
                            { color: '#90EE90', label: '浅绿色' }
                        ]
                    }
                })
                .then(editor => {
                    this.editor = editor;
                    console.log('CKEditor 初始化成功', editor);
                    // 粘贴过滤：只保留常用正文和基础格式标签
                    editor.plugins.get('Clipboard').on('inputTransformation', (evt, data) => {
                        if (data.content) {
                            const allowedTags = [
                                'p', 'br', 'span', 'b', 'i', 'u', 'a', 'img',
                                'ul', 'ol', 'li', 'strong', 'em', 'blockquote',
                                'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
                            ];
                            // 递归过滤函数
                            function filterChildren(viewFragment) {
                                for (const child of Array.from(viewFragment.getChildren())) {
                                    if (child.is && !allowedTags.includes(child.name)) {
                                        viewFragment._remove(child);
                                    } else if (child.is && child.is('element')) {
                                        filterChildren(child);
                                    }
                                }
                            }
                            filterChildren(data.content);
                        }
                    });
                    // 回显内容
                    if (this.articleForm.content) {
                        editor.setData(this.articleForm.content);
                    }
                    // 内容变化监听
                    editor.model.document.on('change:data', () => {
                        this.articleForm.content = editor.getData();
                    });
                })
                .catch(error => {
                    console.error('CKEditor 初始化失败', error);
                });
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