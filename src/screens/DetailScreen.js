import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { supabase } from '../../supabase';
import { useBookmarks } from '../hooks/useBookmarks';
import { BLUE, WHITE, BG, TREATMENTS, SUBTYPE_KR } from '../constants';

export default function DetailScreen({ route, navigation }) {
  const { clinic, treatment } = route.params;
  const { isBookmarked, toggle } = useBookmarks();
  const [tab,    setTab]    = useState('prices');
  const [prices, setPrices] = useState([]);
  const tr = treatment || TREATMENTS[0];

  useEffect(() => {
    supabase.from('prices').select('*').eq('clinic_id', clinic.id)
      .then(({ data }) => setPrices(data || []));
  }, [clinic.id]);

  const byTreatment = (key) => prices.filter(p => p.treatment === key);

 const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(clinic.address)}`;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <View style={{ backgroundColor:WHITE, paddingHorizontal:16, paddingVertical:12,
        borderBottomWidth:1, borderBottomColor:'#F3F4F6',
        flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize:16, fontWeight:'700', color:'#111827', flex:1, textAlign:'center' }}
          numberOfLines={1}>{clinic.name}</Text>
        <TouchableOpacity onPress={() => toggle(clinic)}>
          <Ionicons name={isBookmarked(clinic.id)?'bookmark':'bookmark-outline'}
            size={24} color={isBookmarked(clinic.id)?BLUE:'#D1D5DB'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor:WHITE, padding:16, marginBottom:8 }}>
          <View style={{ flexDirection:'row', marginBottom:14 }}>
            <View style={{ width:52, height:52, backgroundColor:'#EFF6FF', borderRadius:14,
              alignItems:'center', justifyContent:'center' }}>
              <Ionicons name="business" size={28} color={BLUE} />
            </View>
            <View style={{ flex:1, marginLeft:14 }}>
              <Text style={{ fontSize:17, fontWeight:'900', color:'#111827', marginBottom:6 }}>{clinic.name}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:4 }}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:4, flex:1 }} numberOfLines={2}>{clinic.address}</Text>
              </View>
              {clinic.phone && (
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <Ionicons name="call-outline" size={12} color="#9CA3AF" />
                  <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:4 }}>{clinic.phone}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ flexDirection:'row', backgroundColor:WHITE,
          borderBottomWidth:1, borderBottomColor:'#F3F4F6' }}>
          {[['prices','가격표'],['map','지도'],['info','병원정보']].map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setTab(k)}
              style={{ flex:1, alignItems:'center', paddingVertical:12 }}>
              <Text style={{ fontSize:14, fontWeight:tab===k?'700':'500',
                color:tab===k?BLUE:'#9CA3AF' }}>{l}</Text>
              {tab===k && <View style={{ height:2, width:'60%', backgroundColor:BLUE, marginTop:4 }} />}
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'prices' && (
          <View style={{ paddingHorizontal:16, paddingTop:12 }}>
            {TREATMENTS.map((t) => {
              const tPrices = byTreatment(t.key);
              if (tPrices.length === 0) return null;
              return (
                <View key={t.key} style={{ backgroundColor:WHITE, borderRadius:14,
                  overflow:'hidden', borderWidth:1, borderColor:'#E5E7EB', marginBottom:12 }}>
                  <View style={{ backgroundColor:t.key===tr.key?BLUE:'#F9FAFB',
                    padding:12, flexDirection:'row', alignItems:'center' }}>
                    <Ionicons name={t.icon} size={16} color={t.key===tr.key?WHITE:'#374151'} />
                    <Text style={{ fontSize:14, fontWeight:'700', marginLeft:8,
                      color:t.key===tr.key?WHITE:'#374151' }}>{t.label}</Text>
                  </View>
                  {tPrices.map((p, i) => (
                    <View key={i} style={{ flexDirection:'row', justifyContent:'space-between',
                      padding:12, borderTopWidth:1, borderTopColor:'#F3F4F6', alignItems:'center' }}>
                      <Text style={{ fontSize:13, color:'#374151' }}>{SUBTYPE_KR[p.subtype]||p.subtype}</Text>
                      <View style={{ alignItems:'flex-end' }}>
                        <Text style={{ fontSize:15, fontWeight:'800', color:BLUE }}>
                          ₩{Math.floor((p.price_min||0)/10000)}만
                        </Text>
                        {p.price_max && p.price_max !== p.price_min && (
                          <Text style={{ fontSize:11, color:'#9CA3AF' }}>
                            ~ ₩{Math.floor(p.price_max/10000)}만
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
            <Text style={{ textAlign:'center', fontSize:11, color:'#D1D5DB', marginBottom:16 }}>
              * 심평원 비급여 공개 데이터 기준 · 실제 진료비는 진료 후 결정됩니다
            </Text>
          </View>
        )}

        {tab === 'map' && (
          <View style={{ height:400, margin:16, borderRadius:14, overflow:'hidden',
            borderWidth:1, borderColor:'#E5E7EB' }}>
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex:1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        )}

        {tab === 'info' && (
          <View style={{ backgroundColor:WHITE, margin:16, borderRadius:14, padding:16,
            borderWidth:1, borderColor:'#E5E7EB' }}>
            {[
              ['location-outline', '주소',     clinic.address],
              ['call-outline',     '전화',     clinic.phone],
              ['business-outline', '기관등급', clinic.grade],
              ['map-outline',      '지역',     `${clinic.sido||''} ${clinic.sigungu||''}`],
            ].filter(([,,v]) => v).map(([icon, label, val], i, arr) => (
              <View key={label} style={{ flexDirection:'row', alignItems:'flex-start',
                paddingVertical:12, borderBottomWidth:i<arr.length-1?1:0, borderBottomColor:'#F3F4F6' }}>
                <Ionicons name={icon} size={16} color="#9CA3AF" />
                <Text style={{ fontSize:13, color:'#9CA3AF', width:56, marginLeft:12 }}>{label}</Text>
                <Text style={{ fontSize:13, color:'#374151', fontWeight:'500', flex:1 }}>{val}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection:'row', padding:16, paddingBottom:24 }}>
          <TouchableOpacity
            onPress={() => clinic.phone && Linking.openURL(`tel:${clinic.phone}`)}
            style={{ flex:1, alignItems:'center', justifyContent:'center',
              backgroundColor:WHITE, borderWidth:2, borderColor:BLUE, borderRadius:14,
              paddingVertical:14, flexDirection:'row', marginRight:10 }}>
            <Ionicons name="call-outline" size={16} color={BLUE} />
            <Text style={{ fontSize:15, fontWeight:'700', color:BLUE, marginLeft:7 }}>전화 연결</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex:2, alignItems:'center', justifyContent:'center',
            backgroundColor:BLUE, borderRadius:14, paddingVertical:14 }}>
            <Text style={{ fontSize:15, fontWeight:'700', color:WHITE }}>예약 문의하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}