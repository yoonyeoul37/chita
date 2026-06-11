import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarks } from '../hooks/useBookmarks';
import { BLUE, WHITE, BG, GRAY, TREATMENTS } from '../constants';

export default function SavedScreen({ navigation }) {
  const { bookmarks, toggle } = useBookmarks();

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <View style={{ backgroundColor:WHITE, padding:20, borderBottomWidth:1, borderBottomColor:'#F3F4F6' }}>
        <Text style={{ fontSize:20, fontWeight:'900', color:'#111827' }}>즐겨찾기</Text>
        <Text style={{ fontSize:13, color:'#9CA3AF', marginTop:4 }}>{bookmarks.length}개 저장됨</Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:40 }}>
          <View style={{ width:64, height:64, backgroundColor:'#F3F4F6', borderRadius:20,
            alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Ionicons name="bookmark-outline" size={30} color="#D1D5DB" />
          </View>
          <Text style={{ fontSize:18, fontWeight:'700', color:'#374151', marginBottom:8 }}>
            저장한 치과가 없어요
          </Text>
          <Text style={{ fontSize:14, color:'#9CA3AF', textAlign:'center', lineHeight:22 }}>
            치과 검색 후 북마크를 눌러{'\n'}즐겨찾기에 추가해보세요
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookmarks.map((c) => (
            <TouchableOpacity key={c.id}
              onPress={() => navigation.navigate('즐겨찾기상세', { clinic:c, treatment:TREATMENTS[0] })}
              style={{ backgroundColor:WHITE, marginHorizontal:16, marginTop:10,
                borderRadius:14, padding:16, borderWidth:1, borderColor:'#E5E7EB' }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:15, fontWeight:'800', color:'#111827', marginBottom:4 }}>{c.name}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center', marginBottom:6 }}>
                    <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                    <Text style={{ fontSize:11, color:'#9CA3AF', marginLeft:4, flex:1 }}
                      numberOfLines={1}>{c.address}</Text>
                  </View>
                  {c.grade && (
                    <View style={{ backgroundColor:'#F3F4F6', paddingVertical:3,
                      paddingHorizontal:8, borderRadius:6, alignSelf:'flex-start' }}>
                      <Text style={{ fontSize:11, color:GRAY }}>{c.grade}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => toggle(c)} style={{ padding:4 }}>
                  <Ionicons name="bookmark" size={22} color={BLUE} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height:20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}