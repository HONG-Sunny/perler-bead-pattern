# 拼豆图纸转换

微信小程序：把图片转换成拼豆（Perler beads / Hama beads）图纸。

## 目标功能

- 上传或拍摄一张图片
- 设定图纸尺寸（横向 × 纵向豆子数）
- 按像素化 + 色板匹配，生成可照着拼的图纸
- 输出配色表与各色豆子数量统计
- 导出 / 保存图纸

## 目录结构

```
├─ app.js / app.json / app.wxss   小程序全局配置
├─ project.config.json            开发者工具项目配置
├─ sitemap.json                   索引配置
├─ pages/
│  ├─ index/                      首页
│  └─ logs/                       日志页
└─ utils/                         工具函数
```

## 开发

1. 用微信开发者工具「导入项目」选择本仓库目录
2. 在 `project.config.json` 中填入自己的 AppID
3. 编译预览

> `project.private.config.json` 为本地私有配置，已在 `.gitignore` 中忽略。

## 状态

开发中。
