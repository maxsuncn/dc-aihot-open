# MaxTiger情报站 · 数据中心行业包

本目录维护面向数据中心建设与运维产业链的行业配置。分类为技术、项目、玩家、市场、白皮书；政策、监管和标准内容按主要影响归入这些分类，并可使用“标准与政策”主题标签。白皮书类专门检索行业报告、研究报告、研报和白皮书。信源与关注范围参考本仓库的 [SOURCE-MAP.md](../research/dc-signal-reference/SOURCE-MAP.md)，评分细则参考本地副本 [SCORING.md](../research/dc-signal-reference/SCORING.md)。这些文件是参考材料；运行配置只读取本目录内的 `sources.json`、`topics.json`、`taxonomy.ts` 和 `prompts/`。

## 运行配置

- 站点通过 Docker 运行于腾讯云轻量服务器，宿主 Web 端口只绑定 `127.0.0.1:13000`；域名 `dc.maxtiger.com.cn` 暂未配置。
- AI 分析与定时采集已经启用。服务器当前 LLM 为 `ark-code-latest`，模型调用并发为 1；凭据只保存在服务器私有环境变量中。
- `industry/sources.json` 登记来源；`industry/topics.json` 提供站点主题；`industry/taxonomy.ts` 控制六类分类、标签、同义词和实体；`industry/prompts/` 保存预筛、评分与内容理解规则。
- 首次导入只插入不存在的信源，不覆盖后台已存在信源的名称、启用状态、采集结果和文章历史。

## 信源状态

本次将来源地图中的 49 条真实 RSS 地址写入配置：20 条已验证可采集并启用，29 条暂时停用。19 条公众号 RSS 均通过服务器 HTTP/XML 探测；Data Center Knowledge 返回有效 RSS。

Schneider Electric、Data Center Frontier 和 Data Center Dynamics 的 RSS 当前由服务器访问时返回 HTTP 403。RSSHub 订阅组的服务器连接探测超时。因此这些记录保留在后台并设为停用，等待后续连通性变化后再启用；不删除记录，不影响已采集文章和历史。

来源地图里的 `wechat-rss` 是服务介绍页，不是可订阅的 feed 地址，故未作为采集源导入。正文授权方面，仅 DCK 与 DCF 按来源地图 A5 标记 `site_fulltext`；`syndicate_fulltext` 对所有来源保持关闭。

## 评分和关注主题

评分提示已按 `dc-signal-v0.4.1` 同步：匹配度 45、信息密度 15、受众匹配 20、来源权威 3、证据 2、首轮加权最多 8、行动价值 10、时效性 5，另有最多 15 分负面扣分并将结果限制在 0–100。精选线先对齐旧站 A 级 80 分；目前没有足够人工标注样本用于按信源层级细分门槛，后续应使用行业样本校准。

关注词包覆盖 AI 工厂与高密度机架、电网/800VDC/HVDC 与大型负荷、液冷可靠性和流体、数字化交付与调试、DCOS 运维人才、选址/水/资本与交付约束。详细词表位于 `industry/prompts/watch-keywords.md`，并由内容理解提示词引用。关键词命中只帮助召回，不作为事实或高分的充分条件。

## 更新部署

应用按 `/opt/stack/apps/aihot` 中的 Docker Compose 栈运行。部署更新前备份数据库；构建新镜像后仅重建 API、worker 和 web 服务，再运行可重复执行的 seed。不要覆盖服务器 `.env`、数据库卷或用户已有内容。域名和公网入口在备案完成前不配置。
