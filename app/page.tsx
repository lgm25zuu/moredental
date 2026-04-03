"use client";

import React, { useState } from 'react';

// 【AIデザイン着せ替え設定】
// 1:ネイビー(信頼)  2:サクラ(優しい)  3:ミント(清潔)  4:ゴールド(高級)
const DESIGN_TYPE = 1; 

export default function CompleteClinicForm() {
  // デザインテーマの定義
  const themes = {
    1: { main: '#1a3a5f', sub: '#f0f7ff', accent: '#4ae3ff', name: 'PREMIUM DENTAL CLINIC' },
    2: { main: '#d14d72', sub: '#fff5f7', accent: '#ffabab', name: 'SAKURA DENTAL CLINIC' },
    3: { main: '#2d7a7a', sub: '#f0f9f9', accent: '#64ccc5', name: 'MINT DENTAL OFFICE' },
    4: { main: '#443721', sub: '#f9f7f2', accent: '#d4af37', name: 'GOLD STANDARD DENTAL' },
  };
  const theme = themes[DESIGN_TYPE as keyof typeof themes];

  const [step, setStep] = useState(1);
  const [isSent, setIsSent] = useState(false);

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const [formData, setFormData] = useState({
    name: '', furigana: '', gender: '', birthday: '', zip: '', address: '', phone: '', email: '',
    trigger: '', referrerName: '', referrerReason: '',
    reasons: [] as string[], mainComplaintDetail: '',
    allergy: '', anesthesiaStatus: '', hospitalStatus: '',
    availableDays: [] as string[], commuteCondition: '',
    mindset: '', explanationStyle: '',
    currentScore: 5, targetScore: 10,
    brushingTime: [] as string[], tools: [] as string[]
  });

  const next = () => {
    if (step === 1 && (!formData.name || !formData.phone || !formData.email)) {
      alert("お名前、お電話番号、メールアドレスは必須項目です。");
      return;
    }
    window.scrollTo(0, 0); setStep(step + 1);
  };
  const prev = () => { window.scrollTo(0, 0); setStep(step - 1); };

  const toggleList = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData({ ...formData, [key]: newList });
  };

  // デザインが連動するボタンコンポーネント
  const LargeButton = ({ label, isSelected, onClick, type = "check" }: any) => (
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
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'
      }}>{isSelected && "✓"}</div>
      <span style={{ fontSize: '15px', fontWeight: isSelected ? 'bold' : '500' }}>{label}</span>
    </div>
  );

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '12px', outline: 'none' };
  const sectionTitle = { fontSize: '18px', fontWeight: 'bold', color: theme.main, marginBottom: '15px', borderLeft: `5px solid ${theme.main}`, paddingLeft: '10px' };

  if (isSent) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: theme.sub }}>
        <div style={{ maxWidth: '500px', background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{color: theme.main}}>予診票の送信完了 ✉️</h2>
          <p>ご協力ありがとうございました。お気をつけてご来院ください。</p>
        </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '10px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* ヘッダー：テーマ色が反映 */}
        <div style={{ background: theme.main, padding: '25px 20px', color: '#fff', textAlign: 'center' }}>
          <h1 style={{ fontSize: '18px', margin: 0, letterSpacing: '1px' }}>{theme.name}</h1>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '15px' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.accent, transition: '0.5s' }} />
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {step === 1 && (
            <div>
              <h2 style={sectionTitle}>患者様の情報</h2>
              <input type="text" placeholder="お名前 *" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="フリガナ" style={inputStyle} value={formData.furigana} onChange={e => setFormData({...formData, furigana: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <LargeButton label="男性" isSelected={formData.gender === '男性'} onClick={() => setFormData({...formData, gender: '男性'})} type="radio" />
                <LargeButton label="女性" isSelected={formData.gender === '女性'} onClick={() => setFormData({...formData, gender: '女性'})} type="radio" />
              </div>
              <label style={{fontSize:'12px', fontWeight:'bold', color: theme.main}}>生年月日</label>
              <input type="date" style={inputStyle} value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
              <input type="tel" placeholder="電話番号 *" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input type="email" placeholder="メールアドレス *" style={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <button onClick={next} style={{ width: '100%', padding: '18px', background: theme.main, color: '#fff', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px' }}>次へ進む ➔</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={sectionTitle}>来院のきっかけ</h2>
              {['ホームページ', 'Googleマップ', '看板', '知人の紹介', 'Instagram', '通りがかり', 'その他'].map(t => (
                <LargeButton key={t} label={t} isSelected={formData.trigger === t} onClick={() => setFormData({...formData, trigger: t})} type="radio" />
              ))}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px', background:'none', border:'none', color:'#888'}}>戻る</button><button onClick={next} style={{flex:1, background: theme.main, color:'#fff', borderRadius:'12px', border:'none'}}>次へ</button></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={sectionTitle}>本日の来院理由（複数可）</h2>
              <div style={{maxHeight:'350px', overflowY:'auto', border:`1px solid ${theme.sub}`, padding:'10px', borderRadius:'12px', marginBottom:'15px'}}>
                {/* 項目を増やしてもここがスクロールするので画面が崩れません */}
                {['歯が痛い', '詰め物が取れた', '虫歯のチェック', '歯ぐきの腫れ・出血', 'クリーニング・掃除', '矯正の相談', 'ホワイトニング', 'インプラント相談', '入れ歯の相談', '口臭が気になる', '前歯の見た目', '顎が痛い', '検診希望'].map(r => (
                  <LargeButton key={r} label={r} isSelected={formData.reasons.includes(r)} onClick={() => toggleList(formData.reasons, r, 'reasons')} />
                ))}
              </div>
              <textarea placeholder="自由記入：詳しい症状など" style={{...inputStyle, height:'80px'}} onChange={e => setFormData({...formData, mainComplaintDetail: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}><button onClick={prev} style={{flex:1, padding:'15px', background:'none', border:'none', color:'#888'}}>戻る</button><button onClick={next} style={{flex:1, background: theme.main, color:'#fff', borderRadius:'12px', border:'none'}}>次へ</button></div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={sectionTitle}>アレルギー・持病</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>持病はありますか？</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                {['なし', '高血圧', '糖尿病', '心疾患', '喘息', '骨粗鬆症', '腎疾患', '肝疾患'].map(v => (
                  <LargeButton key={v} label={v} isSelected={formData.hospitalStatus === v} onClick={() => setFormData({...formData, hospitalStatus: v})} type="radio" />
                ))}
              </div>
              <button onClick={next} style={{ width: '100%', padding: '18px', background: theme.main, color: '#fff', borderRadius: '12px', border:'none', marginTop:'20px' }}>次へ</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 style={sectionTitle}>通院のご希望</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>来院可能な曜日</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px', marginBottom:'15px'}}>
                {['月', '火', '水', '木', '金', '土', '日'].map(d => <LargeButton key={d} label={d} isSelected={formData.availableDays.includes(d)} onClick={() => toggleList(formData.availableDays, d, 'availableDays')} />)}
              </div>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>治療へのご要望</p>
              {['なるべく保険内で', '自費含め最善を', '痛みをおさえて', '回数を少なく'].map(v => (
                <LargeButton key={v} label={v} isSelected={formData.commuteCondition === v} onClick={() => setFormData({...formData, commuteCondition: v})} type="radio" />
              ))}
              <button onClick={next} style={{ width: '100%', padding: '18px', background: theme.main, color: '#fff', borderRadius: '12px', border:'none', marginTop:'10px' }}>次へ</button>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 style={sectionTitle}>カウンセリング</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>説明の受け方のご希望</p>
              {['しっかり説明してほしい', '図や写真で見たい', 'ポイントだけ知りたい', 'お任せしたい'].map(s => <LargeButton key={s} label={s} isSelected={formData.explanationStyle === s} onClick={() => setFormData({...formData, explanationStyle: s})} type="radio" />)}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px', background:'none', border:'none', color:'#888'}}>戻る</button><button onClick={next} style={{flex:1, background: theme.main, color:'#fff', borderRadius:'12px', border:'none'}}>次へ</button></div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 style={sectionTitle}>生活習慣</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>清掃用具の使用（複数可）</p>
              {['歯ブラシのみ', 'フロス', '歯間ブラシ', '洗口剤', '電動歯ブラシ'].map(t => <LargeButton key={t} label={t} isSelected={formData.tools.includes(t)} onClick={() => toggleList(formData.tools, t, 'tools')} />)}
              <div style={{background: theme.sub, padding:'15px', borderRadius:'15px', marginTop:'10px'}}>
                <p style={{fontSize:'13px'}}>今の健康意識レベル：<b>{formData.currentScore}点</b></p>
                <input type="range" min="0" max="10" value={formData.currentScore} onChange={e => setFormData({...formData, currentScore: parseInt(e.target.value)})} style={{width:'100%', accentColor: theme.main}} />
              </div>
              <button onClick={next} style={{ width: '100%', padding: '18px', background: theme.main, color: '#fff', borderRadius: '12px', border:'none', marginTop:'20px' }}>最終確認へ</button>
            </div>
          )}

          {step === 8 && (
            <div style={{textAlign:'center'}}>
              <h2 style={sectionTitle}>当院の想い</h2>
              <div style={{ background: theme.sub, padding: '20px', borderRadius: '15px', lineHeight: '1.7', fontSize: '14px', marginBottom: '20px', textAlign: 'left', border: `1px dashed ${theme.main}` }}>
                <p>我々は <b>”一生自分の歯で食事ができること”</b> をサポートします。お困りごとは何でもご相談ください。</p>
              </div>
              <button onClick={() => setIsSent(true)} style={{ width: '100%', padding: '20px', background: theme.main, color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px', boxShadow: `0 4px 15px ${theme.main}44` }}>同意して送信する</button>
              <button onClick={prev} style={{marginTop:'15px', background:'none', border:'none', color:'#888', textDecoration:'underline'}}>内容を修正する</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}"use client";

import React, { useState } from 'react';

export default function CompleteClinicForm() {
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const [formData, setFormData] = useState({
    // Step 1: 基本情報
    name: '', furigana: '', gender: '', birthday: '', 
    zip: '', address: '', phone: '', email: '',
    // Step 2: きっかけ
    trigger: '', referrerName: '', referrerReason: '',
    // Step 3: 来院理由
    reasons: [] as string[], mainComplaintDetail: '',
    // Step 4: アレルギー・持病・麻酔
    allergy: '', allergyDetail: '', allergyReaction: '',
    anesthesiaStatus: '', anesthesiaDetail: '',
    hospitalStatus: '', diseaseName: '', hospitalName: '',
    medicineStatus: '', medicineNames: '',
    // Step 5: 通院条件
    commuteFrom: '', availableDays: [] as string[], commuteCondition: '', preference: '',
    // Step 6: カウンセリング
    mindset: '', explanationStyle: '',
    // Step 7: 生活習慣
    currentScore: 5, targetScore: 10,
    brushingTime: [] as string[], brushingDuration: '', tools: [] as string[],
    smoking: '', smokingCount: '', sleepTime: '', 
    beverageStatus: '', beverageDetail: '', snackHabit: ''
  });

  const next = () => {
    if (step === 1 && (!formData.name || !formData.phone || !formData.email)) {
      alert("お名前、お電話番号、メールアドレスは必須項目です。");
      return;
    }
    window.scrollTo(0, 0); 
    setStep(step + 1);
  };
  
  const prev = () => { window.scrollTo(0, 0); setStep(step - 1); };

  const toggleList = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData({ ...formData, [key]: newList });
  };

  const LargeButton = ({ label, isSelected, onClick, type = "check" }: any) => (
    <div onClick={onClick} style={{
        padding: '14px', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer',
        border: isSelected ? '3px solid #1a3a5f' : '1px solid #e0e0e0',
        backgroundColor: isSelected ? '#f0f7ff' : '#fff',
        display: 'flex', alignItems: 'center', transition: '0.2s'
      }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: type === "radio" ? '50%' : '4px',
        border: '2px solid #1a3a5f', marginRight: '12px', 
        backgroundColor: isSelected ? '#1a3a5f' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'
      }}>{isSelected && "✓"}</div>
      <span style={{ fontSize: '15px', fontWeight: isSelected ? 'bold' : '500' }}>{label}</span>
    </div>
  );

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '12px', outline: 'none' };
  const sectionTitle = { fontSize: '18px', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '15px', borderLeft: '5px solid #1a3a5f', paddingLeft: '10px' };

  if (isSent) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f7f9' }}>
        <div style={{ maxWidth: '500px', background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
          <h2>予診票の送信完了 ✉️</h2>
          <p>ご協力ありがとうございました。お気をつけてご来院ください。</p>
        </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '10px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        <div style={{ background: '#1a3a5f', padding: '20px', color: '#fff', textAlign: 'center' }}>
          <h1 style={{ fontSize: '16px', margin: 0 }}>PREMIUM DENTAL CLINIC</h1>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '10px' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4ae3ff' }} />
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {step === 1 && (
            <div>
              <h2 style={sectionTitle}>患者様の情報</h2>
              <input type="text" placeholder="お名前 *" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="フリガナ" style={inputStyle} value={formData.furigana} onChange={e => setFormData({...formData, furigana: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <LargeButton label="男性" isSelected={formData.gender === '男性'} onClick={() => setFormData({...formData, gender: '男性'})} type="radio" />
                <LargeButton label="女性" isSelected={formData.gender === '女性'} onClick={() => setFormData({...formData, gender: '女性'})} type="radio" />
              </div>
              <label style={{fontSize:'12px', fontWeight:'bold'}}>生年月日</label>
              <input type="date" style={inputStyle} value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
              
              <div style={{borderTop:'1px solid #eee', marginTop:'10px', paddingTop:'15px'}}>
                <input type="tel" placeholder="郵便番号" style={inputStyle} value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                <input type="text" placeholder="ご住所" style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <input type="tel" placeholder="電話番号 *" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="email" placeholder="メールアドレス *" style={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <button onClick={next} style={{ width: '100%', padding: '16px', background: '#1a3a5f', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }}>次へ進む ➔</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={sectionTitle}>来院のきっかけ</h2>
              {['ホームページ', 'Googleマップ', '看板', '知人の紹介', 'その他'].map(t => (
                <LargeButton key={t} label={t} isSelected={formData.trigger === t} onClick={() => setFormData({...formData, trigger: t})} type="radio" />
              ))}
              {formData.trigger === '知人の紹介' && (
                <div style={{background:'#f9f9f9', padding:'15px', borderRadius:'12px', marginTop:'10px'}}>
                  <input type="text" placeholder="紹介者のお名前" style={inputStyle} onChange={e => setFormData({...formData, referrerName: e.target.value})} />
                  <p style={{fontSize:'13px', fontWeight:'bold', marginBottom:'5px'}}>紹介理由</p>
                  {['丁寧だから', '安心安全だから', '治療がとても丁寧だから', 'スタッフがアットホームだから'].map(r => (
                    <LargeButton key={r} label={r} isSelected={formData.referrerReason === r} onClick={() => setFormData({...formData, referrerReason: r})} type="radio" />
                  ))}
                </div>
              )}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>次へ</button></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={sectionTitle}>本日の来院理由</h2>
              <div style={{maxHeight:'250px', overflowY:'auto', border:'1px solid #eee', padding:'10px', borderRadius:'12px', marginBottom:'15px'}}>
                {['歯が痛い', '詰め物が取れた', '虫歯', '歯茎の腫れ', 'クリーニング', '矯正相談', 'ホワイトニング', 'インプラント相談'].map(r => (
                  <LargeButton key={r} label={r} isSelected={formData.reasons.includes(r)} onClick={() => toggleList(formData.reasons, r, 'reasons')} />
                ))}
              </div>
              <textarea placeholder="詳しい症状や、特にお困りのことをご記入ください" style={{...inputStyle, height:'100px'}} onChange={e => setFormData({...formData, mainComplaintDetail: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>次へ</button></div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={sectionTitle}>アレルギー・持病・麻酔</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>薬や食べ物のアレルギーはありますか？</p>
              <div style={{display:'flex', gap:'10px'}}>{['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.allergy === v} onClick={() => setFormData({...formData, allergy: v})} type="radio" />)}</div>
              {formData.allergy === 'あり' && <input type="text" placeholder="何のアレルギーですか？（起きた時の状況など）" style={inputStyle} onChange={e => setFormData({...formData, allergyDetail: e.target.value})} />}

              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>歯科麻酔で気分が悪くなったことはありますか？</p>
              <div style={{display:'flex', gap:'10px'}}>{['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.anesthesiaStatus === v} onClick={() => setFormData({...formData, anesthesiaStatus: v})} type="radio" />)}</div>
              {formData.anesthesiaStatus === 'あり' && <input type="text" placeholder="どのような状態になりましたか？" style={inputStyle} onChange={e => setFormData({...formData, anesthesiaDetail: e.target.value})} />}

              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>現在通院中の病院はありますか？</p>
              <div style={{display:'flex', gap:'10px'}}>{['あり', 'なし'].map(v => <LargeButton key={v} label={v} isSelected={formData.hospitalStatus === v} onClick={() => setFormData({...formData, hospitalStatus: v})} type="radio" />)}</div>
              {formData.hospitalStatus === 'あり' && (
                <>
                  <input type="text" placeholder="疾患名（病名）" style={inputStyle} onChange={e => setFormData({...formData, diseaseName: e.target.value})} />
                  <input type="text" placeholder="病院名" style={inputStyle} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
                </>
              )}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>次へ</button></div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 style={sectionTitle}>通院のご希望</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>どちらから来院されますか？</p>
              <div style={{display:'flex', gap:'10px'}}>{['自宅', '勤務先'].map(v => <LargeButton key={v} label={v} isSelected={formData.commuteFrom === v} onClick={() => setFormData({...formData, commuteFrom: v})} type="radio" />)}</div>
              
              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>来院可能な曜日</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px'}}>
                {['月', '火', '水', '木', '金', '土', '日'].map(d => <LargeButton key={d} label={d} isSelected={formData.availableDays.includes(d)} onClick={() => toggleList(formData.availableDays, d, 'availableDays')} />)}
              </div>

              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>時間帯のご希望</p>
              <div style={{maxHeight:'150px', overflowY:'auto'}}>
                {['医院の予定に合わせる', '午前', '午後', 'PM6時以降しか来れない', '不定期'].map(c => <LargeButton key={c} label={c} isSelected={formData.commuteCondition === c} onClick={() => setFormData({...formData, commuteCondition: c})} type="radio" />)}
              </div>
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>次へ</button></div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 style={sectionTitle}>カウンセリング</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>1. 来院時の気持ち</p>
              {['少し不安・怖さがある', '現状をチェックしてもらえるので楽しみ', '普通'].map(m => <LargeButton key={m} label={m} isSelected={formData.mindset === m} onClick={() => setFormData({...formData, mindset: m})} type="radio" />)}
              
              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>2. 安心できる説明の受け方</p>
              {['個別でしっかり説明してほしい', '書面や図でわかりやすく説明してほしい', 'ざっくりで構わないが、ポイントだけ知りたい', '説明してもらえるだけで安心できる'].map(s => <LargeButton key={s} label={s} isSelected={formData.explanationStyle === s} onClick={() => setFormData({...formData, explanationStyle: s})} type="radio" />)}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>次へ</button></div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 style={sectionTitle}>生活習慣アンケート</h2>
              <p style={{fontSize:'14px', fontWeight:'bold'}}>歯磨きのタイミング（複数可）</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
                {['起床時', '朝食後', '昼食後', '晩食後', '就寝前'].map(t => <LargeButton key={t} label={t} isSelected={formData.brushingTime.includes(t)} onClick={() => toggleList(formData.brushingTime, t, 'brushingTime')} />)}
              </div>
              
              <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>清掃用具</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', marginBottom:'15px'}}>
                {['フロス', '歯間ブラシ', '洗口剤'].map(t => <LargeButton key={t} label={t} isSelected={formData.tools.includes(t)} onClick={() => toggleList(formData.tools, t, 'tools')} />)}
              </div>

              <div style={{background:'#f0f7ff', padding:'15px', borderRadius:'15px'}}>
                <p style={{fontSize:'14px', fontWeight:'bold'}}>今の健康状態（10点満点）：{formData.currentScore}点</p>
                <input type="range" min="0" max="10" value={formData.currentScore} onChange={e => setFormData({...formData, currentScore: parseInt(e.target.value)})} style={{width:'100%', accentColor:'#1a3a5f'}} />
                
                <p style={{fontSize:'14px', fontWeight:'bold', marginTop:'15px'}}>今後の目標（10点満点）：{formData.targetScore}点</p>
                <input type="range" min="0" max="10" value={formData.targetScore} onChange={e => setFormData({...formData, targetScore: parseInt(e.target.value)})} style={{width:'100%', accentColor:'#1a3a5f'}} />
              </div>

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}><button onClick={prev} style={{flex:1, padding:'15px'}}>戻る</button><button onClick={next} style={{flex:1, background:'#1a3a5f', color:'#fff', borderRadius:'12px'}}>最後へ</button></div>
            </div>
          )}

          {step === 8 && (
            <div style={{textAlign:'center'}}>
              <h2 style={sectionTitle}>当院の想い</h2>
              <div style={{ background: '#f0f7ff', padding: '20px', borderRadius: '15px', lineHeight: '1.8', fontSize: '15px', marginBottom: '20px', textAlign: 'left' }}>
                <p>我々は <b>”あなたに寄り添う歯医者さん”</b> を目指しています。メンテナンスを中心とした最小限の治療を追求することが、皆様の人生を豊かにすると信じております。これが当院の夢です。</p>
              </div>
              <button onClick={() => setIsSent(true)} style={{ width: '100%', padding: '20px', background: '#28a745', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px' }}>同意して送信する</button>
              <button onClick={prev} style={{marginTop:'15px', background:'none', border:'none', color:'#888'}}>内容を修正する</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
