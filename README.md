# WM大学视频爬虫
爬取并下载m3u8格式的视频，并转成mp4格式
## 安装
1. `git clone git@github.com:opteacher/wanmen-crawler.git`
2. `cd wanmen-crawler && npm install`
3. `touch config.json` 创建[配置文件](#配置)
3. `node app.js`
## 配置
```json
{
  "chromium": "指定chrome的可执行文件路径",
  "pages": {
    "home": "https://www.wanmen.org",
    "paid": "https://www.wanmen.org/account/paid"
  },
  "log_info": {
    "account": "WM大学的账户",
    "password": "账户对应的密码"
  }
}
```