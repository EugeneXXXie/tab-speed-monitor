# Tab Speed Monitor
![License: MIT](https://img.shields.io/badge/许可证-MIT-green.svg)
![Version](https://img.shields.io/badge/版本-1.0.0-blue.svg)


A Chrome / Chromium extension that shows the approximate upload and download speed of the currently active tab in the page title.

一个用于 Chrome / Chromium 浏览器的扩展，用来在当前激活标签页的标题中显示近似的上下行速度。

---

## Repository Description

**English:** A Chrome extension that shows approximate current-tab upload and download speed in the page title.  
**中文：** 一个在页面标题中显示当前激活标签页近似上下行速度的 Chrome 扩展。

---

## Features | 功能特性

### English

- Monitor network activity for the currently active tab
- Show approximate upload/download speed in the page title
- Supported title formats:
  - [↓12K ↑3K]
  - [↓12K]
  - [↑3K]
- Click the extension icon to open the settings popup
- Independently control whether to show:
  - Download speed
  - Upload speed
- Supports custom refresh interval
- Validates input to prevent invalid configuration
- Does not use chrome.debugger, so it does not trigger the browser “debugging” warning banner

### 中文

- 监测当前激活标签页的网络活动
- 在页面标题中显示近似上下行速度
- 支持显示格式：
  - [↓12K ↑3K]
  - [↓12K]
  - [↑3K]
- 点击扩展图标可打开设置面板
- 可分别控制是否显示：
  - 下行速度
  - 上行速度
- 支持自定义刷新间隔
- 输入值带校验，避免非法配置导致异常
- 不使用 chrome.debugger，因此不会出现“正在调试浏览器”的系统提示

---

## Display Examples | 显示示例

### English

If both download and upload are enabled, the title may look like:

\`\`\`text
[↓12K ↑3K] Example Domain
\`\`\`

If only download is enabled:

\`\`\`text
[↓12K] Example Domain
\`\`\`

If only upload is enabled:

\`\`\`text
[↑3K] Example Domain
\`\`\`

### 中文

如果同时开启上下行显示，标题可能会变成：

\`\`\`text
[↓12K ↑3K] Example Domain
\`\`\`

如果只开启下行显示：

\`\`\`text
[↓12K] Example Domain
\`\`\`

如果只开启上行显示：

\`\`\`text
[↑3K] Example Domain
\`\`\`

---

## How It Works | 工作原理

### English

This extension uses chrome.webRequest to observe network request events and performs an approximate estimation of upload and download traffic for the currently active tab based on request headers, response headers, and request body information.

The extension periodically converts the estimated values into a short text format such as 12K or 3M, then updates the page title prefix for the current tab.

### 中文

此扩展通过 chrome.webRequest 监听网络请求事件，并根据请求头、响应头及请求体信息，对当前激活标签页的上传和下载流量进行近似估算。

扩展会定期把估算值转换为短格式文本，例如 12K、3M，然后更新到当前页面标题前缀中。

---

## Accuracy Notes | 准确性说明

### English

The values shown by this extension are approximate, not DevTools-level accurate measurements.

The results may be noticeably inaccurate in scenarios such as:

- WebSocket long-lived connections
- Video / audio streaming
- Chunked transfer
- Cached responses
- Complex single-page applications (SPA)
- Certain upload requests

Therefore, this extension is best suited for:

- Seeing whether the current page has obvious network activity
- Roughly estimating the scale of traffic
- Helping identify whether a page is making frequent requests

It is not recommended for:

- Precise bandwidth measurement
- Audit-grade traffic statistics
- Billing or accounting purposes

### 中文

本扩展显示的是近似值，不是浏览器开发者工具级别的精确统计。

以下场景中，统计结果可能存在明显偏差：

- WebSocket 长连接
- 视频流 / 音频流
- 分块传输
- 缓存命中
- 复杂单页应用（SPA）
- 某些上传请求

因此，本扩展更适合用于：

- 观察当前页面是否有明显网络活动
- 粗略判断流量大小级别
- 辅助排查某些页面是否正在频繁请求数据

不建议将其用于：

- 精确带宽测量
- 审计级流量统计
- 计费用途

---

## Installation | 安装方式

### English

1. Download or clone this project to your local machine
2. Open Chrome
3. Go to chrome://extensions/
4. Enable **Developer mode** in the top-right corner
5. Click **Load unpacked**
6. Select the project folder

### 中文

1. 下载或克隆本项目到本地
2. 打开 Chrome 浏览器
3. 进入 chrome://extensions/
4. 打开右上角的“开发者模式”
5. 点击“加载已解压的扩展程序”
6. 选择项目文件夹

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

### English

- **manifest.json**  
  Extension manifest that declares permissions, background script, popup page, etc.

- **service-worker.js**  
  Background script that listens to network requests, calculates approximate speed, and handles settings.

- **content-script.js**  
  Injected into the page to update the document title.

- **popup.html**  
  Popup UI structure.

- **popup.js**  
  Popup interaction logic, including loading and saving settings.

### 中文

- **manifest.json**  
  扩展配置文件，声明权限、后台脚本、弹窗页面等。

- **service-worker.js**  
  后台脚本，负责监听网络请求、计算近似速度、处理设置项。

- **content-script.js**  
  注入到页面中，负责修改页面标题。

- **popup.html**  
  扩展弹窗页面结构。

- **popup.js**  
  弹窗交互逻辑，包括读取和保存设置。

---

## Settings | 设置项

### English

The popup supports the following settings:

- Show download speed
- Show upload speed
- Refresh interval (milliseconds)

Refresh interval validation rules:

- Integer only
- Minimum: 500
- Maximum: 10000

Invalid input will not be saved. The extension validates and sanitizes the value automatically.

### 中文

扩展弹窗中支持以下设置：

- 显示下行速度
- 显示上行速度
- 刷新间隔（毫秒）

刷新间隔输入限制如下：

- 只允许整数
- 最小值：500
- 最大值：10000

非法输入不会被保存，扩展会自动拦截并校正异常值。

---

## Permissions | 权限说明

### English

This extension uses the following permissions:

- tabs
- storage
- scripting
- webRequest

Host permissions:

- <all_urls>

Purpose of each permission:

- **tabs**: get information about the currently active tab
- **storage**: save user settings
- **scripting**: inject scripts into pages when needed
- **webRequest**: observe requests and estimate traffic
- **<all_urls>**: allow the extension to run across websites

### 中文

本扩展使用以下权限：

- tabs
- storage
- scripting
- webRequest

主机权限：

- <all_urls>

用途说明：

- **tabs**：获取当前激活标签页信息
- **storage**：保存设置
- **scripting**：在必要时向页面注入脚本
- **webRequest**：监听请求事件并估算流量
- **<all_urls>**：允许在不同网站页面上运行

---

## Known Limitations | 已知限制

### English

- Only monitors the currently active tab
- Shows approximate values, not exact byte-level accounting
- Some websites update the page title frequently, which may affect display stability
- Some network requests cannot expose complete byte counts due to browser limitations
- WebSocket / streaming scenarios are only partially represented

### 中文

- 只监测当前激活标签页
- 显示的是近似值，不是精确字节统计
- 某些网站会频繁修改页面标题，可能影响显示稳定性
- 某些网络请求由于浏览器机制无法完整获取真实字节数
- 对 WebSocket / 流媒体类场景统计能力有限

---

## Use Cases | 适用场景

### English

Good for:

- Checking whether a page is actively making requests
- Roughly observing how network-active a page is
- Spotting whether a page is downloading large resources

Not ideal for:

- Precise speed measurement
- One-to-one comparison with system task manager or DevTools
- Billing or exact accounting

### 中文

适合：

- 日常查看页面是否在持续请求数据
- 粗略观察某个页面的网络活跃程度
- 辅助识别页面是否正在下载较大资源

不适合：

- 精确测速
- 和系统任务管理器 / DevTools 做一一对照
- 商业计费或精确统计

---

## Development Notes | 开发说明

### English

If you want to change the display format, update the prefix-building logic in service-worker.js.

For example, the current format:

\`\`\`text
[↓12K ↑3K]
\`\`\`

can be changed to a shorter or more visible format if needed.

### 中文

如果你需要修改显示格式，可以调整 service-worker.js 中的前缀构造逻辑。

例如当前格式：

\`\`\`text
[↓12K ↑3K]
\`\`\`

也可以改为其他更短或更明显的格式。

---

## License | 许可证

This project is licensed under the MIT License. See [./LICENSE](./LICENSE) for details.

本项目基于 MIT License 开源，详情见 [./LICENSE](./LICENSE)。