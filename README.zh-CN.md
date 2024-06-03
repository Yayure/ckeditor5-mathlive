[English](./README.md) | 简体中文

CKEditor 5 公式编辑器功能 &middot; [![npm version](https://img.shields.io/npm/v/@yayure/ckeditor5-mathlive.svg?style=flat)](https://www.npmjs.com/package/@yayure/ckeditor5-mathlive)
==========================

ckeditor5-mathlive是一款基于[mathlive](https://cortexjs.io/mathlive)为CKEditor 5设计的公式编辑器。你可以对基于LaTex语法的公式进行插入、编辑和查看。同时该插件默认支持高达[800种LaTex语法](https://cortexjs.io/mathlive/reference/commands)。

## 目录

- [功能](#功能)
- [图例](#图例)
- [安装](#安装)
  - [npm or yarn](#npm-or-yarn)
- [配置](#配置)
- [贡献和翻译](#贡献和翻译)

## 功能

- LaTex语法支持
- 对公式的可视化编辑
- LaTex文本的解析配置
- LaTex公式的文本输出配置
- 自定义可视化公式编辑器面板

## 图例

![图例 1](/screenshots/1.zh-cn.png?raw=true "图例 1")

## 安装

### npm or yarn

使用npm或yarn安装相关依赖包

```bash
npm install --save mathlive @yayure/ckeditor5-mathlive
```

```bash
yarn add mathlive @yayure/ckeditor5-mathlive
```

添加到CKEditor 5

```js
import 'mathlive/static.css';
import 'mathlive';
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
    } );
```

## 配置

### 插件默认配置

```js
{
    // ...
    mathlive: {
        // 挂载公式面板。
        renderMathPanel: undefined,
        // 面板关闭时是否销毁。
        mathPanelDestroyOnClose: false,
        // 选中CKEditor编辑器中的公式时是否打开面板。
        openPanelWhenEquationSelected: false,
        // 将含该类名的元素转换为可视化公式展示。如: <span class="tex2jax_process">\( \sqrt{\frac{a}{b}} \)</span>
        processClass: 'tex2jax_process',
        // 将属性type为该值的script元素转换为可视化公式展示。如: <script type="math/tex">\sqrt{\frac{a}{b}}</script>
        processScriptType: 'math/tex',
        // 定义可视化公式在CKEditor中输出的html数据。如: { type: 'script', attributes: { type: 'math/tex' } } => <script type="math/tex">\sqrt{\frac{a}{b}}</script>
        output: {
            type: 'script',
            attributes: 'math/tex'
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
