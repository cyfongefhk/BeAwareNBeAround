import { useState } from 'react';
import { educationSteps, languages } from './data/educationSteps';
import { translations } from './data/translations';
import { incrementCounter, readCounter } from './services/clickCounter';
import { speak, stopSpeech } from './services/speech';
import { useToyRecordings } from './hooks/useToyRecordings';

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
  const toyRecordings = useToyRecordings();
  const t = translations[language];

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
          <h3>How to Install</h3>
          <ul><li>iPhone: use Safari Share and choose Add to Home Screen.</li><li>Android: use Chrome menu and choose Add to Home screen.</li></ul>
          <h3>How to Operate</h3>
          <ul><li>{t.education}: tap a button to hear the instruction.</li><li>{t.toy}: record and play a voice per button.</li></ul>
        </ContentPanel>
        <button className="install-btn-small">{t.install}</button>
      </div>

      <ContentPanel className="what-is-guide" summary={t.whatIs}>
        <p>"Be Aware of the time. Be Around for the safe recovery."</p>
        <p>"Aware of what to do, Around when it matters most."</p>
      </ContentPanel>
      <ContentPanel className="faq-guide" summary={t.faq}>
        <h3>Text-to-Speech</h3>
        <p>This app uses the device's built-in voice service. Download the required voice package and turn up media volume.</p>
        <h3>Recording</h3>
        <p>Recording needs microphone permission and audio is retained for this session only.</p>
      </ContentPanel>

      <footer className="footer-linktree"><a href="https://linktr.ee/EpilepsyFoundationOfHongKong" target="_blank" rel="noopener noreferrer" className="linktree-btn">🔗 了解更多 Epilepsy Foundation HK</a></footer>
    </main>
  );
}
