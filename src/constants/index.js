export const BLUE  = '#2563EB';
export const WHITE = '#FFFFFF';
export const BG    = '#F9FAFB';
export const GRAY  = '#6B7280';
export const PAGE  = 20;

export const TREATMENTS = [
  { key: 'implant',   label: '임플란트', icon: 'medkit-outline',   avg: '105만원~' },
  { key: 'crown',     label: '크라운',   icon: 'diamond-outline',  avg: '38만원~'  },
  { key: 'inlay',     label: '인레이',   icon: 'cube-outline',     avg: '18만원~'  },
  { key: 'whitening', label: '미백',     icon: 'sparkles-outline', avg: '29만원~'  },
  { key: 'scaling',   label: '스케일링', icon: 'flash-outline',    avg: '1.8만원~' },
];

export const REGIONS = [
  '전체','서울특별시','경기도','인천광역시','부산광역시',
  '대구광역시','광주광역시','대전광역시','울산광역시','제주특별자치도'
];

export const SUBTYPE_KR = {
  'Gold': '골드', 'Metal': '메탈', 'PFG': 'PFG(금+도재)',
  'PFM': 'PFM(금속+도재)', 'Zirconia': '지르코니아',
  '올세라믹': '올세라믹', '기타': '기타', '금': '금',
  '도재-세라믹': '도재-세라믹', '도재-CAD/CAM 세라믹': '도재-CAD/CAM', '레진': '레진',
};

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);
  if (min  < 60)  return `${min}분 전`;
  if (hour < 24)  return `${hour}시간 전`;
  return `${day}일 전`;
}