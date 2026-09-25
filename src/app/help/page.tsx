'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Section = { title: string; content: string[]; warning?: boolean }

const sections: Section[] = [
  {
    title: '基本の使い方',
    content: [
      '① 選手管理で選手を登録します。',
      '② 試合リストで試合を新規作成します。',
      '③ 試合をタップしてスタメン画面を開きます。',
      '④ ベンチの選手トークンをコートへドラッグ＆ドロップしてポジションに配置します。',
      '⑤ 控え・交代選手を管理して試合に備えます。',
    ],
  },
  {
    title: '選手の登録・編集',
    content: [
      '「選手管理」画面下部の「選手を追加」ボタンをタップします。',
      '背番号と名前を入力して「追加」をタップします。',
      '登録済み選手の鉛筆アイコンで編集、ゴミ箱アイコンで削除できます。',
      '選手はスタメン・控えどちらにも配置できます。',
    ],
  },
  {
    title: '試合の作成・管理',
    content: [
      '「試合リスト」画面右上の「＋ 新規作成」で試合を追加します。',
      '試合をタップするとスタメン設定画面が開きます。',
      '試合をスワイプするか削除アイコンで削除できます。',
      'メモアイコンをタップして試合メモを記録できます。',
      '試合結果（スコア）も記録できます。',
    ],
  },
  {
    title: 'スタメンの設定',
    content: [
      'ベンチの選手トークンをコートへドラッグ＆ドロップしてポジションに配置します。',
      'コート上の選手同士をドラッグして入れ替えることもできます。',
      '選手トークンをダブルタップするとお休み（欠席）設定ができます。',
      '交代ボタンでコート上の選手とベンチを入れ替えられます。',
      'フォーメーション（3-3-1、4-2-1 など）は試合作成時に選択します。',
    ],
  },
  {
    title: 'データの保存',
    content: [
      'データはサーバーに自動保存されます。',
      '複数のデバイスで同じアカウントを使えます。',
      'オフライン時は端末内に一時保存し、オンライン復帰時に同期します。',
      'チーム名は設定画面から変更できます。',
    ],
  },
  {
    title: 'ログアウト・アカウント削除',
    content: [
      '30日間アプリを使用しない場合、自動的にログアウトされます。',
      '6ヶ月間アクセスがないアカウントは自動的に削除されます。',
      '削除されたアカウントのデータは復元できません。',
      '継続してご利用の場合は定期的にアプリを開いてください。',
    ],
    warning: true,
  },
  {
    title: 'テーマカラー',
    content: [
      '設定画面の「テーマカラー」からアプリの色を変更できます。',
      'バイオレット・ブルー・グリーン・ローズ・アンバーの5色から選択できます。',
      '選んだカラーはこのデバイスに保存されます。',
    ],
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-black text-white pb-4">
      <div className="bg-violet-600 px-4 py-4 flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-white/80 mr-3 p-1 -ml-1"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-white font-bold text-xl text-center pr-7">使い方</h1>
      </div>

      <div className="px-4 flex flex-col gap-2">
        {sections.map((s, i) => (
          <div key={i} className={`border rounded-xl overflow-hidden ${s.warning ? 'bg-rose-950/40 border-rose-800/50' : 'bg-violet-950/50 border-violet-800/40'}`}>
            <button
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className={`font-semibold text-sm flex items-center gap-2 ${s.warning ? 'text-rose-300' : 'text-white'}`}>
                {s.warning && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
                {s.title}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${s.warning ? 'text-rose-500' : 'text-violet-400'}`}
                style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {openIndex === i && (
              <ul className={`px-4 pb-4 flex flex-col gap-2 border-t ${s.warning ? 'border-rose-800/50' : 'border-violet-800/40'}`}>
                {s.content.map((line, j) => (
                  <li key={j} className="flex gap-2 pt-2">
                    <span className={`mt-0.5 shrink-0 ${s.warning ? 'text-rose-500' : 'text-violet-400'}`}>
                      <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </span>
                    <span className={`text-sm leading-relaxed ${s.warning ? 'text-rose-200' : 'text-violet-200'}`}>{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="mt-4 bg-violet-950/30 border border-violet-800/30 rounded-xl px-4 py-3">
          <p className="text-violet-500 text-xs text-center">
            ご不明な点は開発者までお問い合わせください
          </p>
        </div>
      </div>
    </div>
  )
}
