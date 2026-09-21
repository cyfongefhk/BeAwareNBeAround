import { useEffect, useState } from 'react';
import { educationSteps, languages } from './data/educationSteps';
import { translations } from './data/translations';
import { incrementCounter, readCounter } from './services/clickCounter';
import { speak, stopSpeech } from './services/speech';
import { useToyRecordings } from './hooks/useToyRecordings';
import { getInstallAction, isIOS } from './services/install';

const logoUrl = 'https://epilepsy.org.hk/wp-content/uploads/elementor/thumbs/EFHK-abb-Logo-Ver-%E5%9C%93%E5%BA%95-rsi4tzw9b949vi84j6y5gkdzbj2s5xn3mit7czgz2g.png';

function ContentPanel({ summary, children, className }) {
  return (
    <details className={className}>
      <summary>{summary}</summary>
      <div className="content">{children}</div>
    </details>
  );
}

export default function App() {
  const [language, setLanguage] = useState('zh-HK');
  const [mode, setMode] = useState('edu');
  const [clicks, setClicks] = useState(readCounter);
  const [status, setStatus] = useState(translations['zh-HK'].statusEducation);
  const [recordMode, setRecordMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const toyRecordings = useToyRecordings();
  const t = translations[language];

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setStatus(mode === 'edu' ? translations[nextLanguage].statusEducation : translations[nextLanguage].statusToy);
  }

  function changeMode(event) {
    const nextMode = event.target.value;
    stopSpeech();
    toyRecordings.cleanup();
    setRecordMode(false);
    setMode(nextMode);
    setStatus(nextMode === 'edu' ? t.statusEducation : t.statusToy);
  }

  function activateAction(id) {
    setClicks((current) => incrementCounter(current));
    if (mode !== 'edu') {
      if (recordMode) {
        const outcome = toyRecordings.record(id);
        setStatus(outcome === 'busy' ? (language === 'en' ? 'Please stop the current recording first!' : '請先停止目前的錄音！') : outcome === 'started' ? (language === 'en' ? `Recording on button ${id}... (Max 60s)` : `正在按鍵 ${id} 錄音... (最長60秒)`) : t.statusToy);
      } else {
        setStatus(toyRecordings.play(id) ? (language === 'en' ? `Playing button ${id}...` : `播放按鍵 ${id}...`) : (language === 'en' ? 'No audio recorded yet.' : '此按鍵尚未有錄音。'));
      }
      return;
    }

    const didSpeak = speak(educationSteps[language][id], languages[language].speechLocale);
    setStatus(didSpeak ? `${language === 'en' ? 'Playing education step' : language === 'zh-CN' ? '播放教育步骤' : '播放教育步驟'} ${id}...` : t.statusEducation);
  }

  async function toggleRecordMode() {
    if (recordMode) {
      toyRecordings.cleanup();
      setRecordMode(false);
      setStatus(language === 'en' ? 'Playback mode active.' : '播放模式：開啟。');
      return;
    }
    if (await toyRecordings.enable()) {
      setRecordMode(true);
      setStatus(language === 'en' ? 'Ready to record.' : '準備錄音。');
    } else {
      setStatus(language === 'en' ? 'Microphone permission required.' : '需要麥克風權限才能進行錄音。');
    }
  }

  async function installApp() {
    if (getInstallAction({ isIOS: isIOS(), prompt: installPrompt }) === 'prompt') {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    window.alert(language === 'en' ? "To install, use your browser's Add to Home Screen option." : '請使用瀏覽器的「加入主畫面」選項安裝。');
  }

  return (
    <main>
      <div className="top-bar">
        <div className="top-left-group">
          <a href="https://epilepsy.org.hk" target="_blank" rel="noopener noreferrer" className="logo-link">
            <img src={logoUrl} alt="Epilepsy Foundation of Hong Kong" className="app-logo" />
          </a>
          <div className="org-name">
            <div className="org-name-zh">香港腦癇基金會</div>
            <div className="org-name-en">Epilepsy Foundation of Hong Kong</div>
          </div>
        </div>
        <div className="lang-selector" aria-label="Language">
          {Object.entries(languages).map(([code, { label }]) => (
            <button key={code} className={`lang-btn ${language === code ? 'active' : ''}`} aria-pressed={language === code} onClick={() => changeLanguage(code)}>{label}</button>
          ))}
        </div>
      </div>

      <header className="header">
        <div className="slogan-chars">{t.slogan}</div>
        <h1 className="theme-title">Be Aware n' Be Around</h1>
        <div className="subtitle-box">
          <div className="subtitle-primary">{t.subtitle}</div>
          <div className="subtitle-secondary">{t.secondarySubtitle}</div>
        </div>
        <div className="counter-box"><span>{t.clicks}</span> <span>{clicks.toLocaleString()}</span></div>
      </header>

      <section className="controls" aria-label={t.mode}>
        <div className="toggle-group">
          <label htmlFor="modeSelect">{t.mode}</label>
          <select id="modeSelect" value={mode} onChange={changeMode}>
            <option value="edu">{t.education}</option>
            <option value="toy">{t.toy}</option>
          </select>
        </div>
        {mode === 'toy' && <button className={`record-toggle ${recordMode ? 'active' : ''}`} onClick={toggleRecordMode}>{recordMode ? t.recordOn : t.recordOff}</button>}
      </section>

      <section className="grid" aria-label="First aid actions">
        {t.buttons.map((label, index) => <button key={label} className={`btn-toy button-${index + 1} ${toyRecordings.recordingId === index + 1 ? 'recording-pulse' : ''}`} onClick={() => activateAction(index + 1)}>{label}</button>)}
      </section>

      <p className="status" aria-live="polite">{status}</p>

      <section className="youtube-container">
        <div className="youtube-label">▶️ 急性腦癇發作處理動畫</div>
        <iframe src="https://www.youtube.com/embed/g9909mQ2dRo?iv_load_policy=3&rel=0&modestbranding=1" title="Acute Seizure Animation" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </section>

      <section className="instruction-box">
        <h2>{t.guideTitle}</h2>
        {t.guide.map((guide) => <p key={guide} dangerouslySetInnerHTML={{ __html: guide }} />)}
      </section>

      <div className="install-row">
        <ContentPanel className="setup-guide" summary={t.setup}>
          <h3>{language === 'en' ? 'How to Install' : '如何安裝至手機'}</h3>
          <ul><li><strong>iPhone (iOS):</strong> {language === 'en' ? "Open in Safari, tap Share, then select Add to Home Screen." : '使用 Safari 瀏覽器開啟此網頁，點擊「分享」圖示，然後選擇「加入主畫面」。'}</li><li><strong>Android:</strong> {language === 'en' ? 'Open in Chrome, use the menu, then select Add to Home screen.' : '使用 Chrome 瀏覽器開啟，點擊右上角選單，然後選擇「加到主畫面」。'}</li></ul>
          <h3>{language === 'en' ? 'How to Operate' : '如何操作'}</h3>
          <ul><li><strong>{t.education}:</strong> {language === 'en' ? 'Tap a button to hear the clinical instruction for that step.' : '點擊顏色按鍵，手機會播放該步驟的急救指示。'}</li><li><strong>{t.toy}:</strong> {language === 'en' ? 'Turn Record Mode on, tap a button to record for up to 60 seconds, then turn it off to play recordings.' : '開啟錄音模式後，點擊任何顏色按鍵錄製聲音（最長60秒），關閉後點擊按鍵即可播放。'}</li></ul>
        </ContentPanel>
        <button className="install-btn-small" onClick={installApp}>{t.install}</button>
      </div>

      <ContentPanel className="what-is-guide" summary={t.whatIs}>
        <p>"Be Aware of the time. Be Around for the safe recovery."</p>
        <p>"Be Aware: Don't restrain. Be Around: Protect and remain."</p>
        <p>"Aware of what to do, Around when it matters most."</p>
        <h3>Be Aware (Mental Vigilance &amp; Safety Knowledge)</h3>
        <ul><li><strong>Recognize &amp; Time:</strong> Note when the seizure starts; call emergency services if it exceeds 5 minutes.</li><li><strong>Know the Don'ts:</strong> Never restrain movement or place anything in the person's mouth.</li><li><strong>Assess Environment:</strong> Spot physical hazards such as sharp corners, water, or stairs.</li></ul>
        <h3>Be Around (Physical Protection &amp; Care)</h3>
        <ul><li><strong>Secure the Surroundings:</strong> Clear hard objects and cushion their head.</li><li><strong>Position safely:</strong> Turn the person gently onto their side to keep their airway clear.</li><li><strong>Provide Support:</strong> Stay until the person is fully alert and offer calm reassurance.</li></ul>
      </ContentPanel>
      <ContentPanel className="faq-guide" summary={t.faq}>
        <h3>Q1: {language === 'en' ? 'Why is text-to-speech not working?' : '為什麼教育模式沒有聲音？'}</h3>
        <p>{language === 'en' ? "This app uses your phone's built-in text-to-speech engine. Download the required voice package, disable silent mode, and raise media volume." : '本應用程式使用手機內置的語音引擎。請下載對應語言包，關閉靜音模式並調高媒體音量。'}</p>
        <h3>Q2: {language === 'en' ? 'What if voice recording fails?' : '玩具模式錄音失敗怎麼辦？'}</h3>
        <p>{language === 'en' ? 'Recording needs microphone permission. Allow browser microphone access and ensure the device is not muted.' : '錄音功能需要麥克風權限。請允許瀏覽器存取麥克風，並確保手機未處於靜音模式。'}</p>
        <h3>Q3: {language === 'en' ? 'Can I use the app offline?' : '如何確保離線時也能使用？'}</h3>
        <p>{language === 'en' ? 'Install this PWA or add it to your home screen after a successful first load.' : '將此 PWA 安裝或加入主畫面，在首次成功載入後即可離線使用核心內容。'}</p>
        <h3>Q4: {language === 'en' ? 'How does the global click counter work?' : '為什麼點擊次數沒有立即更新？'}</h3>
        <p>{language === 'en' ? 'The counter is currently a local demonstration counter stored on this device.' : '計數器目前在本機裝置暫存，用作示範用途。'}</p>
      </ContentPanel>

      <footer className="footer-linktree"><a href="https://linktr.ee/EpilepsyFoundationOfHongKong" target="_blank" rel="noopener noreferrer" className="linktree-btn">🔗 了解更多 Epilepsy Foundation HK</a></footer>
    </main>
  );
}
