[English](./README.md) | 简体中文

CKEditor 5 公式编辑器功能 &middot; [![npm version](https://img.shields.io/npm/v/@yayure/ckeditor5-mathlive.svg?style=flat)](https://www.npmjs.com/package/@yayure/ckeditor5-mathlive)
==========================

ckeditor5-mathlive是一款基于[mathlive](https://cortexjs.io/mathlive)为CKEditor 5设计的公式编辑器。你可以对基于LaTeX语法的公式进行插入、编辑和查看。同时该插件默认支持高达[800种LaTeX语法](https://cortexjs.io/mathlive/reference/commands)。

## 目录

- [功能](#功能)
- [演示](#演示)
- [图例](#图例)
- [安装和使用](#安装和使用)
  - [npm](#npm)
  - [CDN](#cdn)
- [配置](#配置)
- [贡献和翻译](#贡献和翻译)

## 功能

- LaTeX语法支持
- 对公式的可视化编辑
- LaTeX文本的解析配置
- LaTeX公式的文本输出配置
- 自定义可视化公式编辑器面板

## 演示

[Classic editor with CDN](https://jsfiddle.net/Yayure/ymph7stk/)

## 图例

![图例 1](/screenshots/1.zh-cn.png?raw=true "图例 1")

## 安装和使用

### npm

在你的项目或CKEditor 5中安装和使用基础依赖[mathlive](https://www.npmjs.com/package/mathlive) :

```bash
npm install --save mathlive
```

```js
import 'mathlive/dist/mathlive-static.css';
import 'mathlive';
```

在你的项目或CKEditor 5中安装和使用该插件 :

```bash
npm install --save @yayure/ckeditor5-mathlive
```

```js
import { Mathlive, MathlivePanelview } from '@yayure/ckeditor5-mathlive';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Mathlive, /** ... 其他插件 */ ],
        toolbar: {
            items: [ 'mathlive', /** ... 其他工具栏按钮 */ ]
        },
        mathlive: {
            renderMathPanel( element ) {
                let panelView = new MathlivePanelview();
                panelView.mount( element );
                return () => {
                    panelView.destroy();
                    panelView = null;
                }
            }
        },
        // ... 其他配置项
    } )
```

### CDN

添加基础依赖和该插件 :

```html
<head>
    <!-- ... 其他CKEditor资源 -->

    <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
    <script defer src="https://unpkg.com/mathlive"></script>
    <script src="https://unpkg.com/@yayure/ckeditor5-mathlive/build/mathlive.js"></script>
</head>
```

使用该插件 :

```js
CKEditor5.editorClassic.ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ CKEditor5.mathlive.Mathlive, /** ... 其他插件 */ ],
        toolbar: [ 'mathlive', /** ... 其他工具栏按钮 */ ],
        mathlive: {
            renderMathPanel( element ) {
                let panelView = new CKEditor5.mathlive.MathlivePanelview();
                panelView.mount( element );
                return () => {
                    panelView.destroy();
                    panelView = null;
                }
            }
        },
        // ... 其他配置项
    } )
```

## 配置

### 插件默认配置

```js
{
    // ...
    mathlive: {
        /**
         * 挂载公式面板。
         */
        renderMathPanel: undefined,
        /**
         * 面板关闭时是否销毁。
         */
        mathPanelDestroyOnClose: false,
        /**
         * 选中CKEditor编辑器中的公式时是否打开面板。
         */
        openPanelWhenEquationSelected: false,
        /**
         * 将含该类名的元素转换为可视化公式展示。
         * 如: <span class="tex2jax_process">\( \sqrt{\frac{a}{b}} \)</span>
         */
        processClass: 'tex2jax_process',
        /**
         * 将属性type为该值的script元素转换为可视化公式展示。
         * 如: <script type="math/tex">\sqrt{\frac{a}{b}}</script>
         */
        processScriptType: 'math/tex',
        /**
         * 定义可视化公式在CKEditor中输出的html数据。
         * 如: { type: 'script', attributes: { type: 'math/tex' } } => <script type="math/tex">\sqrt{\frac{a}{b}}</script>
         * { type: 'span', attributes: { class: 'math-tex' } } => <span class="math-tex">\sqrt{\frac{a}{b}}</span>
         */
        output: {
            type: 'script',
            attributes: {
               type: 'math/tex'
            }
        }
    }
    // ...
}
```

## 贡献和翻译
欢迎贡献、改进和修复错误。开发文档详见[DEVELOPMENT.md](./DEVELOPMENT.md)。

您可以在以下文件夹和文件进行翻译。

```
├─ lang
├─ ├─ translations
│  └─ contexts.json
```
