# Tab Speed Monitor

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)

A Chrome / Chromium extension that shows the approximate Down / Up speed of the currently active tab in the page title.  
一个用于 Chrome / Chromium 浏览器的扩展，用来在当前激活标签页的标题中显示近似的 Down / Up 速度。

## Sample | 示例

<img src="https://raw.githubusercontent.com/EugeneXXXie/imagesBase/master/tab-speed-monitor/tab-speed-monitor-sample.png" alt="Tab Speed Monitor sample" />

---

## Features | 功能特性

- Monitor current-tab network activity  
  监测当前激活标签页的网络活动

- Show approximate Down / Up speed in the page title  
  在页面标题中显示近似的 Down / Up 速度

- Support the following title formats: \`[↓12K ↑3K]\`, \`[↓12K]\`, \`[↑3K]\`  
  支持以下标题显示格式：\`[↓12K ↑3K]\`、\`[↓12K]\`、\`[↑3K]\`

- Open the settings popup by clicking the extension icon  
  点击扩展图标打开设置面板

- Toggle Down and Up display independently  
  可分别控制 Down 和 Up 是否显示

- Support custom Update Interval  
  支持自定义刷新间隔（Update Interval）

- Validate input to avoid invalid configuration  
  对输入值进行校验，避免非法配置

- Do not use \`chrome.debugger\`, so no browser debugging warning banner appears  
  不使用 \`chrome.debugger\`，因此不会出现浏览器“正在调试”的提示横幅

---

## Display Examples | 显示示例

- Both Down and Up enabled  
  同时显示 Down 和 Up

\`\`\`text
[↓12K ↑3K] Example Domain
\`\`\`

- Only Down enabled  
  只显示 Down

\`\`\`text
[↓12K] Example Domain
\`\`\`

- Only Up enabled  
  只显示 Up

\`\`\`text
[↑3K] Example Domain
\`\`\`

---

## How It Works | 工作原理

This extension uses \`chrome.webRequest\` to observe request activity and estimate approximate traffic for the current tab based on request headers, response headers, and request body information.  
此扩展通过 \`chrome.webRequest\` 监听请求活动，并根据请求头、响应头和请求体信息，对当前标签页的流量进行近似估算。

It periodically converts the estimated values into short text such as \`12K\` or \`3M\`, then prepends the result to the page title.  
扩展会定期将估算值转换为 \`12K\`、\`3M\` 这样的短文本，并将结果追加到页面标题前部。

---

## Accuracy Notes | 准确性说明

The displayed values are approximate and are not DevTools-level accurate measurements.  
显示的数值为近似值，不是 DevTools 级别的精确统计。

Results may be noticeably inaccurate in these scenarios:  
以下场景中结果可能存在明显偏差：

- WebSocket long-lived connections  
  WebSocket 长连接

- Video / audio streaming  
  视频流 / 音频流

- Chunked transfer  
  分块传输

- Cached responses  
  缓存命中

- Complex single-page applications (SPA)  
  复杂单页应用（SPA）

- Certain upload requests  
  某些上传请求

Best suited for:  
更适合用于：

- Seeing whether the current page has obvious network activity  
  观察当前页面是否有明显网络活动

- Roughly estimating traffic scale  
  粗略判断流量大小级别

- Checking whether a page is making frequent requests  
  辅助判断页面是否在频繁请求数据

Not recommended for:  
不建议用于：

- Precise bandwidth measurement  
  精确带宽测量

- Audit-grade traffic statistics  
  审计级流量统计

- Billing or accounting purposes  
  计费或精确核算用途

---

## Installation | 安装方式

1. Download or clone this project  
   下载或克隆本项目

2. Open Chrome / Chromium  
   打开 Chrome / Chromium 浏览器

3. Go to \`chrome://extensions/\`  
   进入 \`chrome://extensions/\`

4. Enable **Developer mode**  
   打开**开发者模式**

5. Click **Load unpacked**  
   点击**加载已解压的扩展程序**

6. Select the project folder  
   选择项目文件夹

---

## Project Structure | 项目结构

\`\`\`text
tab-speed-monitor/
├─ manifest.json
├─ service-worker.js
├─ content-script.js
├─ popup.html
└─ popup.js
\`\`\`

- **manifest.json** — Extension manifest, permissions, popup, and background configuration  
  **manifest.json** — 扩展配置文件，声明权限、弹窗和后台配置

- **service-worker.js** — Background logic for request listening, speed estimation, and settings handling  
  **service-worker.js** — 后台逻辑，负责请求监听、速度估算和设置处理

- **content-script.js** — Script injected into the page to update the title  
  **content-script.js** — 注入页面的脚本，用于更新标题

- **popup.html** — Settings popup UI  
  **popup.html** — 设置页面 UI

- **popup.js** — Popup interaction logic for reading and saving settings  
  **popup.js** — 设置页面交互逻辑，负责读取和保存设置

---

## Settings | 设置项

<img src="https://raw.githubusercontent.com/EugeneXXXie/imagesBase/master/tab-speed-monitor/settings.png" alt="Settings" />

The popup currently includes these options:  
当前设置页面包含以下选项：

- **Down**  
  **下行**

- **Up**  
  **上行**

- **Update Interval (ms)**  
  **刷新间隔（ms）**

Validation rules for **Update Interval**:  
**刷新间隔** 的输入限制如下：

- Integers only  
  只允许整数

- Range: \`500 ~ 10000\`  
  范围：\`500 ~ 10000\`

Invalid input will not be saved.  
非法输入不会被保存。

---

## Permissions | 权限说明

This extension uses the following permissions:  
本扩展使用以下权限：

- \`tabs\`
- \`storage\`
- \`scripting\`
- \`webRequest\`

Host permissions:  
主机权限：

- \`<all_urls>\`

Purpose of each permission:  
各权限用途如下：

- **tabs** — Get information about the currently active tab  
  **tabs** — 获取当前激活标签页信息

- **storage** — Save user settings  
  **storage** — 保存用户设置

- **scripting** — Inject scripts into pages when needed  
  **scripting** — 在需要时向页面注入脚本

- **webRequest** — Observe requests and estimate traffic  
  **webRequest** — 监听请求并估算流量

- **<all_urls>** — Allow the extension to work across websites  
  **<all_urls>** — 允许扩展在不同网站上运行

---

## Known Limitations | 已知限制

- Only monitors the currently active tab  
  仅监测当前激活标签页

- Shows approximate values, not exact byte-level accounting  
  显示的是近似值，不是精确到字节级别的统计

- Some websites update the title frequently, which may affect display stability  
  某些网站会频繁修改标题，可能影响显示稳定性

- Some requests cannot expose complete byte counts due to browser limitations  
  某些请求受浏览器限制，无法获取完整字节数

- WebSocket / streaming scenarios are only partially represented  
  对 WebSocket / 流媒体场景的统计能力有限

---

## Use Cases | 适用场景

Good for:  
适合：

- Checking whether a page is actively making requests  
  查看页面是否正在持续请求数据

- Roughly observing how network-active a page is  
  粗略观察页面的网络活跃程度

- Spotting whether a page is downloading larger resources  
  辅助识别页面是否在下载较大资源

Not ideal for:  
不适合：

- Precise speed measurement  
  精确测速

- One-to-one comparison with DevTools or system task managers  
  与 DevTools 或系统任务管理器做一一对照

- Billing or exact accounting  
  商业计费或精确统计

---

## Development Notes | 开发说明

If you want to change the display format, update the prefix-building logic in \`service-worker.js\`.  
如需修改显示格式，可调整 \`service-worker.js\` 中的前缀拼接逻辑。

Current format example:  
当前格式示例：

\`\`\`text
[↓12K ↑3K]
\`\`\`

You can change it to a shorter or more visible format if needed.  
你也可以按需要改成更短或更醒目的格式。

---

## License | 许可证

This project is licensed under the MIT License. See [./LICENSE](./LICENSE) for details.  
本项目基于 MIT License 开源，详情见 [./LICENSE](./LICENSE)。