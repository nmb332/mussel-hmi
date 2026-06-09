# GitHub Pages 免费固定网址发布步骤

目标网址形式：

`https://你的GitHub用户名.github.io/mussel-hmi/`

本目录已经准备为静态网站目录，可直接发布到 GitHub Pages。

## 发布步骤

1. 登录 GitHub CLI：

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' auth login --hostname github.com --web --git-protocol https
```

2. 创建公开仓库：

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' repo create mussel-hmi --public --description "紫贻贝壳肉分离智能总控平台 HMI" --disable-issues --disable-wiki
```

3. 上传 HMI 目录内容到仓库，并启用 GitHub Pages。

如果本机安装了 Git，推荐进入 `E:\kile5\HMI` 后执行：

```powershell
git init
git branch -M main
git add .
git commit -m "Publish HMI site"
git remote add origin https://github.com/你的GitHub用户名/mussel-hmi.git
git push -u origin main
& 'C:\Program Files\GitHub CLI\gh.exe' api -X POST repos/你的GitHub用户名/mussel-hmi/pages -f source.branch=main -f source.path=/
```

4. 把 `robots.txt` 和 `sitemap.xml` 中的网址改为：

`https://你的GitHub用户名.github.io/mussel-hmi/`

5. 等待 GitHub Pages 构建完成，通常几分钟内生效。
