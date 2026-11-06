# DSH Astrology 插件

Astrology 为 DeepSeek Harness 提供统一的主题与桌面个性化：侧栏品牌名、主界面背景、启动片头、思考强度滑动条外观，以及桌面伙伴。

**完整功能要求官方 DeepSeek Harness Desktop 发布 Astrology API v1。** 当前公开版本尚未提供该宿主接口。上游接口评审并发布前，安装插件会显示兼容性说明，不会创建原生窗口。详见 [宿主集成说明](HOST-INTEGRATION.md)。

[English](README.md) | 简体中文

## 功能

- 使用 DSH 主题服务应用统一的深色与浅色星术配色。
- 自定义中英文侧栏名称与标志。
- 选择主界面图片或视频背景，配置启动片头和仅影响显示效果的思考强度滑动条样式。
- 通过官方 Desktop 宿主控制桌面伙伴。
- 设置保存在官方 Desktop 用户数据目录；插件不会接收本地路径或原始 Electron API。
- 读取设置失败可直接重试；修改其他选项时保留未保存的名称，设置页同步宿主变更。
- 修改名称、桌宠或背景适配时，背景视频保持播放进度；宿主通知窗口隐藏后暂停播放。
- 包含本项目生成的桌面伙伴资源；由于再分发条款未记录，不包含默认背景视频。

## 安装

请等待官方 Desktop 更新说明确认已发布 Astrology API v1 后再安装：

```sh
dsh plugin --profile desktop add github:astra2425/dsh-astrology
```

重启 Desktop 使插件生效。卸载命令：

```sh
dsh plugin --profile desktop remove @dsh-external/dsh-plugin-astrology
```

更新已安装的插件：

```sh
dsh plugin --profile desktop update @dsh-external/dsh-plugin-astrology
```

卸载后，设置和导入媒体仍保留在 Desktop 用户数据目录。当前插件没有清除数据的界面。若要删除，请先退出 Desktop，再删除该安装对应的应用 `userData` 目录下的 `astrology` 子目录；删除前请按当前操作系统的 Desktop 文档确认准确路径。

## 从源码构建

需要 Node.js 22.19 或更高版本，以及 pnpm 11.28.5。GitHub 安装使用仓库中已提交的 `lib/`，普通用户不需要构建。安装插件时不会运行生命周期脚本。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm pack --dry-run
```

提交流程见 [贡献指南](CONTRIBUTING.md)。

回归检查使用宿主与 DOM 替身，覆盖设置、媒体生命周期和已构建插件的加载；不代表已经完成官方 Desktop 原生窗口验收。CI 和 Release 会检查重新构建后的 `lib/` 是否与提交内容一致。

## 兼容性

插件客户端作为标准 DSH Web 插件加载。宿主没有 Astrology API v1 时，插件仍应用主题，并说明完整桌面功能不可用。完整功能要求官方 API、preload 桥接及原生资源支持，详见 [宿主集成说明](HOST-INTEGRATION.md)。

## 故障排查

- **没有星术设置页：**确认 bundle 已在 Desktop profile 启用，重启 Desktop，并检查该版本是否提供 Astrology API v1。
- **仍显示兼容性提示：**当前 Desktop 没有公开 API v1，或插件与宿主 API 版本不匹配。请在上游支持发布后更新 Desktop。
- **导入背景显示空白：**重新选择支持的图片、MP4 或 WebM 文件。媒体由官方 Desktop 宿主校验和提供。
- **设置没有保存：**等待 Desktop 恢复响应后重试。宿主拒绝写入时，界面会保留最后一次成功保存的值。
- **设置读取失败：**点击「重新读取」，无需关闭设置页。取消媒体选择会显示「设置未更改」。
- **片头预览失败：**设置页会保留并提示失败；宿主恢复后可重新预览。

## 许可证与声明

插件源码和项目自有资源使用 MIT 许可证。桌面伙伴适配保留第三方来源与 MIT 声明，见 [NOTICE.txt](NOTICE.txt) 和 [DSH-PET-MIT.txt](DSH-PET-MIT.txt)。发布前请检查 [资源许可清单](ASSET-LICENSES.md)；没有明确再分发许可的媒体不得加入仓库。

## 仓库准备

仓库命名、topics、首次 push 与 Release 步骤见 [GitHub 建仓说明](GITHUB-SETUP.md)。安全问题报告方式见 [SECURITY.md](SECURITY.md)。
