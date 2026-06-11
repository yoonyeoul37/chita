const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const SUPABASE_URL = 'https://hpayjkljfexgovjwfifr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXlqa2xqZmV4Z292andmaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDUxNzgsImV4cCI6MjA5NjcyMTE3OH0.L7pB0Hne-XHvWVj4R_XWWLfSqzkWC2-x3zXJG1lrLiY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FILE_PATH = 'C:\\chita\\치타_전국치과_통합DB_최종.xlsx';

// 시술 종류별 컬럼 매핑
const TREATMENT_SHEETS = [
  { sheet: '임플란트_가격', treatment: 'implant',   subtypes: ['Gold','Metal','PFG','PFM','Zirconia','기타','올세라믹'] },
  { sheet: '크라운_가격',   treatment: 'crown',     subtypes: ['Gold','Metal','PFG','PFM','Zirconia','기타','올세라믹'] },
  { sheet: '인레이_가격',   treatment: 'inlay',     subtypes: ['금','도재-CAD/CAM 세라믹','도재-세라믹','레진'] },
];

async function uploadPrices() {
  console.log('📂 엑셀 파일 읽는 중...');
  const workbook = XLSX.readFile(FILE_PATH);

  // 병원 ID 맵 만들기 (병원명+주소 → id)
  console.log('🔍 병원 ID 목록 가져오는 중...');
 let clinics = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, address')
    .range(from, from + 999);
  if (error || !data || data.length === 0) break;
  clinics = clinics.concat(data);
  from += 1000;
  console.log(`  병원 ${clinics.length}개 로드...`);
  if (data.length < 1000) break;
}



  const clinicMap = {};
  clinics.forEach(c => {
    const key = `${c.name}||${c.address}`;
    clinicMap[key] = c.id;
  });

  console.log(`✅ 병원 ${clinics.length}개 매핑 완료`);

  // 시술별 가격 업로드
  for (const { sheet, treatment, subtypes } of TREATMENT_SHEETS) {
    console.log(`\n📋 ${sheet} 처리 중...`);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
    
    let rows = [];
    let success = 0;
    let skip = 0;

    for (const row of data) {
      const key = `${row['병원명']}||${row['주소']}`;
      const clinic_id = clinicMap[key];

      if (!clinic_id) { skip++; continue; }

      for (const subtype of subtypes) {
        const minCol = `${subtype}_최소`;
        const maxCol = `${subtype}_최대`;
        const price_min = row[minCol];
        const price_max = row[maxCol];

        if (price_min && price_min > 0) {
          rows.push({ clinic_id, treatment, subtype, price_min, price_max: price_max || price_min });
        }
      }

      // 500개씩 업로드
      if (rows.length >= 500) {
        const { error } = await supabase.from('prices').insert(rows);
        if (error) console.error('❌ 오류:', error.message);
        else success += rows.length;
        console.log(`  ✅ ${success}개 업로드...`);
        rows = [];
      }
    }

    // 나머지 업로드
    if (rows.length > 0) {
      const { error } = await supabase.from('prices').insert(rows);
      if (error) console.error('❌ 오류:', error.message);
      else success += rows.length;
    }

    console.log(`✅ ${sheet} 완료 — ${success}개 업로드, ${skip}개 건너뜀`);
  }

  console.log('\n🎉 가격 데이터 업로드 완료!');
}

uploadPrices().catch(console.error);