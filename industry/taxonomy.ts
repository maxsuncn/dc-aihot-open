// Industry vocabulary for data-center construction, power, cooling and operations.

export const CATEGORIES = [
  { key: "technology", label: "技术", section: "技术", guide: "数据中心与智算基础设施的供配电、储能、冷却、液冷、运维、能效、可靠性、工程实践和技术研究" },
  { key: "projects", label: "项目", section: "项目", guide: "数据中心与智算中心的选址、规划、招标、开工、建设、扩容、上电、调试、投产和交付节点" },
  { key: "players", label: "玩家", section: "玩家", guide: "数据中心业主、云厂商、设备供应商及其他产业链参与者的具体行动，如投资、合作、订单、并购、产品发布和经营变化" },
  { key: "market", label: "市场", section: "市场", guide: "行业供需、市场规模、容量、价格、成本、资本趋势，以及有明确样本和口径的市场研究与报告" },
  { key: "whitepaper", label: "白皮书", section: "白皮书", guide: "可追溯的行业报告、研究报告、研报、白皮书及其正式发布内容；仅提及报告的普通新闻按其实际主题分类" },
] as const;

export const ITEM_TYPES = [
  "project_development", "technology_infrastructure", "company_market_event", "policy_standard",
  "research_report", "operations_incident", "opinion_analysis",
] as const;

// Classification fallback used when the model omits its first category tag.
export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  project_development: "项目",
  technology_infrastructure: "技术",
  company_market_event: "玩家",
  policy_standard: "市场",
  research_report: "白皮书",
  operations_incident: "技术",
  opinion_analysis: "技术",
};

export const CATEGORY_TAGS = [
  "技术", "项目", "玩家", "市场", "白皮书",
] as const;

// Old policy records are mapped to their practical impact category; market is the safe fallback.
export const DEFAULT_CATEGORY_TAG = "市场" as const;

// Former category labels remain valid as descriptive tags for existing analysis records and topic searches.
const LEGACY_CATEGORY_TAGS = [
  "项目建设", "供配电与储能", "制冷与液冷", "运营与能效", "企业与市场", "政策与标准",
  "研究与报告", "招标与采购", "事故与复盘", "实践与观点",
] as const;

export const TOPIC_TAGS = [
  ...LEGACY_CATEGORY_TAGS,
  "AIDC/智算中心", "IDC", "选址与规划", "建设与交付", "招标/EPC", "资本开支", "订单与产能",
  "电网接入", "变配电", "UPS", "储能/BESS", "HVDC/800V", "供配电", "液冷/CDU", "制冷与热管理",
  "PUE与能效", "绿电与电网", "数据中心运维", "可靠性与可用性", "BIM/数字孪生", "消防与安全",
  "标准与政策", "供应链与设备", "出海", "AI工厂与高密度机架", "灰空间与模块化", "网络与光纤密度",
  "800VDC与HVDC", "并网与大型负荷", "源网荷储", "弧闪与直流安全", "冷却液与流体管理",
  "调试与性能验证", "BIM与数字化交付", "选址与水资源", "DCOS与人才", "生命周期TCO", "供应链与交付周期",
] as const;

export const ENTITY_TAGS = [
  "Schneider Electric", "Vertiv", "Eaton", "ABB", "Huawei", "NVIDIA", "AWS", "Microsoft", "Google",
  "Equinix", "Digital Realty", "GDS", "Chindata", "Alibaba Cloud", "Tencent Cloud", "ByteDance", "CAICT", "CDCC",
] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "智算": "AIDC/智算中心", "智算中心": "AIDC/智算中心", "AI数据中心": "AIDC/智算中心", "AIDC": "AIDC/智算中心",
  "IDC建设": "建设与交付", "工程建设": "建设与交付", "交付": "建设与交付", "EPC": "招标/EPC", "招投标": "招标与采购",
  "供电": "供配电", "电力": "供配电", "储能": "储能/BESS", "BESS": "储能/BESS", "液冷": "液冷/CDU", "CDU": "液冷/CDU",
  "冷却": "制冷与热管理", "制冷": "制冷与热管理", "PUE": "PUE与能效", "能效": "PUE与能效", "运维": "数据中心运维",
  "可靠性": "可靠性与可用性", "资本开支": "资本开支", "融资": "企业与市场", "并购": "企业与市场",
  "标准": "标准与政策", "政策": "标准与政策", "法规": "标准与政策", "监管": "标准与政策", "事故复盘": "事故与复盘",
  "行业报告": "白皮书", "研究报告": "白皮书", "研报": "白皮书", "白皮书": "白皮书",
  "industry report": "白皮书", "research report": "白皮书", "white paper": "白皮书",
  "AI factory": "AI工厂与高密度机架", "high-density rack": "AI工厂与高密度机架", "rack density": "AI工厂与高密度机架",
  "grey space": "灰空间与模块化", "white space": "灰空间与模块化", "AI pod": "灰空间与模块化",
  "fiber densification": "网络与光纤密度", "800VDC": "800VDC与HVDC", "HVDC": "800VDC与HVDC",
  "interconnection": "并网与大型负荷", "large load": "并网与大型负荷", "source-grid-load-storage": "源网荷储",
  "arc flash": "弧闪与直流安全", "DC safety": "弧闪与直流安全", "coolant integrity": "冷却液与流体管理",
  "fluid chemistry": "冷却液与流体管理", "PG25": "冷却液与流体管理", "commissioning flush": "调试与性能验证",
  "performance validation": "调试与性能验证", "connected data environment": "BIM与数字化交付",
  "single source of truth": "BIM与数字化交付", "power availability": "选址与水资源",
  "water availability": "选址与水资源", "skills gap": "DCOS与人才", "training and certification": "DCOS与人才",
  "lifecycle TCO": "生命周期TCO", "critical component lead time": "供应链与交付周期",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; otherNames?: string[] }> = {
  "schneider-electric": { name: "施耐德电气", displayTag: "Schneider Electric", aliases: ["Schneider Electric", "施耐德", "施耐德电气"] },
  vertiv: { name: "维谛技术", displayTag: "Vertiv", aliases: ["Vertiv", "维谛", "艾默生网络能源"] },
  eaton: { name: "伊顿", displayTag: "Eaton", aliases: ["Eaton", "伊顿"] },
  abb: { name: "ABB", displayTag: "ABB", aliases: ["ABB"] },
  huawei: { name: "华为", displayTag: "Huawei", aliases: ["华为", "Huawei"] },
  nvidia: { name: "NVIDIA", displayTag: "NVIDIA", aliases: ["NVIDIA", "英伟达"] },
  aws: { name: "Amazon Web Services", displayTag: "AWS", aliases: ["AWS", "Amazon Web Services", "亚马逊云科技"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "Azure"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "谷歌", "Google Cloud"] },
  equinix: { name: "Equinix", displayTag: "Equinix", aliases: ["Equinix", "Equinix Metal"] },
  "digital-realty": { name: "Digital Realty", displayTag: "Digital Realty", aliases: ["Digital Realty", "数字房地产信托"] },
  gds: { name: "万国数据", displayTag: "GDS", aliases: ["GDS", "万国数据", "GDS Holdings"] },
  chindata: { name: "秦淮数据", displayTag: "Chindata", aliases: ["Chindata", "秦淮数据"] },
  alibaba: { name: "阿里云", displayTag: "Alibaba Cloud", aliases: ["阿里云", "Alibaba Cloud", "阿里巴巴"] },
  tencent: { name: "腾讯云", displayTag: "Tencent Cloud", aliases: ["腾讯云", "Tencent Cloud", "腾讯"] },
  bytedance: { name: "字节跳动", displayTag: "ByteDance", aliases: ["字节跳动", "ByteDance", "火山引擎"] },
  caict: { name: "中国信息通信研究院", displayTag: "CAICT", aliases: ["中国信通院", "CAICT", "中国信息通信研究院"] },
  cdcc: { name: "中国通信标准化协会数据中心委员会", displayTag: "CDCC", aliases: ["CDCC", "数据中心委员会"] },
};

export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "schneider-electric", name: "施耐德电气", patterns: [/schneider(?:\s+electric)?|施耐德/i] },
  { id: "vertiv", name: "维谛技术", patterns: [/\bvertiv\b|维谛|艾默生网络能源/i] },
  { id: "eaton", name: "伊顿", patterns: [/\beaton\b|伊顿/i] },
  { id: "abb", name: "ABB", patterns: [/\bABB\b/] },
  { id: "huawei", name: "华为", patterns: [/华为|\bhuawei\b/i] },
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达/i] },
  { id: "aws", name: "AWS", patterns: [/\bAWS\b|Amazon Web Services|亚马逊云/i] },
  { id: "microsoft", name: "Microsoft", patterns: [/microsoft|微软|\bazure\b/i] },
  { id: "google", name: "Google", patterns: [/google|谷歌/i] },
  { id: "equinix", name: "Equinix", patterns: [/equinix/i] },
  { id: "digital-realty", name: "Digital Realty", patterns: [/digital realty|数字房地产信托/i] },
  { id: "gds", name: "万国数据", patterns: [/\bGDS\b|万国数据/i] },
  { id: "chindata", name: "秦淮数据", patterns: [/chindata|秦淮数据/i] },
  { id: "alibaba", name: "阿里云", patterns: [/alibaba|阿里云|阿里巴巴/i] },
  { id: "tencent", name: "腾讯云", patterns: [/tencent|腾讯云/i] },
  { id: "bytedance", name: "字节跳动", patterns: [/bytedance|字节跳动|火山引擎/i] },
  { id: "caict", name: "中国信通院", patterns: [/caict|中国信通院|中国信息通信研究院/i] },
  { id: "cdcc", name: "CDCC", patterns: [/\bCDCC\b|数据中心委员会/i] },
];

export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "schneider-electric", domains: ["se.com", "blog.se.com"] },
  { entityId: "vertiv", domains: ["vertiv.com"] },
  { entityId: "eaton", domains: ["eaton.com"] },
  { entityId: "abb", domains: ["abb.com"] },
  { entityId: "huawei", domains: ["huawei.com"] },
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "aws", domains: ["aws.amazon.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "google", domains: ["google.com"] },
  { entityId: "equinix", domains: ["equinix.com"] },
  { entityId: "digital-realty", domains: ["digitalrealty.com"] },
  { entityId: "caict", domains: ["caict.ac.cn"] },
];

export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];

// No single release category defines all data-center industry news.
export const RELEASE: { category: string; tag: string; unit: string } | null = null;
export const PLAIN_TERMS: readonly string[] = ["ai", "gpu", "pue", "wue", "ups", "hvdc", "bess", "cdu", "dcim", "bms", "epms", "api", "ceo", "ipo"];
