import { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import { useAuth } from '../context/AuthContext';
import { BLUE, WHITE, BG, timeAgo } from '../constants';

export default function CommunityScreen({ navigation }) {
  const { user } = useAuth();
  const [cat,     setCat]     = useState('전체');
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const cats = ['전체','치료후기','질문·상담','가격정보','치과추천'];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('posts').select('*')
      .order('created_at', { ascending:false }).limit(20);
    if (cat !== '전체') query = query.eq('category', cat);
    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  }, [cat]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // 화면 포커스될 때마다 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPosts();
    });
    return unsubscribe;
  }, [navigation, fetchPosts]);

  const handleWrite = () => {
    if (!user) {
      navigation.navigate('로그인');
    } else {
      navigation.navigate('글쓰기');
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <View style={{ backgroundColor:WHITE, padding:20, borderBottomWidth:1, borderBottomColor:'#F3F4F6',
        flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontSize:20, fontWeight:'900', color:'#111827' }}>커뮤니티</Text>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          {!user && (
            <TouchableOpacity onPress={() => navigation.navigate('로그인')}
              style={{ borderWidth:1, borderColor:BLUE, borderRadius:10, paddingVertical:8,
                paddingHorizontal:14, marginRight:8 }}>
              <Text style={{ fontSize:13, fontWeight:'700', color:BLUE }}>로그인</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleWrite}
            style={{ backgroundColor:BLUE, borderRadius:10, paddingVertical:8,
              paddingHorizontal:14, flexDirection:'row', alignItems:'center' }}>
            <Ionicons name="add" size={14} color={WHITE} />
            <Text style={{ fontSize:13, fontWeight:'700', color:WHITE, marginLeft:4 }}>글쓰기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor:WHITE, borderBottomWidth:1, borderBottomColor:'#F3F4F6', maxHeight:44 }}
        contentContainerStyle={{ paddingHorizontal:16 }}>
        {cats.map(c => (
          <TouchableOpacity key={c} onPress={() => setCat(c)}
            style={{ paddingVertical:10, paddingHorizontal:14, marginRight:4,
              borderBottomWidth:cat===c?2:0, borderBottomColor:BLUE }}>
            <Text style={{ fontSize:13, fontWeight:cat===c?'700':'500',
              color:cat===c?BLUE:'#9CA3AF' }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {posts.length === 0 ? (
            <View style={{ padding:60, alignItems:'center' }}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize:16, color:'#9CA3AF', marginTop:12 }}>첫 번째 글을 작성해보세요!</Text>
            </View>
          ) : posts.map((p) => (
            <TouchableOpacity key={p.id}
              onPress={() => navigation.navigate('게시글상세', { postId:p.id })}
              style={{ backgroundColor:WHITE, marginHorizontal:16, marginTop:10,
                borderRadius:14, padding:16, borderWidth:1, borderColor:'#E5E7EB' }}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
                <View style={{ backgroundColor:'#EFF6FF', paddingVertical:3,
                  paddingHorizontal:9, borderRadius:5 }}>
                  <Text style={{ fontSize:11, fontWeight:'700', color:BLUE }}>{p.category}</Text>
                </View>
                {p.is_official && (
                  <View style={{ backgroundColor:BLUE, paddingVertical:3, paddingHorizontal:8,
                    borderRadius:5, marginLeft:6, flexDirection:'row', alignItems:'center' }}>
                    <Ionicons name="checkmark-circle" size={10} color={WHITE} />
                    <Text style={{ fontSize:10, fontWeight:'700', color:WHITE, marginLeft:3 }}>공식답변</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize:15, fontWeight:'800', color:'#111827',
                marginBottom:6, lineHeight:22 }} numberOfLines={2}>{p.title}</Text>
              <Text style={{ fontSize:13, color:'#6B7280', marginBottom:12, lineHeight:20 }}
                numberOfLines={2}>{p.content}</Text>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <View style={{ width:22, height:22, backgroundColor:'#F3F4F6', borderRadius:11,
                    alignItems:'center', justifyContent:'center' }}>
                    <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                  </View>
                  <Text style={{ fontSize:12, fontWeight:'600', color:'#374151', marginLeft:6 }}>
                    {p.author_name}
                  </Text>
                  <Text style={{ fontSize:11, color:'#9CA3AF', marginLeft:4 }}>· {timeAgo(p.created_at)}</Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <Ionicons name="eye-outline" size={13} color="#9CA3AF" />
                  <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:3 }}>{p.views}</Text>
                  <Ionicons name="heart-outline" size={13} color="#9CA3AF" style={{ marginLeft:10 }} />
                  <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:3 }}>{p.likes}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height:20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}