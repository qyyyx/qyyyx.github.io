# 数学交互课件库

一个统一入口的数学交互课件导航站，托管在 GitHub Pages，供学生在浏览器中直接打开学习。

线上访问：<https://qyyyx.github.io/>

## 目录结构

```
.
├── index.html          # 导航首页（搜索 + 分类 + 卡片，零依赖自包含）
└── courseware/         # 各课件单文件 HTML（每个都可独立打开）
```

所有课件均为**自包含单文件 HTML**（无外部 CDN、无图片/JS/CSS 依赖），可离线打开。

## 课件分类

| 主题 | 课件 |
| --- | --- |
| 几何与图形 | 圆柱与圆锥、燕尾模型、鸟头模型、风筝与蝴蝶模型 |
| 代数与函数 | 二次函数、正反比例图像、最值原理、运动图像（S-T/V-T 图） |
| 数论与组合 | 费马小定理、关灯游戏、多格骨牌铺砖、骑士巡游问题 |
| 应用问题 | 经济问题 |

## 新增一个课件

1. 把课件的单文件 HTML 放进 `courseware/`，文件名用英文小写短横线（如 `new-topic.html`）。
2. 打开 `index.html`，在 `COURSEWARE` 数组里加一条：

   ```js
   {title:"课件中文名", cat:"geo", file:"new-topic.html",
    desc:"一句话简介。", tags:["关键词1","关键词2"]},
   ```

   `cat` 取值：`geo`（几何）/ `alg`（代数）/ `num`（数论）/ `app`（应用）。
3. 提交并推送，GitHub Pages 自动更新。

## 部署

仓库名为 `qyyyx.github.io`（用户主页仓库），GitHub Pages 默认从 `main` 分支根目录自动发布，无需额外配置。

```bash
git add .
git commit -m "更新课件"
git push
```
