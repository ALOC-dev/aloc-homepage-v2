import { useState } from 'react'

type Response = 'none' | 'joined' | 'declined'

export default function NoticeAlert() {
  const [response, setResponse] = useState<Response>('none')
  const [closing, setClosing] = useState(false)
  const [removed, setRemoved] = useState(false)

  if (removed) return null

  return (
    <div
      className='w-full max-w-xs rounded-2xl border border-white/60 bg-white/95 p-5 text-center shadow-[0_30px_60px_-20px_rgba(28,27,41,0.55)] backdrop-blur-xl transition-all duration-200'
      style={{
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(0.92) translateY(6px)' : 'none',
      }}
      onTransitionEnd={() => closing && setRemoved(true)}
      role='alertdialog'
      aria-label='지식공유회 알림'
    >
      <h2 className='font-display text-[15px] leading-snug font-semibold text-ink'>
        이번 주 지식공유회에
        <br />
        참가하시겠어요?
      </h2>
      <p className='mt-2 text-[13px] leading-relaxed text-muted'>
        매주 목요일 저녁, 그 주에 공부한 걸 함께 나눠요. 신청하면 자리를
        비워둘게요.
      </p>

      {response === 'none' ? (
        <div className='mt-4 flex flex-col gap-1.5'>
          <button
            type='button'
            onClick={() => setResponse('joined')}
            className='rounded-xl bg-[#0A84FF] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0A84FF]/90'
          >
            참가 신청
          </button>
          <button
            type='button'
            onClick={() => setResponse('declined')}
            className='rounded-xl bg-[#ff6961]/15 px-4 py-2 text-[13px] font-semibold text-[#d1332a] transition-colors hover:bg-[#ff6961]/25'
          >
            신청 취소
          </button>
          <button
            type='button'
            onClick={() => setClosing(true)}
            className='rounded-xl bg-black/5 px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-black/10'
          >
            나중에
          </button>
        </div>
      ) : (
        <div className='mt-4 flex flex-col items-center gap-1.5'>
          <p className='text-[13px] font-medium text-ink'>
            {response === 'joined'
              ? '참가 신청 완료! 목요일에 봐요'
              : '신청이 취소됐어요'}
          </p>
          <button
            type='button'
            onClick={() => setResponse('none')}
            className='text-[12px] font-medium text-accent hover:underline'
          >
            되돌리기
          </button>
        </div>
      )}
    </div>
  )
}
