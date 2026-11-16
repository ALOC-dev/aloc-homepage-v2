/** 한글 아이디 정규화: NFC + 앞뒤 공백 제거 + 연속 공백 1칸으로 ("5기  김정묵 " → "5기 김정묵") */
export const normalizeLoginId = (loginId: string) =>
  loginId.normalize('NFC').trim().replace(/\s+/g, ' ')
