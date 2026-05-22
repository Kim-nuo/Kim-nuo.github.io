# Kim 的个人介绍网站

这是一个面向新朋友的静态个人介绍网站，不是求职作品集。它包含首页、关于我、生活片段、兴趣清单和联系方式，适合部署到 GitHub Pages。

## 页面

- `index.html`：首页和快速介绍
- `about.html`：更完整的自我介绍
- `stories.html`：生活片段和经历故事
- `likes.html`：兴趣清单和聊天入口
- `connect.html`：公开联系方式

## 修改内容

先替换这些占位内容：

- `Kim`：你的名字或昵称
- `hello@example.com`：你的公开邮箱
- `github.com/yourname`：你的 GitHub 链接
- `assets/profile-mark.svg`：可以换成公开头像、生活照片或插画
- 每个页面里的故事、兴趣和个人介绍文案

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，例如 `about-me`。
2. 把这些文件推送到仓库的 `main` 分支。
3. 进入仓库的 `Settings` -> `Pages`。
4. Source 选择 `GitHub Actions`。
5. 推送后等待 Actions 完成，网站会发布到 GitHub Pages。

如果仓库名是 `about-me`，链接通常是：

```text
https://你的用户名.github.io/about-me/
```

如果仓库名是 `你的用户名.github.io`，链接通常是：

```text
https://你的用户名.github.io/
```

## 本地预览

双击 `preview.cmd`，保持打开的命令行窗口不要关闭，然后访问：

```text
http://localhost:4173/index.html
```
