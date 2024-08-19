English | [简体中文](./README.zh-CN.md)

CKEditor 5 mathematical formula editor feature &middot; [![npm version](https://img.shields.io/npm/v/@yayure/ckeditor5-mathlive.svg?style=flat)](https://www.npmjs.com/package/@yayure/ckeditor5-mathlive)
==========================
ckeditor5-mathlive is a formula editor designed for CKEditor 5 based on [mathlive](https://cortexjs.io/mathlive). You can insert, edit, and view formulas based on LaTeX syntax. Meanwhile, the plugin supports up to [800 LaTeX syntaxes](https://cortexjs.io/mathlive/reference/commands) by default.

## Table of contents

- [Features](#features)
- [Demos](#demos)
- [Screenshots](#screenshots)
- [Installation & Usage](#installation--usage)
  - [npm](#npm)
  - [CDN](#cdn)
- [Configuration](#configuration)
- [Contributions & Translations](#contributions--translations)

## Features

- LaTeX syntax support
- Visualization editing of formulas
- Parsing configuration for LaTeX
- LaTeX Output Configuration
- Customizable visual formula editor panel

## Demos

[Classic editor with CDN](https://jsfiddle.net/Yayure/ymph7stk/)

## Screenshots

![Screenshot 1](/screenshots/1.png?raw=true "Screenshot 1")

## Installation & Usage

### npm

Install and use the base dependency [mathlive](https://www.npmjs.com/package/mathlive) in your project or CKEditor 5 :

```bash
npm install --save mathlive
```

```js
import 'mathlive/dist/mathlive-static.css';
import 'mathlive';
```

Install and use the plugin in your project or CKEditor 5 :

```bash
npm install --save @yayure/ckeditor5-mathlive
```

```js
import { Mathlive, MathlivePanelview } from '@yayure/ckeditor5-mathlive';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Mathlive, /** ... Other plugins. */ ],
        toolbar: {
            items: [ 'mathlive', /** ... Other toolbar buttons. */ ]
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
        // ... Other configuration options.
    } )
```

### CDN

Add basic dependencies and the plugin :

```html
<head>
    <!-- ... Other CKEditor Resources. -->

    <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
    <script defer src="https://unpkg.com/mathlive"></script>
    <script src="https://unpkg.com/@yayure/ckeditor5-mathlive/build/mathlive.js"></script>
</head>
```

Using the plugin :

```js
CKEditor5.editorClassic.ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ CKEditor5.mathlive.Mathlive, /** ... other plugins. */ ],
        toolbar: [ 'mathlive', /** ... Other toolbar buttons. */ ],
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
        // ... Other configuration options.
    } )
```

## Configuration

### Default Plugin Configuration

```js
{
    // ...
    mathlive: {
        /**
         * Mount the formula panel.
         */
        renderMathPanel: undefined,
        /**
         * Whether to destroy the math formula panel when it is closed.
         */
        mathPanelDestroyOnClose: false,
        /**
         * Whether to open the panel when a equation is selected.
         */
        openPanelWhenEquationSelected: false,
        /**
         * Convert elements containing this class name into visual formula displays.
         * e.g. <span class="tex2jax_process">\sqrt{\frac{a}{b}}</span>
         */
        processClass: 'tex2jax_process',
        /**
         * Convert the <script> with attribute type set to this value into visual formula displays.
         * e.g. <script type="math/tex">\sqrt{\frac{a}{b}}</script>
         */
        processScriptType: 'math/tex',
        /**
         * Define the HTML data that the visualization formula outputs in CKEditor.
         * e.g. { type: 'script', attributes: { type: 'math/tex' } } => <script type="math/tex">\sqrt{\frac{a}{b}}</script>
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

## Contributions & Translations
Contributions, improvements and bug fixes are welcome. Development documentation can be found here [DEVELOPMENT.md](./DEVELOPMENT.md)。

You can translate the following folders and files

```
├─ lang
├─ ├─ translations
│  └─ contexts.json
```
