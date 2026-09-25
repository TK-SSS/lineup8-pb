'use client'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <div className="bg-violet-600 px-4 py-4 flex items-center mb-6">
        <button onClick={() => router.back()} className="text-white/80 mr-3 p-1 -ml-1">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-white font-bold text-xl text-center pr-7">利用規約</h1>
      </div>

      <div className="px-5 flex flex-col gap-6 max-w-2xl mx-auto text-sm leading-relaxed">
        <p className="text-violet-400 text-xs">制定日：2026年9月25日</p>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第1条（適用）</h2>
          <p className="text-violet-100">本利用規約（以下「本規約」）は、LineUp 8（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意のうえ本サービスを利用するものとします。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第2条（利用資格）</h2>
          <p className="text-violet-100">本サービスは 18 歳以上の方を対象としています。18 歳未満の方が利用する場合は、保護者の同意を得てください。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第3条（アカウント）</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>1人につき1アカウントの利用を原則とします。</li>
            <li>アカウント情報（パスワード等）は自己の責任で管理してください。</li>
            <li>不正利用が確認された場合、予告なくアカウントを停止することがあります。</li>
            <li>180日間アクセスのないアカウントは自動削除されます。データの復元はできません。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第4条（禁止事項）</h2>
          <p className="text-violet-100 mb-2">以下の行為を禁止します。</p>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>法令または公序良俗に反する行為</li>
            <li>他のユーザーへの迷惑行為・不正アクセス</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>虚偽の情報を登録する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第5条（データ・コンテンツ）</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>ユーザーが登録したデータ（選手名、試合情報等）の著作権はユーザーに帰属します。</li>
            <li>運営者はサービス提供の目的に限り、データを参照することがあります。</li>
            <li>アカウント削除時、すべてのデータは復元不可能な形で削除されます。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第6条（サービスの変更・終了）</h2>
          <p className="text-violet-100">運営者は、ユーザーへの事前通知なしにサービスの内容変更・一時停止・終了を行うことがあります。これによる損害について運営者は責任を負いません。</p>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第7条（免責事項）</h2>
          <ul className="list-disc list-inside text-violet-100 space-y-1">
            <li>本サービスは現状有姿（as-is）で提供されます。特定目的への適合性を保証しません。</li>
            <li>データの損失・消失について、運営者は責任を負いません。重要なデータはご自身でバックアップを取ることを推奨します。</li>
            <li>本サービスの利用により生じた損害について、運営者の故意または重過失を除き責任を負いません。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-violet-300 font-semibold mb-2">第8条（準拠法・管轄）</h2>
          <p className="text-violet-100">本規約は日本法に準拠します。本サービスに関する紛争については、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
        </section>
      </div>
    </div>
  )
}
