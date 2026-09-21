import { useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';
import { APP_LOCALES, activateLocale, i18n } from './i18n/setup';
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
  const educationStatus = () => t({ id: 'status.educationDefault', message: 'Education Mode: Click buttons for instructions.' });
  const toyStatus = () => t({ id: 'status.toyDefault', message: 'Toy Mode: Ready.' });
  const [status, setStatus] = useState(educationStatus);
  const [recordMode, setRecordMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const toyRecordings = useToyRecordings();
  const labels = {
    slogan: t({ id: 'header.slogan', message: 'STAY, SAFE, SIDE, HELP' }),
    subtitle: t({ id: 'header.subtitle', message: 'Acute Seizure Management Slogan' }),
    secondarySubtitle: t({ id: 'header.secondarySubtitle', message: '處理急性腦癇發作的口訣' }),
    clicks: t({ id: 'counter.label', message: 'Global Clicks:' }),
    mode: t({ id: 'mode.label', message: 'App Mode:' }),
    education: t({ id: 'mode.education', message: 'Education Mode' }),
    toy: t({ id: 'mode.toy', message: 'Toy Mode (Record/Play)' }),
    recordOff: t({ id: 'record.off', message: 'Record Mode: OFF' }),
    recordOn: t({ id: 'record.on', message: 'Record Mode: ON (Click a button)' }),
    buttons: [
      t({ id: 'action.stay', message: 'STAY' }),
      t({ id: 'action.safe', message: 'SAFE' }),
      t({ id: 'action.side', message: 'SIDE' }),
      t({ id: 'action.help', message: 'HELP' }),
    ],
    guideTitle: t({ id: 'guide.title', message: 'Seizure First Aid Guide' }),
    setup: t({ id: 'setup.summary', message: '📲 Setup & Guide ▼' }),
    install: t({ id: 'install.button', message: '📥 Install App' }),
    whatIs: t({ id: 'whatIs.summary', message: "💡 What is Be Aware n' Be Around? ▼" }),
    faq: t({ id: 'faq.summary', message: '❓ Frequently Asked Questions (FAQ) ▼' }),
  };

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  function changeLanguage(nextLanguage) {
    activateLocale(nextLanguage);
    setLanguage(nextLanguage);
    setStatus(mode === 'edu' ? educationStatus() : toyStatus());
  }

  function changeMode(event) {
    const nextMode = event.target.value;
    stopSpeech();
    toyRecordings.cleanup();
    setRecordMode(false);
    setMode(nextMode);
    setStatus(nextMode === 'edu' ? educationStatus() : toyStatus());
  }

  function activateAction(id) {
    setClicks((current) => incrementCounter(current));
    if (mode !== 'edu') {
      if (recordMode) {
        const outcome = toyRecordings.record(id);
        setStatus(outcome === 'busy' ? t({ id: 'status.recordingBusy', message: 'Please stop the current recording first!' }) : outcome === 'started' ? i18n._({ id: 'status.recording', message: 'Recording on button {id}... (Max 60s)' }, { id }) : toyStatus());
      } else {
        setStatus(toyRecordings.play(id) ? i18n._({ id: 'status.playingRecording', message: 'Playing button {id}...' }, { id }) : t({ id: 'status.noRecording', message: 'No audio recorded yet.' }));
      }
      return;
    }

    const steps = [
      t({ id: 'education.step1', message: 'STAY. Stay calm and time the seizure.' }),
      t({ id: 'education.step2', message: 'SAFE. Observe and keep the person safe. Clear hard objects and cushion their head.' }),
      t({ id: 'education.step3', message: 'SIDE. Gently roll the person onto their side. Never put anything in their mouth.' }),
      t({ id: 'education.step4', message: 'HELP. Seek help. Stay with them until fully conscious, and call an ambulance if it lasts over five minutes.' }),
    ];
    const didSpeak = speak(steps[id - 1], APP_LOCALES[language].speechLocale);
    setStatus(didSpeak ? i18n._({ id: 'status.playingEducation', message: 'Playing education step {id}...' }, { id }) : educationStatus());
  }

  async function toggleRecordMode() {
    if (recordMode) {
      toyRecordings.cleanup();
      setRecordMode(false);
      setStatus(t({ id: 'status.playbackMode', message: 'Playback mode active.' }));
      return;
    }
    if (await toyRecordings.enable()) {
      setRecordMode(true);
      setStatus(t({ id: 'status.readyToRecord', message: 'Ready to record.' }));
    } else {
      setStatus(t({ id: 'status.microphoneRequired', message: 'Microphone permission required.' }));
    }
  }

  async function installApp() {
    if (getInstallAction({ isIOS: isIOS(), prompt: installPrompt }) === 'prompt') {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    window.alert(t({ id: 'install.fallbackAlert', message: "To install, use your browser's Add to Home Screen option." }));
  }

  return (
    <main>
      <div className="top-bar">
        <div className="top-left-group">
          <a href="https://epilepsy.org.hk" target="_blank" rel="noopener noreferrer" className="logo-link">
            <img src={logoUrl} alt={t({ id: 'organization.logoAlt', message: 'Epilepsy Foundation of Hong Kong' })} className="app-logo" />
          </a>
          <div className="org-name">
            <div className="org-name-zh">{t({ id: 'organization.nameChinese', message: '香港腦癇基金會' })}</div>
            <div className="org-name-en">{t({ id: 'organization.name', message: 'Epilepsy Foundation of Hong Kong' })}</div>
          </div>
        </div>
        <div className="lang-selector" aria-label={t({ id: 'language.selectorLabel', message: 'Language' })}>
          {Object.entries(APP_LOCALES).map(([code, { selectorLabel }]) => (
            <button key={code} className={`lang-btn ${language === code ? 'active' : ''}`} aria-pressed={language === code} onClick={() => changeLanguage(code)}>{selectorLabel}</button>
          ))}
        </div>
      </div>

      <header className="header">
        <div className="slogan-chars">{labels.slogan}</div>
        <h1 className="theme-title">{t({ id: 'app.title', message: "Be Aware n' Be Around" })}</h1>
        <div className="subtitle-box">
          <div className="subtitle-primary">{labels.subtitle}</div>
          <div className="subtitle-secondary">{labels.secondarySubtitle}</div>
        </div>
        <div className="counter-box"><span>{labels.clicks}</span> <span>{clicks.toLocaleString()}</span></div>
      </header>

      <section className="controls" aria-label={labels.mode}>
        <div className="toggle-group">
          <label htmlFor="modeSelect">{labels.mode}</label>
          <select id="modeSelect" value={mode} onChange={changeMode}>
            <option value="edu">{labels.education}</option>
            <option value="toy">{labels.toy}</option>
          </select>
        </div>
        {mode === 'toy' && <button className={`record-toggle ${recordMode ? 'active' : ''}`} onClick={toggleRecordMode}>{recordMode ? labels.recordOn : labels.recordOff}</button>}
      </section>

      <section className="grid" aria-label={t({ id: 'actions.ariaLabel', message: 'First aid actions' })}>
        {labels.buttons.map((label, index) => <button key={label} className={`btn-toy button-${index + 1} ${toyRecordings.recordingId === index + 1 ? 'recording-pulse' : ''}`} onClick={() => activateAction(index + 1)}>{label}</button>)}
      </section>

      <p className="status" aria-live="polite">{status}</p>

      <section className="youtube-container">
        <div className="youtube-label">{t({ id: 'video.label', message: '▶️ Acute Seizure Management Animation' })}</div>
        <iframe src="https://www.youtube.com/embed/g9909mQ2dRo?iv_load_policy=3&rel=0&modestbranding=1" title={t({ id: 'video.title', message: 'Acute Seizure Animation' })} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </section>

      <section className="instruction-box">
        <h2>{labels.guideTitle}</h2>
        <p><strong>{labels.buttons[0]}:</strong> {t({ id: 'guide.step1', message: 'Stay calm and time the seizure.' })}</p>
        <p><strong>{labels.buttons[1]}:</strong> {t({ id: 'guide.step2', message: 'Observe and keep the person safe. Clear hard objects and cushion their head.' })}</p>
        <p><strong>{labels.buttons[2]}:</strong> {t({ id: 'guide.step3', message: 'Gently roll the person onto their side. Never put anything in their mouth.' })}</p>
        <p><strong>{labels.buttons[3]}:</strong> {t({ id: 'guide.step4', message: 'Seek help. Stay with them until fully conscious, and call an ambulance if over 5 minutes.' })}</p>
      </section>

      <div className="install-row">
        <ContentPanel className="setup-guide" summary={labels.setup}>
          <h3>{language === 'en' ? 'How to Install' : '如何安裝至手機'}</h3>
          <ul><li><strong>iPhone (iOS):</strong> {language === 'en' ? "Open in Safari, tap Share, then select Add to Home Screen." : '使用 Safari 瀏覽器開啟此網頁，點擊「分享」圖示，然後選擇「加入主畫面」。'}</li><li><strong>Android:</strong> {language === 'en' ? 'Open in Chrome, use the menu, then select Add to Home screen.' : '使用 Chrome 瀏覽器開啟，點擊右上角選單，然後選擇「加到主畫面」。'}</li></ul>
          <h3>{language === 'en' ? 'How to Operate' : '如何操作'}</h3>
          <ul><li><strong>{labels.education}:</strong> {language === 'en' ? 'Tap a button to hear the clinical instruction for that step.' : '點擊顏色按鍵，手機會播放該步驟的急救指示。'}</li><li><strong>{labels.toy}:</strong> {language === 'en' ? 'Turn Record Mode on, tap a button to record for up to 60 seconds, then turn it off to play recordings.' : '開啟錄音模式後，點擊任何顏色按鍵錄製聲音（最長60秒），關閉後點擊按鍵即可播放。'}</li></ul>
        </ContentPanel>
        <button className="install-btn-small" onClick={installApp}>{labels.install}</button>
      </div>

      <ContentPanel className="what-is-guide" summary={labels.whatIs}>
        <p>"Be Aware of the time. Be Around for the safe recovery."</p>
        <p>"Be Aware: Don't restrain. Be Around: Protect and remain."</p>
        <p>"Aware of what to do, Around when it matters most."</p>
        <h3>Be Aware (Mental Vigilance &amp; Safety Knowledge)</h3>
        <ul><li><strong>Recognize &amp; Time:</strong> Note when the seizure starts; call emergency services if it exceeds 5 minutes.</li><li><strong>Know the Don'ts:</strong> Never restrain movement or place anything in the person's mouth.</li><li><strong>Assess Environment:</strong> Spot physical hazards such as sharp corners, water, or stairs.</li></ul>
        <h3>Be Around (Physical Protection &amp; Care)</h3>
        <ul><li><strong>Secure the Surroundings:</strong> Clear hard objects and cushion their head.</li><li><strong>Position safely:</strong> Turn the person gently onto their side to keep their airway clear.</li><li><strong>Provide Support:</strong> Stay until the person is fully alert and offer calm reassurance.</li></ul>
      </ContentPanel>
      <ContentPanel className="faq-guide" summary={labels.faq}>
        <h3>Q1: {language === 'en' ? 'Why is text-to-speech not working?' : '為什麼教育模式沒有聲音？'}</h3>
        <p>{language === 'en' ? "This app uses your phone's built-in text-to-speech engine. Download the required voice package, disable silent mode, and raise media volume." : '本應用程式使用手機內置的語音引擎。請下載對應語言包，關閉靜音模式並調高媒體音量。'}</p>
        <h3>Q2: {language === 'en' ? 'What if voice recording fails?' : '玩具模式錄音失敗怎麼辦？'}</h3>
        <p>{language === 'en' ? 'Recording needs microphone permission. Allow browser microphone access and ensure the device is not muted.' : '錄音功能需要麥克風權限。請允許瀏覽器存取麥克風，並確保手機未處於靜音模式。'}</p>
        <h3>Q3: {language === 'en' ? 'Can I use the app offline?' : '如何確保離線時也能使用？'}</h3>
        <p>{language === 'en' ? 'Install this PWA or add it to your home screen after a successful first load.' : '將此 PWA 安裝或加入主畫面，在首次成功載入後即可離線使用核心內容。'}</p>
        <h3>Q4: {language === 'en' ? 'How does the global click counter work?' : '為什麼點擊次數沒有立即更新？'}</h3>
        <p>{language === 'en' ? 'The counter is currently a local demonstration counter stored on this device.' : '計數器目前在本機裝置暫存，用作示範用途。'}</p>
      </ContentPanel>

      <footer className="footer-linktree"><a href="https://linktr.ee/EpilepsyFoundationOfHongKong" target="_blank" rel="noopener noreferrer" className="linktree-btn">{t({ id: 'footer.linkLabel', message: '🔗 Learn more about Epilepsy Foundation HK' })}</a></footer>
    </main>
  );
}
