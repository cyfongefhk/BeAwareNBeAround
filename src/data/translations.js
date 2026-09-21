const guides = {
  'zh-HK': [
    '<strong>守:</strong> 保持鎮定，記錄抽搐開始及持續的時間。',
    '<strong>望:</strong> 觀察並保護患者。移開附近危險物品，用軟物墊著患者頭部。',
    '<strong>相:</strong> 將患者輕輕翻側，保持呼吸道暢通。切勿強行將任何物品塞入患者口中。',
    '<strong>助:</strong> 尋求協助。陪伴患者直至清醒，若超過五分鐘請召喚救護車。',
  ],
  'zh-CN': [
    '<strong>守:</strong> 保持镇定，记录抽搐开始及持续的时间。',
    '<strong>望:</strong> 观察并保护患者。移开附近危险物品，用软物垫着患者头部。',
    '<strong>相:</strong> 将患者轻轻翻侧，保持呼吸道畅通。切勿强行将任何物品塞入患者口中。',
    '<strong>助:</strong> 寻求协助。陪伴患者直至清醒，若超过五分钟请召唤救护车。',
  ],
  en: [
    '<strong>STAY:</strong> Stay calm and time the seizure.',
    '<strong>SAFE:</strong> Observe and keep the person safe. Clear hard objects and cushion their head.',
    '<strong>SIDE:</strong> Gently roll the person onto their side. Never put anything in their mouth.',
    '<strong>HELP:</strong> Seek help. Stay with them until fully conscious, and call an ambulance if over 5 minutes.',
  ],
};

export const translations = {
  'zh-HK': { slogan: '守、望、相、助', subtitle: '處理急性腦癇發作的口訣', secondarySubtitle: 'Acute Seizure Management Slogan', clicks: '全球點擊次數 (Global Clicks):', mode: '應用模式：', education: '教育模式', toy: '玩具模式 (錄音/播放)', recordOff: '錄音模式：關閉', recordOn: '錄音模式：開啟 (請點擊按鍵)', buttons: ['守', '望', '相', '助'], statusEducation: '教育模式：請點擊按鍵聆聽指示。', statusToy: '玩具模式：準備就緒。', guideTitle: '守望相助 急救指南', guide: guides['zh-HK'], setup: '📲 安裝及使用指南 ▼', install: '📥 安裝 App', whatIs: "💡 什麼是 Be Aware n' Be Around? ▼", faq: '❓ 常見問題 (FAQ) ▼' },
  'zh-CN': { slogan: '守、望、相、助', subtitle: '处理急性癫痫发作的口诀', secondarySubtitle: 'Acute Seizure Management Slogan', clicks: '全球点击次数 (Global Clicks):', mode: '应用模式：', education: '教育模式', toy: '玩具模式 (录音/播放)', recordOff: '录音模式：关闭', recordOn: '录音模式：开启 (请点击按键)', buttons: ['守', '望', '相', '助'], statusEducation: '教育模式：请点击按键聆听指示。', statusToy: '玩具模式：准备就绪。', guideTitle: '守望相助 急救指南', guide: guides['zh-CN'], setup: '📲 安装及使用指南 ▼', install: '📥 安装 App', whatIs: "💡 什么是 Be Aware n' Be Around? ▼", faq: '❓ 常见问题 (FAQ) ▼' },
  en: { slogan: 'STAY, SAFE, SIDE, HELP', subtitle: 'Acute Seizure Management Slogan', secondarySubtitle: '處理急性腦癇發作的口訣', clicks: 'Global Clicks:', mode: 'App Mode:', education: 'Education Mode', toy: 'Toy Mode (Record/Play)', recordOff: 'Record Mode: OFF', recordOn: 'Record Mode: ON (Click a button)', buttons: ['STAY', 'SAFE', 'SIDE', 'HELP'], statusEducation: 'Education Mode: Click buttons for instructions.', statusToy: 'Toy Mode: Ready.', guideTitle: 'Seizure First Aid Guide', guide: guides.en, setup: '📲 Setup & Guide ▼', install: '📥 Install App', whatIs: "💡 What is Be Aware n' Be Around? ▼", faq: '❓ Frequently Asked Questions (FAQ) ▼' },
};
