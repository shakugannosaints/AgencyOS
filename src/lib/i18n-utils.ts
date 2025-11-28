import { useTranslation } from 'react-i18next';

/**
 * 更简洁的翻译hook，直接返回t函数
 */
export function useTrans() {
  const { t } = useTranslation();
  return t;
}

/**
 * 翻译hook，包含命名空间支持
 */
export function useI18n(namespace?: string) {
  const { t } = useTranslation(namespace);
  return {
    t,
    /**
     * 翻译文本，支持命名空间
     */
    translate: (key: string, options?: any) => t(key, options),
    /**
     * 安全翻译，如果key不存在则返回key
     */
    safeTranslate: (key: string, options?: any) => {
      const result = t(key, options);
      return result === key ? `[${key}]` : result;
    }
  };
}

/**
 * 通用的应用导航翻译hook
 */
export function useNavTranslations() {
  const t = useTrans();
  return {
    notes: t('app.nav.notes'),
    tracks: t('app.nav.tracks'),
    settings: t('app.nav.settings'),
    dashboard: t('app.nav.dashboard'),
    agents: t('app.nav.agents'),
    missions: t('app.nav.missions'),
    anomalies: t('app.nav.anomalies'),
    reports: t('app.nav.reports'),
    rules: t('app.nav.rules'),
  };
}

/**
 * 通用的应用操作翻译hook
 */
export function useCommonTranslations() {
  const t = useTrans();
  return {
    edit: t('app.common.edit'),
    delete: t('app.common.delete'),
    cancel: t('app.common.cancel'),
    submit: t('app.common.submit'),
    update: t('app.common.update'),
    save: t('app.common.save'),
    divisionName: t('app.common.divisionName'),
    divisionCode: t('app.common.divisionCode'),
    status: t('app.common.status'),
    tags: t('app.common.tags'),
    note: t('app.common.note'),
    current: t('app.common.current'),
    chaos: t('app.common.chaos'),
    looseEnds: t('app.common.looseEnds'),
    session: t('app.common.session'),
    nextBriefing: t('app.common.nextBriefing'),
    weather: t('app.common.weather'),
    snapshot: t('app.common.snapshot'),
    export: t('app.common.export'),
    import: t('app.common.import'),
    importing: t('app.common.importing'),
    exportSuccess: t('app.common.exportSuccess'),
    importSuccess: t('app.common.importSuccess'),
    importError: t('app.common.importError'),
  };
}

/**
 * 格式化数字的翻译工具函数
 */
export function useNumberFormatter() {
  return {
    /**
     * 格式化数字，添加千位分隔符
     */
    format: (num: number) => {
      return new Intl.NumberFormat().format(num);
    },
    /**
     * 格式化百分比
     */
    formatPercent: (value: number, decimals: number = 0) => {
      return new Intl.NumberFormat(undefined, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    }
  };
}
