# 同步上游

本站是 [AIHOT](https://github.com/KKKKhazix/AIHOT) 的数据中心行业 Fork，公开仓库为 [dc-aihot-open](https://github.com/maxsuncn/dc-aihot-open)。保留原项目 MIT 许可和作者署名。

## 远程与分支

- `origin`：自己的 `maxsuncn/dc-aihot-open`。
- `upstream`：作者的 `KKKKhazix/AIHOT`。
- `main`：经过审查的本站版本；上游更新先进入独立分支。

首次设置：

```bash
git remote add upstream https://github.com/KKKKhazix/AIHOT.git
```

日常同步前，先提交本站修改，确认工作区干净：

```bash
git switch main
git pull --ff-only origin main
git fetch upstream
git switch -c codex/sync-upstream-YYMMDD
git merge --no-commit --no-ff upstream/main
```

检查冲突并保留本站业务规则，运行 README/AGENTS 中的检查，提交合并并推送分支，向自己的仓库建立 Pull Request。不要直接覆盖行业配置；GitHub 的同步按钮不能替代冲突审查和行为验证。上线另行执行部署流程。

## 本次保留的业务规则

同步目标：`cc66cce`。采用新版手机导航、报刊成刊机制与事实去重，同时保留数据中心信源、分类、评分和写作要求。

- 精选门槛 80 分，每日最多 15 个事实名额，同一事实的多篇报道共用名额；保留人工精选覆盖。
- 隐藏更新日志入口，关闭模型榜和 Codex 监控。
- 保留来源归档、全文权限控制、正文阅读增强与历史分类兼容。
- 所有模型调用、采集、推送和索引提交安全阀在测试期间关闭。

## 验证记录

后端 630 项：598 通过、32 跳过、0 失败。跳过的是默认 AI 示例行业专用场景及本站关闭模块的场景；本站另有数据中心主题和精选容量集成测试。网页测试 29 项通过，类型检查、网页构建、空库迁移、旧版本升级和站点 30 项检查通过。

维护者选择保留历史结构。0045、0049、0050、0051、0052 清理迁移在本站保留原文件名并改为无损操作，避免后续同步重新引入删除；当前功能不读取这些历史状态。以上检查使用隔离测试库，未执行生产部署。
