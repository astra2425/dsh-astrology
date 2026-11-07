# DSH Astrology 插件

Astrology 为 DeepSeek Harness 提供统一的主题与桌面个性化：侧栏品牌名、主界面背景、启动片头、思考强度滑动条外观，以及桌面伙伴。

**普通 DSH Desktop 可使用主题、侧栏名称、工作区背景、应用内片头和思考强度滑条。** Windows 还支持可选的独立桌宠窗口。提供 Astrology API v1 的宿主可以使用原生片头和桌宠接口。[宿主集成说明](HOST-INTEGRATION.md)

[English](README.md) | 简体中文

## 功能

- 使用 DSH 主题服务应用统一的深色与浅色星术配色。
- 自定义中英文侧栏名称与标志。
- 选择主界面图片或视频背景，配置启动片头和仅影响显示效果的思考强度滑动条样式。
- Windows 可启用独立的悬浮桌宠。提供 Astrology API v1 的宿主可使用原生桌宠。
- 普通模式的配置和媒体保存在 DSH 界面本地，原生模式由宿主管理。
- 读取设置失败可直接重试；修改其他选项时保留未保存的名称，设置页同步宿主变更。
- 修改名称、桌宠或背景适配时，背景视频保持播放进度；宿主通知窗口隐藏后暂停播放。
- 包含本项目生成的桌面伙伴资源；由于再分发条款未记录，不包含默认背景视频。

## 安装

先启动一次 Desktop 初始化配置，然后完全退出 Desktop，再使用 DSH 命令安装：

```sh
dsh plugin --profile desktop add github:astra2425/dsh-astrology
```

重新打开 Desktop。主题自动生效。进入「设置 → 星术」，可编辑侧栏名称、导入或移除背景、开启及预览片头，并选择滑条样式。普通模式可导入 PNG、JPEG、WebP、MP4 或 WebM 背景，片头支持 MP4 和 WebM，单个文件上限 128 MiB。

- **片头**在工作区加载时播放。用 Esc 或「跳过片头」退出。视频最长播放 60 秒，未导入视频时显示星术动画。
- **滑条**出现在会话的模型菜单 → 思考强度中。模型须提供至少两个档位。滑条使用宿主原有的档位选项，兼容的菜单结构以 DSH 0.2.2-rc.1 为基准。

卸载命令：

```sh
dsh plugin --profile desktop remove @dsh-external/dsh-plugin-astrology
```

更新已安装的插件：

```sh
dsh plugin --profile desktop update @dsh-external/dsh-plugin-astrology
```

普通模式的设置与媒体分别保存在当前应用的本地存储和 IndexedDB，卸载插件后会保留。原生模式由宿主管理数据，两种模式的设置各自保存。

### Windows 悬浮桌宠

完全退出 Desktop，然后在 PowerShell 中执行以下两行。把第二行换成你的实际安装路径。

```powershell
$env:DSH_ASTROLOGY_DESKTOP_PET = '1'
& 'E:\Program Files\DeepSeek Harness\DeepSeek Harness.exe'
```

桌宠在独立的透明置顶窗口中显示，可拖动，右键菜单可关闭。插件卸载或 DSH Host 退出时，助手随之退出。需要长期启用时，可在该插件的 Cordis 条目配置中设置 `desktopPet: true`。

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

插件客户端通过 DSH 的主题和设置扩展点加载。应用内片头在渲染器加载后播放。控制启动窗口全屏和在工作区加载前展示片头需要宿主原生接口。

## 故障排查

- **没有星术设置页：**确认插件已在 Desktop profile 启用，并完全退出后重新打开 Desktop。
- **没有出现滑条：**确认模型提供至少两个思考强度选项，然后展开模型菜单中的思考强度。若新版宿主改变了菜单结构，原档位菜单仍可使用。
- **导入背景显示空白：**尝试受支持的图片，或使用当前 Desktop 能解码的 MP4、WebM 视频。
- **设置没有保存：**等待 Desktop 恢复响应后重试。宿主拒绝写入时，界面会保留最后一次成功保存的值。
- **设置读取失败：**点击「重新读取」，无需关闭设置页。取消媒体选择会显示「设置未更改」。
- **片头预览失败：**设置页会保留并提示失败；宿主恢复后可重新预览。

## 许可证与声明

插件源码和项目自有资源使用 MIT 许可证。桌面伙伴适配保留第三方来源与 MIT 声明，见 [NOTICE.txt](NOTICE.txt) 和 [DSH-PET-MIT.txt](DSH-PET-MIT.txt)。发布前请检查 [资源许可清单](ASSET-LICENSES.md)；没有明确再分发许可的媒体不得加入仓库。

## 仓库准备

仓库命名、topics、首次 push 与 Release 步骤见 [GitHub 建仓说明](GITHUB-SETUP.md)。安全问题报告方式见 [SECURITY.md](SECURITY.md)。
