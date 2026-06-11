import { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import { useBookmarks } from '../hooks/useBookmarks';
import { BLUE, WHITE, BG, GRAY, PAGE, TREATMENTS } from '../constants';

export default function SearchScreen({ route, navigation }) {
  const { treatment, region, sigungu, userCoords, radiusKm } = route.params || {};
  const tr = treatment || TREATMENTS[0];
  const { isBookmarked, toggle } = useBookmarks();

  const [clinics,     setClinics]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(0);
  const [hasMore,     setHasMore]     = useState(true);
  const [sort,        setSort]        = useState('price');

  const fetchClinics = useCallback(async (pageNum = 0, reset = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    try {
      let clinicData = [];

      if (radiusKm && userCoords) {
        // 반경 검색
        const { data, error } = await supabase.rpc('nearby_clinics', {
          user_lat: userCoords.lat,
          user_lng: userCoords.lng,
          radius_km: radiusKm,
        });
        if (!error && data) clinicData = data;
      } else {
        // 지역 검색
        let clinicQuery = supabase.from('clinics')
          .select('id,name,phone,address,sido,sigungu,grade,lat,lng');
        if (region && region !== '전체') clinicQuery = clinicQuery.eq('sido', region);
        if (sigungu) clinicQuery = clinicQuery.eq('sigungu', sigungu);
        const { data } = await clinicQuery;
        if (data) clinicData = data;
      }

      if (clinicData.length === 0) {
        if (reset) setClinics([]);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // 가격 조회
      const clinicIds = clinicData.map(c => c.id);
      const { data: priceData } = await supabase
        .from('prices').select('clinic_id, price_min')
        .eq('treatment', tr.key)
        .in('clinic_id', clinicIds);

      const priceMap = {};
      if (priceData) {
        priceData.forEach(p => {
          if (!priceMap[p.clinic_id] || p.price_min < priceMap[p.clinic_id]) {
            priceMap[p.clinic_id] = p.price_min;
          }
        });
      }

      let result = clinicData
        .filter(c => priceMap[c.id] !== undefined)
        .map(c => ({ ...c, minPrice: priceMap[c.id] || 0 }));

      // 반경 검색이면 거리순, 아니면 가격순
      if (radiusKm) {
        result = result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else {
        result = result.sort((a, b) => a.minPrice - b.minPrice);
      }

      result = result.slice(pageNum * PAGE, (pageNum + 1) * PAGE);

      if (reset) setClinics(result); else setClinics(prev => [...prev, ...result]);
      setHasMore(result.length === PAGE);
      setPage(pageNum);
    } catch(e) { console.error(e); }
    setLoading(false);
    setLoadingMore(false);
  }, [tr.key, region, sigungu, userCoords, radiusKm, sort]);

  useEffect(() => {
    setClinics([]); setPage(0); setHasMore(true); fetchClinics(0, true);
  }, [tr.key, region, sigungu, userCoords, radiusKm, sort]);

  const renderClinic = ({ item:c, index:i }) => (
    <TouchableOpacity onPress={() => navigation.navigate('병원상세', { clinic:c, treatment:tr })}
      style={{ backgroundColor:WHITE, marginHorizontal:16, marginTop:10,
        borderRadius:14, borderWidth:1, borderColor:i===0?BLUE:'#E5E7EB', overflow:'hidden' }}>
      {i===0 && (
        <View style={{ backgroundColor:BLUE, paddingVertical:7, paddingHorizontal:16,
          flexDirection:'row', alignItems:'center' }}>
          <Ionicons name="star" size={12} color={WHITE} />
          <Text style={{ fontSize:12, fontWeight:'700', color:WHITE, marginLeft:6 }}>
            {radiusKm ? '가장 가까운' : '최저가'}
          </Text>
        </View>
      )}
      <View style={{ padding:16, flexDirection:'row' }}>
        <View style={{ flex:1 }}>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
            <View style={{ width:20, height:20, borderRadius:6,
              backgroundColor:i===0?BLUE:'#F3F4F6', alignItems:'center', justifyContent:'center', marginRight:6 }}>
              <Text style={{ fontSize:10, fontWeight:'900', color:i===0?WHITE:GRAY }}>{i+1}</Text>
            </View>
            <Text style={{ fontSize:15, fontWeight:'800', color:'#111827' }} numberOfLines={1}>{c.name}</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:6 }}>
            <Ionicons name="location-outline" size={11} color="#9CA3AF" />
            <Text style={{ fontSize:11, color:'#9CA3AF', marginLeft:4, flex:1 }} numberOfLines={1}>{c.address}</Text>
          </View>
          {c.distance && (
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:6 }}>
              <Ionicons name="navigate-outline" size={11} color={BLUE} />
              <Text style={{ fontSize:11, color:BLUE, marginLeft:4, fontWeight:'700' }}>
                {c.distance < 1 ? `${Math.round(c.distance * 1000)}m` : `${c.distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
          {c.grade && (
            <View style={{ backgroundColor:'#F3F4F6', paddingVertical:3,
              paddingHorizontal:8, borderRadius:6, alignSelf:'flex-start' }}>
              <Text style={{ fontSize:11, color:GRAY }}>{c.grade}</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems:'flex-end', marginLeft:12 }}>
          <TouchableOpacity onPress={() => toggle(c)} style={{ marginBottom:6 }}>
            <Ionicons name={isBookmarked(c.id)?'bookmark':'bookmark-outline'}
              size={22} color={isBookmarked(c.id)?BLUE:'#D1D5DB'} />
          </TouchableOpacity>
          <Text style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>{tr.label}</Text>
          <Text style={{ fontSize:20, fontWeight:'900', color:BLUE }}>
            {c.minPrice>0 ? `₩${Math.floor(c.minPrice/10000)}만` : '가격문의'}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection:'row', paddingHorizontal:12, paddingBottom:12 }}>
        <TouchableOpacity style={{ flex:1, alignItems:'center', paddingVertical:10, backgroundColor:BG,
          borderRadius:10, borderWidth:1, borderColor:'#E5E7EB', marginRight:8,
          flexDirection:'row', justifyContent:'center' }}>
          <Ionicons name="call-outline" size={13} color={GRAY} />
          <Text style={{ fontSize:13, fontWeight:'600', color:'#374151', marginLeft:4 }}>전화</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('병원상세', { clinic:c, treatment:tr })}
          style={{ flex:2, alignItems:'center', paddingVertical:10, backgroundColor:BLUE,
            borderRadius:10, flexDirection:'row', justifyContent:'center' }}>
          <Text style={{ fontSize:13, fontWeight:'700', color:WHITE, marginRight:4 }}>상세 보기</Text>
          <Ionicons name="chevron-forward" size={14} color={WHITE} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <View style={{ backgroundColor:WHITE, paddingHorizontal:20, paddingVertical:12,
        borderBottomWidth:1, borderBottomColor:'#F3F4F6', flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight:12 }}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ width:26, height:26, backgroundColor:'#EFF6FF', borderRadius:7,
          alignItems:'center', justifyContent:'center', marginRight:8 }}>
          <Ionicons name={tr.icon} size={14} color={BLUE} />
        </View>
        <Text style={{ fontSize:17, fontWeight:'800', color:'#111827' }}>{tr.label}</Text>
        <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:6 }}>
          · {radiusKm ? `내 위치 ${radiusKm}km 이내` : sigungu ? `${region} ${sigungu}` : region}
        </Text>
      </View>
      <View style={{ flexDirection:'row', paddingHorizontal:16, paddingVertical:10,
        backgroundColor:WHITE, borderBottomWidth:1, borderBottomColor:'#F3F4F6' }}>
        {[['price','가격순'],['rating','최신순']].map(([k,l]) => (
          <TouchableOpacity key={k} onPress={() => setSort(k)}
            style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:99, marginRight:8,
              backgroundColor:sort===k?BLUE:'#F3F4F6' }}>
            <Text style={{ fontSize:12, fontWeight:'600', color:sort===k?WHITE:GRAY }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={{ fontSize:14, color:'#9CA3AF', marginTop:12 }}>치과 검색 중...</Text>
        </View>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderClinic}
          onEndReached={() => { if (!loadingMore && hasMore) fetchClinics(page+1); }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={{ padding:40, alignItems:'center' }}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize:16, color:'#9CA3AF', marginTop:12 }}>검색 결과가 없어요</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding:20, alignItems:'center' }}>
                <ActivityIndicator size="small" color={BLUE} />
                <Text style={{ fontSize:12, color:'#9CA3AF', marginTop:8 }}>더 불러오는 중...</Text>
              </View>
            ) : clinics.length > 0 ? (
              <Text style={{ textAlign:'center', fontSize:11, color:'#D1D5DB', marginVertical:16 }}>
                * 심평원 비급여 공개 데이터 기준
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}