# 数学交互课件库

一个统一入口的数学交互课件导航站，托管在 GitHub Pages，供学生在浏览器中直接打开学习。

线上访问：<https://qyyyx.github.io/>

## 目录结构

```
.
├── index.html          # 导航首页（搜索 + 分类 + 卡片，零依赖自包含）
├── favicon.svg         # 站点图标
├── assets/
│   ├── og-cover.png    # 分享卡片封面（微信/群分享预览图）
│   └── thumbs/         # 课件缩略图（可选，文件名同 slug）
└── courseware/         # 各课件单文件 HTML（每个都可独立打开）
    └── vendor/         # 少数课件本地化的第三方库（MathJax/three.js/Tailwind/font-awesome）
```

课件均**自包含、可离线**：原生的不依赖任何外部资源；少数用到第三方库的，已把库下载到 `courseware/vendor/` 本地托管（不再走外部 CDN），保证国内秒开。

## 课件分类

| 主题 | 课件 |
| --- | --- |
| 几何与图形 | 圆柱与圆锥、燕尾模型、鸟头模型、风筝与蝴蝶模型、立方体打洞、等高模型 |
| 代数与函数 | 二次函数、正反比例图像、最值原理、运动图像（S-T/V-T 图） |
| 数论与组合 | 费马小定理、关灯游戏、多格骨牌铺砖、骑士巡游问题、完全平方数 |
| 应用问题 | 经济问题 |
| 趣味与思维 | 工作记忆训练游戏 |

## 新增一个课件

1. 把课件的单文件 HTML 放进 `courseware/`，文件名用英文小写短横线（如 `new-topic.html`）。
2. 打开 `index.html`，在 `COURSEWARE` 数组里加一条：

   ```js
   {title:"课件中文名", cat:"geo", file:"new-topic.html",
    desc:"一句话简介。", tags:["关键词1","关键词2"],
    level:"五～六年级", diff:2, isNew:true, thumb:"assets/thumbs/new-topic.png"},
   ```

   字段说明：
   - `cat`（必填）：`geo` 几何 / `alg` 代数 / `num` 数论 / `app` 应用 / `fun` 趣味与思维。
   - `level`（可选）：适合年级，显示为小标签。
   - `diff`（可选）：难度 1–3，显示为 ●●○。
   - `isNew`（可选）：`true` 时卡片右上角显示红色「NEW」角标。
   - `thumb`（可选）：缩略图路径；不填则用纯文字卡片。
3. 提交并推送，GitHub Pages 自动更新。

> 缩略图生成（可选）：用本机 Chrome 无头模式截图，例如
> `chrome --headless=new --screenshot="assets/thumbs/new-topic.png" --window-size=900,563 "file:///<绝对路径>/courseware/new-topic.html"`。
> 注意 `--screenshot` 要用**绝对路径**。课件若开场是文字导览页，建议手动选取更具代表性的画面。

## 部署

仓库名为 `qyyyx.github.io`（用户主页仓库），GitHub Pages 默认从 `main` 分支根目录自动发布，无需额外配置。

```bash
git add .
git commit -m "更新课件"
git push
```
