"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

const DESIGN_TYPE = 1;

const GAS_URL = "https://script.google.com/macros/s/AKfycbzWZBmbZePQCLfr1DpRpAmhqSoGiTWU_he5WHh7oWpePgu07vtrd7SHojCx1cWY6ABHog/exec";
const STORAGE_KEY = "dental_form_draft";

export default function CompleteClinicForm() {
  const themes = {
    1: { main: '#1a3a5f', sub: '#f0f7ff', accent: '#4ae3ff', name: 'PREMIUM DENTAL CLINIC' },
    2: { main: '#d14d72', sub: '#fff5f7', accent: '#ffabab', name: 'SAKURA DENTAL CLINIC' },
    3: { main: '#2d7a7a', sub: '#f0f9f9', accent: '#64ccc5', name: 'MINT DENTAL OFFICE' },
    4: { main: '#443721', sub: '#f9f7f2', accent: '#d4af37', name: 'GOLD STANDARD DENTAL' },
  };
  const theme = themes[DESIGN_TYPE as keyof typeof themes];

  const totalSteps = 9;

  const initialFormData = {
    name: '', furigana: '', gender: '', birthday: '',
    zip: '', address: '', phone: '', email: '',
    trigger: '', referrerName: '', referrerReason: '',
    reasons: [] as string[], mainComplaintDetail: '',
    allergy: '', allergyDetail: '', allergyReaction: '',
    anesthesiaStatus: '', anesthesiaDetail: '',
    hospitalStatus: '', diseaseName: '', hospitalName: '',
    medicineStatus: '', medicineNames: '',
    medicineImageBase64: '' as string,
    medicineImageName: '' as string,
    commuteFrom: '', availableDays: [] as string[], commuteCondition: '', preference: '',
    mindset: '', explanationStyle: '',
    currentScore: 5, targetScore: 10,
    brushingTime: [] as string[], brushingDuration: '', tools: [] as string[],
    smoking: '', smokingCount: '', sleepTime: '',
    beverageStatus: '', beverageDetail: '', snackHabit: ''
  };

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [zipLoading, setZipLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const hasStartedRef = useRef(false);
  const submitLockRef = useRef(false);

  const [formData, setFormData] = useState(initialFormData);

  // =========================================================
  // LocalStorage: 途中保存・再開
  // =========================================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.phone || parsed.email) {
          setShowResume(true);
        }
      }
    } catch {}
  }, []);

  const saveToStorage = useCallback((data: typeof initialFormData) => {
    try {
      const { medicineImageBase64, ...rest } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }, []);

  const handleResumeYes = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev: typeof initialFormData) => ({ ...prev, ...parsed }));
      }
    } catch {}
    setShowResume(false);
  };

  const handleResumeNo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowResume(false);
  };

  useEffect(() => {
    if (hasStartedRef.current) {
      saveToStorage(formData);
    }
  }, [formData, saveToStorage]);

  // =========================================================
  // 離脱防止
  // =========================================================
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasStartedRef.current && !isSent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSent]);

  const markStarted = () => { hasStartedRef.current = true; };

  // =========================================================
  // 郵便番号→住所自動補完
  // =========================================================
  const handleZipChange = async (val: string) => {
    setFormData((prev: typeof initialFormData) => ({ ...prev, zip: val }));
    markStarted();
    const clean = val.replace(/-/g, '');
    if (clean.length !== 7) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${clean}`);
      const json = await res.json();
      if (json.results && json.results[0]) {
        const r = json.results[0];
        const addr = `${r.address1}${r.address2}${r.address3}`;
        setFormData((prev: typeof initialFormData) => ({ ...prev, address: addr }));
        setFieldErrors((prev: Record<string, string>) => ({ ...prev, zip: '' }));
      } else {
        setFieldErrors((prev: Record<string, string>) => ({ ...prev, zip: '郵便番号が見つかりませんでした' }));
      }
    } catch {
      setFieldErrors((prev: Record<string, string>) => ({ ...prev, zip: '住所の取得に失敗しました' }));
    } finally {
      setZipLoading(false);
    }
  };

  // =========================================================
  // バリデーション
  // =========================================================
  const phoneRegex = /^[0-9\-\+\(\) ]{10,15}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'お名前は必須です';
    if (!formData.phone.trim()) {
      errors.phone = '電話番号は必須です';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = '正しい電話番号を入力してください（例：090-1234-5678）';
    }
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = '正しいメールアドレスを入力してください';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // お薬手帳画像アップロード
  // =========================================================
  const handleMedicineImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev: Record<string, string>) => ({ ...prev, medicineImage: '5MB以下の画像を選択してください' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setFormData((prev: typeof initialFormData) => ({ ...prev, medicineImageBase64: base64, medicineImageName: file.name }));
      setFieldErrors((prev: Record<string, string>) => ({ ...prev, medicineImage: '' }));
    };
    reader.readAsDataURL(file);
  };

  const removeMedicineImage = () => {
    setImagePreview('');
    setFormData((prev: typeof initialFormData) => ({ ...prev, medicineImageBase64: '', medicineImageName: '' }));
  };

  // =========================================================
  // 画面遷移
  // =========================================================
  const changeStep = (newStep: number, dir: 'forward' | 'backward') => {
    setDirection(dir);
    setStep(newStep);
    window.scrollTo(0, 0);
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    changeStep(step + 1, 'forward');
  };
  const prev = () => changeStep(step - 1, 'backward');
  const goToStep = (s: number) => changeStep(s, s < step ? 'backward' : 'forward');
  const progress = (step / totalSteps) * 100;

  const toggleList = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData((prev: typeof initialFormData) => ({ ...prev, [key]: newList }));
    markStarted();
  };

  const setField = (key: string, value: any) => {
    setFormData((prev: typeof initialFormData) => ({ ...prev, [key]: value }));
    markStarted();
    if (fieldErrors[key]) setFieldErrors((prev: Record<string, string>) => ({ ...prev, [key]: '' }));
  };

  // =========================================================
  // GASへ送信（FormData + no-cors + リトライ + 二重送信防止）
  // =========================================================
  const doFetch = async () => {
    const fd = new FormData();
    fd.append('name',                formData.name);
    fd.append('furigana',            formData.furigana);
    fd.append('gender',              formData.gender);
    fd.append('birthday',            formData.birthday);
    fd.append('zip',                 formData.zip);
    fd.append('address',             formData.address);
    fd.append('phone',               formData.phone);
    fd.append('email',               formData.email);
    fd.append('trigger',             formData.trigger);
    fd.append('referrerName',        formData.referrerName);
    fd.append('referrerReason',      formData.referrerReason);
    fd.append('reasons',             formData.reasons.join(', '));
    fd.append('mainComplaintDetail', formData.mainComplaintDetail);
    fd.append('allergy',             formData.allergy);
    fd.append('allergyDetail',       formData.allergyDetail);
    fd.append('anesthesiaStatus',    formData.anesthesiaStatus);
    fd.append('anesthesiaDetail',    formData.anesthesiaDetail);
    fd.append('hospitalStatus',      formData.hospitalStatus);
    fd.append('diseaseName',         formData.diseaseName);
    fd.append('hospitalName',        formData.hospitalName);
    fd.append('medicineStatus',      formData.medicineStatus);
    fd.append('medicineNames',       formData.medicineNames);
    fd.append('medicineImageName',   formData.medicineImageName);
    fd.append('medicineImageAttached', formData.medicineImageBase64 ? 'あり' : 'なし');
    fd.append('commuteFrom',         formData.commuteFrom);
    fd.append('availableDays',       formData.availableDays.join(', '));
    fd.append('commuteCondition',    formData.commuteCondition);
    fd.append('preference',          formData.preference);
    fd.append('mindset',             formData.mindset);
    fd.append('explanationStyle',    formData.explanationStyle);
    fd.append('currentScore',        String(formData.currentScore));
    fd.append('targetScore',         String(formData.targetScore));
    fd.append('brushingTime',        formData.brushingTime.join(', '));
    fd.append('brushingDuration',    formData.brushingDuration);
    fd.append('tools',               formData.tools.join(', '));
    fd.append('smoking',             formData.smoking);
    fd.append('smokingCount',        formData.smokingCount);
    fd.append('sleepTime',           formData.sleepTime);
    fd.append('beverageStatus',      formData.beverageStatus);
    fd.append('beverageDetail',      formData.beverageDetail);
    fd.append('snackHabit',          formData.snackHabit);
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: fd,
    });
  };

  const handleSubmit = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSending(true);
    setSendError('');
    try {
      await doFetch();
      localStorage.removeItem(STORAGE_KEY);
      setIsSent(true);
    } catch {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await doFetch();
        localStorage.removeItem(STORAGE_KEY);
        setIsSent(true);
      } catch {
        setSendError('送信に失敗しました。通信環境をご確認の上、もう一度お試しください。');
        submitLockRef.current = false;
      }
    } finally {
      setIsSending(false);
    }
  };

  // =========================================================
  // UIコンポーネント・スタイル
  // =========================================================
  const LargeButton = ({ label, isSelected, onClick, type = "check" }: { label: string; isSelected: boolean; onClick: () => void; type?: string }) => (
    <div onClick={onClick} style={{
        padding: '14px', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer',
        border: isSelected ? `3px solid ${theme.main}` : '1px solid #e0e0e0',
        backgroundColor: isSelected ? theme.sub : '#fff',
        display: 'flex', alignItems: 'center', transition: '0.2s'
      }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: type === "radio" ? '50%' : '4px',
        border: `2px solid ${theme.main}`, marginRight: '12px',
        backgroundColor: isSelected ? theme.main : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '12px', flexShrink: 0,
      }}>{isSelected && "✓"}</div>
      <span style={{ fontSize: '15px', fontWeight: isSelected ? 'bold' : '500' }}>{label}</span>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd',
    fontSize: '16px', marginBottom: '4px', outline: 'none', boxSizing: 'border-box'
  };
  const inputErrorStyle: React.CSSProperties = { ...inputStyle, border: '2px solid #e74c3c' };
  const sectionTitle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 'bold', color: theme.main, marginBottom: '15px',
    borderLeft: `5px solid ${theme.main}`, paddingLeft: '10px'
  };
  const navBtnStyle: React.CSSProperties = {
    flex: 1, padding: '15px', background: 'none', border: '1px solid #ddd',
    borderRadius: '12px', color: '#888', cursor: 'pointer', fontSize: '15px'
  };
  const nextBtnStyle: React.CSSProperties = {
    flex: 1, padding: '15px', background: theme.main, color: '#fff',
    borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px'
  };
  const errorText: React.CSSProperties = {
    color: '#e74c3c', fontSize: '12px', marginBottom: '10px', marginTop: '2px', paddingLeft: '4px'
  };
  const questionLabel: React.CSSProperties = {
    fontSize: '14px', fontWeight: 'bold', marginTop: '15px', marginBottom: '8px', display: 'block'
  };

  const animStyle = `
    @keyframes slideInForward {
      from { opacity: 0; transform: translateX(36px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInBackward {
      from { opacity: 0; transform: translateX(-36px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .slide-forward  { animation: slideInForward  0.22s ease-out; }
    .slide-backward { animation: slideInBackward 0.22s ease-out; }
    @media (prefers-reduced-motion: reduce) {
      .slide-forward, .slide-backward { animation: none; }
    }
  `;

  const SummaryRow = ({ label, value }: { label: string; value: string }) =>
    value ? (
      <div style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '12px', color: '#888', minWidth: '120px', flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#333', flex: 1, wordBreak: 'break-all' }}>{value}</span>
      </div>
    ) : null;

  const SummarySection = ({ title, stepNum, children }: { title: string; stepNum: number; children: React.ReactNode }) => (
    <div style={{ marginBottom: '14px', border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.sub, padding: '10px 14px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.main }}>{title}</span>
        <button onClick={() => goToStep(stepNum)} style={{ fontSize: '12px', color: theme.main, background: 'none', border: `1px solid ${theme.main}`, borderRadius: '8px', padding: '3px 10px', cursor: 'pointer' }}>修正</button>
      </div>
      <div style={{ padding: '8px 14px' }}>{children}</div>
    </div>
  );

  // =========================================================
  // 送信完了画面
  // =========================================================
  if (isSent) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: theme.sub }}>
      <div style={{ maxWidth: '500px', background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ color: theme.main }}>予診票の送信完了</h2>
        <p style={{ color: '#555', lineHeight: '1.7' }}>
          ご入力いただきありがとうございました。<br />
          確認メールをお送りしましたのでご確認ください。<br />
          お気をつけてご来院ください。
        </p>
      </div>
    </div>
  );

  // =========================================================
  // メインレンダリング
  // =========================================================
  return (
    <>
      <style>{animStyle}</style>

      {/* 途中保存からの再開ダイアログ */}
      {showResume && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px 24px', maxWidth: '340px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <h3 style={{ color: theme.main, marginBottom: '10px' }}>入力途中のデータがあります</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>前回の続きから入力を再開しますか？</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleResumeNo} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', color: '#888', fontSize: '14px' }}>最初から</button>
              <button onClick={handleResumeYes} style={{ flex: 1, padding: '12px', background: theme.main, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>続きから再開</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '10px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

          {/* ヘッダー */}
          <div style={{ background: theme.main, padding: '25px 20px', color: '#fff', textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', margin: 0, letterSpacing: '1px' }}>{theme.name}</h1>
            <p style={{ margin: '6px 0 12px', fontSize: '12px', opacity: 0.7 }}>STEP {step} / {totalSteps}</p>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.accent, transition: '0.5s', borderRadius: '2px' }} />
            </div>
          </div>

          <div key={step} className={direction === 'forward' ? 'slide-forward' : 'slide-backward'} style={{ padding: '20px' }}>

            {/* ===== STEP 1: 基本情報 ===== */}
            {step === 1 && (
              <div>
                <h2 style={sectionTitle}>患者様の情報</h2>
                <input type="text" placeholder="お名前 *" style={fieldErrors.name ? inputErrorStyle : inputStyle} value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('name', e.target.value); markStarted(); }} />
                {fieldErrors.name && <p style={errorText}>{fieldErrors.name}</p>}
                <input type="text" placeholder="フリガナ" style={{ ...inputStyle, marginTop: '8px' }} value={formData.furigana} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('furigana', e.target.value); markStarted(); }} />
                <span style={questionLabel}>性別</span>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <LargeButton label="男性" isSelected={formData.gender === '男性'} onClick={() => setField('gender', '男性')} type="radio" />
                  <LargeButton label="女性" isSelected={formData.gender === '女性'} onClick={() => setField('gender', '女性')} type="radio" />
                </div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.main }}>生年月日</label>
                <input type="date" style={{ ...inputStyle, marginTop: '4px' }} value={formData.birthday} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('birthday', e.target.value)} />
                <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '15px' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="tel" placeholder="郵便番号（例：100-0001）" style={{ ...inputStyle, paddingRight: '60px' }} value={formData.zip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleZipChange(e.target.value)} />
                    {zipLoading && <span style={{ position: 'absolute', right: '14px', top: '15px', fontSize: '12px', color: '#888' }}>検索中…</span>}
                  </div>
                  {fieldErrors.zip && <p style={errorText}>{fieldErrors.zip}</p>}
                  <input type="text" placeholder="ご住所（郵便番号入力で自動補完されます）" style={{ ...inputStyle, marginTop: '4px' }} value={formData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('address', e.target.value)} />
                  <input type="tel" placeholder="電話番号 * （例：090-1234-5678）" style={fieldErrors.phone ? inputErrorStyle : { ...inputStyle, marginTop: '4px' }} value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('phone', e.target.value); markStarted(); }} />
                  {fieldErrors.phone && <p style={errorText}>{fieldErrors.phone}</p>}
                  <input type="email" placeholder="メールアドレス * （例：sample@example.com）" style={fieldErrors.email ? inputErrorStyle : { ...inputStyle, marginTop: '4px' }} value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setField('email', e.target.value); markStarted(); }} />
                  {fieldErrors.email && <p style={errorText}>{fieldErrors.email}</p>}
                </div>
                <button onClick={next} style={{ width: '100%', padding: '18px', background: theme.main, color: '#fff', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: 'pointer', marginTop: '12px' }}>次へ進む ➔</button>
              </div>
            )}

            {/* ===== STEP 2: 来院のきっかけ ===== */}
            {step === 2 && (
              <div>
                <h2 style={sectionTitle}>来院のきっかけ</h2>
                {['ホームページ', 'Googleマップ', '看板', '知人の紹介', 'Instagram', '通りがかり', 'その他'].map(t => (
                  <LargeButton key={t} label={t} isSelected={formData.trigger === t} onClick={() => setField('trigger', t)} type="radio" />
                ))}
                {formData.trigger === '知人の紹介' && (
                  <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                    <input type="text" placeholder="紹介者のお名前" style={inputStyle} value={formData.referrerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('referrerName', e.target.value)} />
                    <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>紹介いただいた理由</p>
                    {['丁寧だから', '安心安全だから', '治療がとても丁寧だから', 'スタッフがアットホームだから'].map(r => (
                      <LargeButton key={r} label={r} isSelected={formData.referrerReason === r} onClick={() => setField('referrerReason', r)} type="radio" />
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 3: 来院理由 ===== */}
            {step === 3 && (
              <div>
                <h2 style={sectionTitle}>本日の来院理由（複数可）</h2>
                <div style={{ maxHeight: '350px', overflowY: 'auto', border: `1px solid ${theme.sub}`, padding: '10px', borderRadius: '12px', marginBottom: '15px' }}>
                  {['歯が痛い', '詰め物が取れた', '虫歯のチェック', '歯ぐきの腫れ・出血', 'クリーニング・掃除', '矯正の相談', 'ホワイトニング', 'インプラント相談', '入れ歯の相談', '口臭が気になる', '前歯の見た目', '顎が痛い', '検診希望'].map(r => (
                    <LargeButton key={r} label={r} isSelected={formData.reasons.includes(r)} onClick={() => toggleList(formData.reasons, r, 'reasons')} />
                  ))}
                </div>
                <textarea placeholder="自由記入：詳しい症状や特にお困りのことをご記入ください" style={{ ...inputStyle, height: '90px', resize: 'vertical' } as React.CSSProperties} value={formData.mainComplaintDetail} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('mainComplaintDetail', e.target.value)} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 4: アレルギー・持病・麻酔 ===== */}
            {step === 4 && (
              <div>
                <h2 style={sectionTitle}>アレルギー・持病・麻酔</h2>
                <span style={questionLabel}>薬や食べ物のアレルギーはありますか？</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.allergy === v} onClick={() => setField('allergy', v)} type="radio" />)}
                </div>
                {formData.allergy === 'あり' && (
                  <input type="text" placeholder="何のアレルギーですか？（起きた時の状況など）" style={{ ...inputStyle, marginTop: '8px' }} value={formData.allergyDetail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('allergyDetail', e.target.value)} />
                )}
                <span style={questionLabel}>歯科麻酔で気分が悪くなったことはありますか？</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.anesthesiaStatus === v} onClick={() => setField('anesthesiaStatus', v)} type="radio" />)}
                </div>
                {formData.anesthesiaStatus === 'あり' && (
                  <input type="text" placeholder="どのような状態になりましたか？" style={{ ...inputStyle, marginTop: '8px' }} value={formData.anesthesiaDetail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('anesthesiaDetail', e.target.value)} />
                )}
                <span style={questionLabel}>現在通院中の病院はありますか？</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.hospitalStatus === v} onClick={() => setField('hospitalStatus', v)} type="radio" />)}
                </div>
                {formData.hospitalStatus === 'あり' && (
                  <>
                    <input type="text" placeholder="疾患名（病名）" style={{ ...inputStyle, marginTop: '8px' }} value={formData.diseaseName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('diseaseName', e.target.value)} />
                    <input type="text" placeholder="病院名" style={inputStyle} value={formData.hospitalName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('hospitalName', e.target.value)} />
                  </>
                )}
                <span style={questionLabel}>現在服用中のお薬はありますか？</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.medicineStatus === v} onClick={() => setField('medicineStatus', v)} type="radio" />)}
                </div>
                {formData.medicineStatus === 'あり' && (
                  <div style={{ marginTop: '8px' }}>
                    <input type="text" placeholder="薬品名（わかる範囲で）" style={inputStyle} value={formData.medicineNames} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('medicineNames', e.target.value)} />
                    <div style={{ background: theme.sub, padding: '14px', borderRadius: '12px', marginTop: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', color: theme.main, margin: '0 0 10px' }}>📷 お薬手帳の写真を添付（任意）</p>
                      {!imagePreview ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', border: `2px dashed ${theme.main}`, borderRadius: '12px', cursor: 'pointer', background: '#fff', gap: '8px' }}>
                          <span style={{ fontSize: '28px' }}>📷</span>
                          <span style={{ fontSize: '13px', color: theme.main, fontWeight: 'bold' }}>写真を撮る / ファイルを選ぶ</span>
                          <span style={{ fontSize: '11px', color: '#aaa' }}>JPEG・PNG・GIF対応 / 5MBまで</span>
                          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleMedicineImage} />
                        </label>
                      ) : (
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                          <img src={imagePreview} alt="お薬手帳プレビュー" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', border: '1px solid #ddd' }} />
                          <button onClick={removeMedicineImage} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', lineHeight: '28px' }}>✕</button>
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>{formData.medicineImageName}</p>
                        </div>
                      )}
                      {fieldErrors.medicineImage && <p style={errorText}>{fieldErrors.medicineImage}</p>}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 5: 通院条件 ===== */}
            {step === 5 && (
              <div>
                <h2 style={sectionTitle}>通院のご希望</h2>
                <span style={questionLabel}>どちらから来院されますか？</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['自宅', '勤務先'].map(v => <LargeButton key={v} label={v} isSelected={formData.commuteFrom === v} onClick={() => setField('commuteFrom', v)} type="radio" />)}
                </div>
                <span style={questionLabel}>来院可能な曜日（複数可）</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '15px' }}>
                  {['月', '火', '水', '木', '金', '土', '日'].map(d => (
                    <LargeButton key={d} label={d} isSelected={formData.availableDays.includes(d)} onClick={() => toggleList(formData.availableDays, d, 'availableDays')} />
                  ))}
                </div>
                <span style={questionLabel}>時間帯のご希望</span>
                {['医院の予定に合わせる', '午前', '午後', 'PM6時以降しか来れない', '不定期'].map(c => (
                  <LargeButton key={c} label={c} isSelected={formData.commuteCondition === c} onClick={() => setField('commuteCondition', c)} type="radio" />
                ))}
                <span style={questionLabel}>治療へのご要望</span>
                {['なるべく保険内で', '自費含め最善を', '痛みをおさえて', '回数を少なく'].map(v => (
                  <LargeButton key={v} label={v} isSelected={formData.preference === v} onClick={() => setField('preference', v)} type="radio" />
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 6: カウンセリング ===== */}
            {step === 6 && (
              <div>
                <h2 style={sectionTitle}>カウンセリング</h2>
                <span style={questionLabel}>1. 来院時の気持ち</span>
                {['少し不安・怖さがある', '現状をチェックしてもらえるので楽しみ', '普通'].map(m => (
                  <LargeButton key={m} label={m} isSelected={formData.mindset === m} onClick={() => setField('mindset', m)} type="radio" />
                ))}
                <span style={questionLabel}>2. 安心できる説明の受け方</span>
                {['個別でしっかり説明してほしい', '書面や図でわかりやすく説明してほしい', 'ざっくりで構わないが、ポイントだけ知りたい', '説明してもらえるだけで安心できる'].map(s => (
                  <LargeButton key={s} label={s} isSelected={formData.explanationStyle === s} onClick={() => setField('explanationStyle', s)} type="radio" />
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 7: 生活習慣 ===== */}
            {step === 7 && (
              <div>
                <h2 style={sectionTitle}>生活習慣アンケート</h2>
                <span style={questionLabel}>歯磨きのタイミング（複数可）</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '15px' }}>
                  {['起床時', '朝食後', '昼食後', '晩食後', '就寝前'].map(t => (
                    <LargeButton key={t} label={t} isSelected={formData.brushingTime.includes(t)} onClick={() => toggleList(formData.brushingTime, t, 'brushingTime')} />
                  ))}
                </div>
                <span style={questionLabel}>清掃用具の使用（複数可）</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '15px' }}>
                  {['歯ブラシのみ', 'フロス', '歯間ブラシ', '洗口剤', '電動歯ブラシ'].map(t => (
                    <LargeButton key={t} label={t} isSelected={formData.tools.includes(t)} onClick={() => toggleList(formData.tools, t, 'tools')} />
                  ))}
                </div>
                <span style={questionLabel}>喫煙習慣</span>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  {['あり', 'なし', '過去にあり'].map(v => (
                    <LargeButton key={v} label={v} isSelected={formData.smoking === v} onClick={() => setField('smoking', v)} type="radio" />
                  ))}
                </div>
                <div style={{ background: theme.sub, padding: '15px', borderRadius: '15px', marginTop: '10px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 0 }}>
                    今の口の健康意識（10点満点）：<b style={{ color: theme.main }}>{formData.currentScore}点</b>
                  </p>
                  <input type="range" min="0" max="10" step="1" value={formData.currentScore} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('currentScore', parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.main } as React.CSSProperties} />
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '15px' }}>
                    今後の目標スコア（10点満点）：<b style={{ color: theme.main }}>{formData.targetScore}点</b>
                  </p>
                  <input type="range" min="0" max="10" step="1" value={formData.targetScore} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('targetScore', parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.main } as React.CSSProperties} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>確認へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 8: 入力確認サマリー ===== */}
            {step === 8 && (
              <div>
                <h2 style={sectionTitle}>入力内容の確認</h2>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>「修正」ボタンで各ページに戻って内容を変更できます。</p>
                <SummarySection title="患者様の情報" stepNum={1}>
                  <SummaryRow label="お名前" value={formData.name} />
                  <SummaryRow label="フリガナ" value={formData.furigana} />
                  <SummaryRow label="性別" value={formData.gender} />
                  <SummaryRow label="生年月日" value={formData.birthday} />
                  <SummaryRow label="郵便番号" value={formData.zip} />
                  <SummaryRow label="住所" value={formData.address} />
                  <SummaryRow label="電話番号" value={formData.phone} />
                  <SummaryRow label="メールアドレス" value={formData.email} />
                </SummarySection>
                <SummarySection title="来院のきっかけ" stepNum={2}>
                  <SummaryRow label="きっかけ" value={formData.trigger} />
                  <SummaryRow label="紹介者" value={formData.referrerName} />
                  <SummaryRow label="紹介理由" value={formData.referrerReason} />
                </SummarySection>
                <SummarySection title="来院理由" stepNum={3}>
                  <SummaryRow label="症状・理由" value={formData.reasons.join('、')} />
                  <SummaryRow label="詳細" value={formData.mainComplaintDetail} />
                </SummarySection>
                <SummarySection title="アレルギー・持病・麻酔" stepNum={4}>
                  <SummaryRow label="アレルギー" value={formData.allergy} />
                  <SummaryRow label="アレルギー詳細" value={formData.allergyDetail} />
                  <SummaryRow label="麻酔の不具合" value={formData.anesthesiaStatus} />
                  <SummaryRow label="麻酔詳細" value={formData.anesthesiaDetail} />
                  <SummaryRow label="通院中の病院" value={formData.hospitalStatus} />
                  <SummaryRow label="疾患名" value={formData.diseaseName} />
                  <SummaryRow label="病院名" value={formData.hospitalName} />
                  <SummaryRow label="服薬" value={formData.medicineStatus} />
                  <SummaryRow label="薬品名" value={formData.medicineNames} />
                  {formData.medicineImageBase64 && (
                    <div style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>お薬手帳の写真</span>
                      <img src={formData.medicineImageBase64} alt="お薬手帳" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', border: '1px solid #eee' }} />
                      <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{formData.medicineImageName}</p>
                    </div>
                  )}
                </SummarySection>
                <SummarySection title="通院のご希望" stepNum={5}>
                  <SummaryRow label="来院元" value={formData.commuteFrom} />
                  <SummaryRow label="来院可能な曜日" value={formData.availableDays.join('・')} />
                  <SummaryRow label="時間帯のご希望" value={formData.commuteCondition} />
                  <SummaryRow label="治療へのご要望" value={formData.preference} />
                </SummarySection>
                <SummarySection title="カウンセリング" stepNum={6}>
                  <SummaryRow label="来院時の気持ち" value={formData.mindset} />
                  <SummaryRow label="説明の希望" value={formData.explanationStyle} />
                </SummarySection>
                <SummarySection title="生活習慣" stepNum={7}>
                  <SummaryRow label="歯磨きタイミング" value={formData.brushingTime.join('・')} />
                  <SummaryRow label="清掃用具" value={formData.tools.join('・')} />
                  <SummaryRow label="喫煙習慣" value={formData.smoking} />
                  <SummaryRow label="健康意識スコア" value={`${formData.currentScore}点`} />
                  <SummaryRow label="目標スコア" value={`${formData.targetScore}点`} />
                </SummarySection>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={prev} style={navBtnStyle}>戻る</button>
                  <button onClick={next} style={nextBtnStyle}>問題なければ次へ</button>
                </div>
              </div>
            )}

            {/* ===== STEP 9: 当院の想い・送信 ===== */}
            {step === 9 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={sectionTitle}>当院の想い</h2>
                <div style={{ background: theme.sub, padding: '20px', borderRadius: '15px', lineHeight: '1.8', fontSize: '14px', marginBottom: '20px', textAlign: 'left', border: `1px dashed ${theme.main}` }}>
                  <p style={{ margin: 0 }}>
                    我々は <b>"一生自分の歯で食事ができること"</b> をサポートします。<br />
                    メンテナンスを中心とした最小限の治療を追求することが、皆様の人生を豊かにすると信じております。<br />
                    お困りごとは何でもご相談ください。これが当院の夢です。
                  </p>
                </div>
                {isSending && (
                  <div style={{ background: theme.sub, borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '14px', color: theme.main }}>
                    送信中です。しばらくお待ちください…<br />
                    <span style={{ fontSize: '12px', color: '#888' }}>※ 通信状況により少し時間がかかる場合があります（自動リトライあり）</span>
                  </div>
                )}
                {sendError && (
                  <div style={{ background: '#fff0f0', border: '1px solid #ffaaaa', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>
                    {sendError}
                  </div>
                )}
                <button onClick={handleSubmit} disabled={isSending} style={{ width: '100%', padding: '20px', background: isSending ? '#aaa' : theme.main, color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: isSending ? 'not-allowed' : 'pointer', boxShadow: isSending ? 'none' : `0 4px 15px ${theme.main}44`, transition: '0.3s' }}>
                  {isSending ? '送信中…⏳' : '同意して送信する ✉️'}
                </button>
                <button onClick={prev} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>内容を修正する</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
