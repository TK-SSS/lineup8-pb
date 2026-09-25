'use client'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <div className="bg-violet-600 px-4 py-4 flex items-center mb-6">
        <button onClick={() => router.back()} className="text-white/80 mr-3 p-1 -ml-1">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-white font-bold text-xl text-center pr-7">プライバシーポリシー</h1>
      </div>

      <div className="px-5 flex flex-col gap-6 max-w-2xl mx-auto text-sm leading-relaxed">
        <p className="text-violet-400 text-xs">制定日：2026年9月25日</p>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">1. 事業者</h2>
          <p className="text-violet-100">LineUp 8 アプリ（以下「本サービス」）は、個人が開発・運営するウェブアプリケーションです。お問い合わせは下記の連絡先までご連絡ください。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">2. 収集する個人情報</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>メールアドレス（アカウント作成・ログイン時）</li>
            <li>チーム名（任意。設定画面で入力した場合）</li>
            <li>試合データ・選手データ（アプリ内で入力したもの）</li>
            <li>最終アクセス日時</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">3. 利用目的</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>アカウント認証・管理</li>
            <li>本サービスの機能提供（選手・試合データの保存・表示）</li>
            <li>サービス改善のためのフィードバック対応</li>
            <li>不正利用の防止</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">4. 第三者提供</h2>
          <p className="text-violet-100">ご提供いただいた個人情報は、以下の場合を除き第三者に提供しません。</p>
          <ul className="list-disc list-inside text-violet-100 space-y-1 mt-2">
            <li>法令に基づく場合</li>
            <li>インフラ提供者（後述）へのシステム的な送信</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">5. 外国への個人情報移転</h2>
          <p className="text-violet-100 mb-2">本サービスは、データベース・認証基盤として <strong className="text-violet-300">Supabase, Inc.（米国）</strong> を使用しています。これに伴い、お客様の個人情報は米国に移転されます。</p>
          <p className="text-violet-100">Supabase は SOC 2 Type II 認証を取得しており、GDPR に準拠したデータ保護措置を講じています。詳細は <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">Supabase プライバシーポリシー</a> をご参照ください。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">6. 保存期間</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>アカウント削除時に、すべてのデータを速やかに消去します。</li>
            <li>180日間（約6ヶ月）アクセスのないアカウントは、事前通知なく自動削除されます。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">7. お客様の権利</h2>
          <p className="text-violet-100 mb-2">お客様は個人情報保護法に基づき、以下の権利を有します。</p>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li><strong className="text-violet-300">開示・訂正：</strong>設定画面からチーム名の変更が可能です。それ以外の開示・訂正はお問い合わせください。</li>
            <li><strong className="text-violet-300">削除：</strong>設定画面の「アカウント削除」からすべてのデータを削除できます。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">8. Cookie について</h2>
          <p className="text-violet-100">本サービスは認証維持のみを目的とした Cookie を使用します。広告・トラッキング目的の Cookie は一切使用していません。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">9. 改定</h2>
          <p className="text-violet-100">本ポリシーは法令改正やサービス変更に応じて改定することがあります。重要な変更はアプリ内でお知らせします。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">10. お問い合わせ</h2>
          <p className="text-violet-100">個人情報の取り扱いに関するお問い合わせは、設定画面の「フィードバック」よりご連絡ください。</p>
        </section>
      </div>
    </div>
  )
}
