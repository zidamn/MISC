// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  behavior: "domain",
  interval: 86400
};

// 规则集配置
const ruleProviders = {
  reject: {
    ...ruleProviderCommon,
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    path: "./ruleset/reject.yaml"
  },
  my_rej: {
    ...ruleProviderCommon,
    url: "https://raw.githubusercontent.com/zidamn/MISC/master/my_rej.yaml",
    path: "./ruleset/my_rej.yaml"
  },
  my_proxy: {
    ...ruleProviderCommon,
    url: "https://raw.githubusercontent.com/zidamn/MISC/master/my_proxy.yaml",
    path: "./ruleset/my_proxy.yaml"
  },
  my_cn: {
    ...ruleProviderCommon,
    url: "https://raw.githubusercontent.com/zidamn/MISC/master/my_cn.yaml",
    path: "./ruleset/my_cn.yaml"
  },
  my_ai: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://raw.githubusercontent.com/zidamn/MISC/master/my_ai.yaml",
    path: "./ruleset/my_ai.yaml"
  },
  us_only: {
    ...ruleProviderCommon,
    url: "https://raw.githubusercontent.com/zidamn/MISC/master/my_us.yaml",
    path: "./ruleset/my_us.yaml"
  },
  "cncidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/cncidr.yaml"
  },
  "lancidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/lancidr.yaml"
  },
  private: {
    ...ruleProviderCommon,
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    path: "./ruleset/private.yaml"
  }
};

// 规则
const rules = [
  "RULE-SET,reject,REJECT",
  "RULE-SET,my_rej,REJECT",
  "RULE-SET,my_proxy,PROXY",
  "RULE-SET,my_cn,DIRECT",
  "RULE-SET,my_ai,AI",
  "RULE-SET,us_only,美国",
  "RULE-SET,private,DIRECT",
  "RULE-SET,lancidr,DIRECT,no-resolve",
  "RULE-SET,cncidr,DIRECT,no-resolve",
  "GEOSITE,category-ads-all,REJECT",
  "GEOSITE,private,DIRECT",
  "GEOSITE,steam@cn,DIRECT",
//  "GEOSITE,geolocation-!cn,PROXY",
  "GEOSITE,cn,DIRECT",
  "GEOIP,CN,DIRECT",
  "MATCH,OTHER"
];

// 代理组通用配置
const groupBaseOption = {
  interval: 300,
  url: "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖DNS配置
//  config.dns = dnsConfig;

  // 获取所有代理节点名称
  const proxyNames = config?.proxies?.map(p => p.name) ?? [];

  // 过滤代理节点
  const urlTestFilter = /^(?!.*x12\.8)(?!.*x5\.88)(?!.*UID)(?!.*EMAIL).*$/;
  const selectFilter = /^(?!.*x12\.8)(?!.*UID)(?!.*EMAIL).*$/;
  const japanFilter = /日|日本|🇯🇵|川日|东京|大阪|泉日|埼玉|沪日|深日|[^-]日|JP|Japan/;
  const usFilter = /美|美国|🇺🇸|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States/;
  const urlTestProxies = proxyNames.filter(name => urlTestFilter.test(name));
  const selectProxies = proxyNames.filter(name => selectFilter.test(name));
  const japanProxies = proxyNames.filter(name => japanFilter.test(name));
  const usProxies = proxyNames.filter(name => usFilter.test(name));

  // 配置代理组
  config["proxy-groups"] = [
    {
      name: "PROXY",
      type: "select",
      proxies: ["SELECT", "DIRECT"]
    },
    {
      name: "OTHER",
      type: "select",
      proxies: ["PROXY", "DIRECT"]
    },
    {
      ...groupBaseOption,
      name: "URL-TEST",
      type: "url-test",
      tolerance: 100,
      proxies: urlTestProxies
    },
    {
      ...groupBaseOption,
      name: "日本",
      type: "url-test",
      proxies: japanProxies
    },
    {
      ...groupBaseOption,
      name: "美国",
      type: "select",
      proxies: usProxies
    },
    {
      name: "AI",
      type: "select",
      proxies: ["日本", "美国"]
    },
    {
      ...groupBaseOption,
      name: "SELECT",
      type: "select",
      tolerance: 1000,
      proxies: selectProxies
    }
  ];

  // 配置规则
  config["rule-providers"] = ruleProviders;
  config.rules = rules;

  return config;
}
