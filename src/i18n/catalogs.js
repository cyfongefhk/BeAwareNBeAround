import { messages as en } from './locales/en.po';
import { messages as zhHK } from './locales/zh-HK.po';
import { messages as zhCN } from './locales/zh-CN.po';

export function loadCompiledCatalogs() {
  return { en, 'zh-HK': zhHK, 'zh-CN': zhCN };
}
