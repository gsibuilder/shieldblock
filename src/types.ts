export type TabType = 'popup' | 'options' | 'simulator' | 'code';

export interface RuleItem {
  id: number;
  priority: number;
  action: {
    type: string;
  };
  condition: {
    urlFilter?: string;
    resourceTypes?: string[];
    domainType?: string;
  };
  rulesetName?: string;
}

export interface ExtensionSettings {
  globalEnabled: boolean;
  rulesets: {
    ads_rules: boolean;
    privacy_rules: boolean;
    annoyances_rules: boolean;
  };
  whitelist: string[];
  customBlocklist: string[];
  stats: {
    totalBlocked: number;
    siteBlocked: Record<string, number>;
  };
}
