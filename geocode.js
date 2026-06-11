const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://hpayjkljfexgovjwfifr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXlqa2xqZmV4Z292andmaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDUxNzgsImV4cCI6MjA5NjcyMTE3OH0.L7pB0Hne-XHvWVj4R_XWWLfSqzkWC2-x3zXJG1lrLiY';
const KAKAO_KEY = 'e977583e7fc6befd6e83fe3d32d33e26';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function geocodeByAddress(address) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(address);
    const options = {
      hostname: 'dapi.kakao.com',
      path: `/v2/local/search/address.json?query=${query}`,
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.documents && json.documents.length > 0) {
            resolve({ lat: parseFloat(json.documents[0].y), lng: parseFloat(json.documents[0].x) });
          } else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function geocodeByKeyword(address) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(address);
    const options = {
      hostname: 'dapi.kakao.com',
      path: `/v2/local/search/keyword.json?query=${query}`,
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.documents && json.documents.length > 0) {
            resolve({ lat: parseFloat(json.documents[0].y), lng: parseFloat(json.documents[0].x) });
          } else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// 주소 전처리 - 쉼표 앞부분만 사용
function cleanAddress(address) {
  return address.split(',')[0].trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllClinics() {
  let all = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('clinics')
      .select('id, address')
      .is('lat', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) break;
    all = [...all, ...data];
    console.log(`📦 ${all.length}개 로드됨...`);
    if (data.length < pageSize) break;
    page++;
  }

  return all;
}

async function main() {
  console.log('치과 데이터 로딩 중...');
  const clinics = await fetchAllClinics();
  console.log(`총 ${clinics.length}개 변환 시작...`);

  let success = 0;
  let fail = 0;

  for (const clinic of clinics) {
    const cleanedAddress = cleanAddress(clinic.address);

    // 1차: 원본 주소로 검색
    let coords = await geocodeByAddress(clinic.address);

    // 2차: 쉼표 앞부분만으로 검색
    if (!coords && cleanedAddress !== clinic.address) {
      await sleep(100);
      coords = await geocodeByAddress(cleanedAddress);
    }

    // 3차: 키워드 검색
    if (!coords) {
      await sleep(100);
      coords = await geocodeByKeyword(cleanedAddress);
    }

    if (coords) {
      await supabase.from('clinics').update({ lat: coords.lat, lng: coords.lng }).eq('id', clinic.id);
      success++;
      console.log(`✅ ${clinic.id} → ${coords.lat}, ${coords.lng}`);
    } else {
      fail++;
      console.log(`❌ ${clinic.id} - ${clinic.address}`);
    }
    await sleep(100);
  }

  console.log(`\n완료! 성공: ${success}, 실패: ${fail}`);
}

main();