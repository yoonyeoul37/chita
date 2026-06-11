import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { BLUE, WHITE, BG, TREATMENTS, REGIONS } from '../constants';

export default function HomeScreen({ navigation }) {
  const [region,     setRegion]     = useState('서울특별시');
  const [sigungu,    setSigungu]    = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [showRegion, setShowRegion] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const handleSearch = (treatment) => {
    navigation.navigate('검색탭', { screen:'검색결과', params:{ treatment, region, sigungu, userCoords } });
  };

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한을 허용해주세요!');
        setLocLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      setUserCoords({ lat: latitude, lng: longitude });

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const { region: sido, subregion, city, district } = geocode[0];
        const sidoMap = {
          'Seoul': '서울특별시',
          'Gyeonggi-do': '경기도',
          'Incheon': '인천광역시',
          'Busan': '부산광역시',
          'Daegu': '대구광역시',
          'Gwangju': '광주광역시',
          'Daejeon': '대전광역시',
          'Ulsan': '울산광역시',
          'Jeju-do': '제주특별자치도',
        };
        const mappedRegion = sidoMap[sido] || sido;
        const matchedRegion = REGIONS.find(r => r === mappedRegion) || '전체';
        const detectedSigungu = district || subregion || city || null;
        setRegion(matchedRegion);
        setSigungu(detectedSigungu);
        Alert.alert('위치 감지 완료',
          detectedSigungu
            ? `${matchedRegion} ${detectedSigungu} 으로 설정됐어요!`
            : `${matchedRegion} 으로 설정됐어요!`
        );
      }
    } catch (e) {
      Alert.alert('오류', '위치를 가져올 수 없어요');
    }
    setLocLoading(false);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />
      <View style={{ backgroundColor:BLUE, paddingTop:48, paddingHorizontal:24, paddingBottom:24 }}>
        <Text style={{ fontSize:26, fontWeight:'900', color:WHITE }}>치타 🦷</Text>
        <Text style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginTop:2 }}>빠르게 찾는 내 치과</Text>
      </View>
      <ScrollView style={{ flex:1 }}>
        <View style={{ margin:16, marginBottom:0 }}>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
            <TouchableOpacity onPress={() => setShowRegion(!showRegion)}
              style={{ flex:1, backgroundColor:WHITE, borderRadius:12, padding:14, borderWidth:1,
                borderColor:'#E5E7EB', flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                marginRight:8 }}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Ionicons name="location-outline" size={18} color={BLUE} />
                <Text style={{ fontSize:15, fontWeight:'700', color:'#111827', marginLeft:8 }}>
                  {sigungu ? `${region} ${sigungu}` : region}
                </Text>
              </View>
              <Ionicons name={showRegion ? 'chevron-up' : 'chevron-down'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={getCurrentLocation}
              style={{ backgroundColor:BLUE, borderRadius:12, padding:14,
                alignItems:'center', justifyContent:'center', width:50 }}>
              {locLoading
                ? <ActivityIndicator size="small" color={WHITE} />
                : <Ionicons name="navigate" size={20} color={WHITE} />
              }
            </TouchableOpacity>
          </View>

          {/* 반경 검색 버튼 */}
          {userCoords && (
            <View style={{ flexDirection:'row', marginBottom:8 }}>
              {[1, 3, 5].map(km => (
                <TouchableOpacity key={km}
                  onPress={() => navigation.navigate('검색탭', {
                    screen:'검색결과',
                    params:{ treatment: TREATMENTS[0], region, sigungu, userCoords, radiusKm: km }
                  })}
                  style={{ flex:1, backgroundColor:WHITE, borderRadius:10, paddingVertical:10,
                    alignItems:'center', borderWidth:1, borderColor:BLUE, marginRight: km !== 5 ? 8 : 0 }}>
                  <Text style={{ fontSize:13, fontWeight:'700', color:BLUE }}>📍 {km}km</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {showRegion && (
            <View style={{ backgroundColor:WHITE, borderRadius:12, padding:10, marginTop:4,
              borderWidth:1, borderColor:'#E5E7EB', flexDirection:'row', flexWrap:'wrap' }}>
              {REGIONS.map(r => (
                <TouchableOpacity key={r} onPress={() => { setRegion(r); setSigungu(null); setShowRegion(false); }}
                  style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:99, margin:3,
                    backgroundColor: region===r ? BLUE : '#F3F4F6' }}>
                  <Text style={{ fontSize:13, fontWeight:'600', color: region===r ? WHITE : '#374151' }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ margin:16 }}>
          <Text style={{ fontSize:16, fontWeight:'800', color:'#111827', marginBottom:12 }}>진료 항목 선택</Text>
          {TREATMENTS.map((t, i) => (
            <TouchableOpacity key={i} onPress={() => handleSearch(t)}
              style={{ backgroundColor:WHITE, borderRadius:12, padding:16, marginBottom:10,
                flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#E5E7EB' }}>
              <View style={{ width:40, height:40, backgroundColor:'#EFF6FF', borderRadius:10,
                alignItems:'center', justifyContent:'center', marginRight:12 }}>
                <Ionicons name={t.icon} size={20} color={BLUE} />
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:15, fontWeight:'700', color:'#111827' }}>{t.label}</Text>
                <Text style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>전국 평균 {t.avg}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ backgroundColor:WHITE, margin:16, borderRadius:14, padding:16,
          borderWidth:1, borderColor:'#E5E7EB', marginBottom:24 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 }}>
            <Text style={{ fontSize:15, fontWeight:'800', color:'#111827' }}>전국 평균 가격</Text>
            <Text style={{ fontSize:11, color:'#9CA3AF' }}>심평원 비급여 기준</Text>
          </View>
          {TREATMENTS.map((t, i) => (
            <View key={i} style={{ flexDirection:'row', justifyContent:'space-between',
              paddingVertical:10, borderBottomWidth: i<TREATMENTS.length-1 ? 1 : 0, borderBottomColor:'#F3F4F6' }}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <View style={{ width:30, height:30, backgroundColor:BG, borderRadius:8,
                  alignItems:'center', justifyContent:'center', marginRight:10 }}>
                  <Ionicons name={t.icon} size={14} color="#9CA3AF" />
                </View>
                <Text style={{ fontSize:14, color:'#374151' }}>{t.label}</Text>
              </View>
              <Text style={{ fontSize:14, fontWeight:'700', color:BLUE }}>{t.avg}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}