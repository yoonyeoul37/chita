import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import { BLUE, WHITE, BG, timeAgo } from '../constants';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post,     setPost]     = useState(null);
  const [comments, setComments] = useState([]);
  const [comment,  setComment]  = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', postId).single();
    setPost(data);
    if (data) await supabase.from('posts').update({ views:(data.views||0)+1 }).eq('id', postId);
  };

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*')
      .eq('post_id', postId).order('created_at', { ascending:true });
    setComments(data || []);
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    await supabase.from('comments').insert({
      post_id: postId, content: comment.trim(), author_name: '익명',
    });
    setComment('');
    fetchComments();
    setLoading(false);
  };

  if (!post) return (
    <SafeAreaView style={{ flex:1, backgroundColor:WHITE, alignItems:'center', justifyContent:'center' }}>
      <ActivityIndicator size="large" color={BLUE} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:BG }}>
      <View style={{ backgroundColor:WHITE, paddingHorizontal:16, paddingVertical:12,
        borderBottomWidth:1, borderBottomColor:'#F3F4F6', flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight:12 }}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize:16, fontWeight:'700', color:'#111827', flex:1 }} numberOfLines={1}>
          {post.title}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 본문 */}
        <View style={{ backgroundColor:WHITE, padding:20, marginBottom:8 }}>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
            <View style={{ backgroundColor:'#EFF6FF', paddingVertical:3,
              paddingHorizontal:9, borderRadius:5 }}>
              <Text style={{ fontSize:11, fontWeight:'700', color:BLUE }}>{post.category}</Text>
            </View>
          </View>
          <Text style={{ fontSize:18, fontWeight:'900', color:'#111827',
            marginBottom:14, lineHeight:26 }}>{post.title}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:16,
            paddingBottom:16, borderBottomWidth:1, borderBottomColor:'#F3F4F6' }}>
            <View style={{ width:28, height:28, backgroundColor:'#F3F4F6', borderRadius:14,
              alignItems:'center', justifyContent:'center' }}>
              <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize:13, fontWeight:'600', color:'#374151', marginLeft:8 }}>
              {post.author_name}
            </Text>
            <Text style={{ fontSize:12, color:'#9CA3AF', marginLeft:6 }}>· {timeAgo(post.created_at)}</Text>
          </View>
          <Text style={{ fontSize:15, color:'#374151', lineHeight:26 }}>{post.content}</Text>
        </View>

        {/* 댓글 */}
        <View style={{ backgroundColor:WHITE, padding:20 }}>
          <Text style={{ fontSize:15, fontWeight:'800', color:'#111827', marginBottom:16 }}>
            댓글 {comments.length}개
          </Text>
          {comments.map((c, i) => (
            <View key={c.id} style={{ marginBottom:16, paddingBottom:16,
              borderBottomWidth:i<comments.length-1?1:0, borderBottomColor:'#F3F4F6' }}>
              {c.is_official && (
                <View style={{ backgroundColor:'#EFF6FF', borderWidth:1, borderColor:'#DBEAFE',
                  borderRadius:8, padding:10, marginBottom:10,
                  flexDirection:'row', alignItems:'center' }}>
                  <Ionicons name="checkmark-circle" size={14} color={BLUE} />
                  <Text style={{ fontSize:12, fontWeight:'700', color:BLUE, marginLeft:6 }}>
                    치과 공식답변 {c.clinic_name ? `— ${c.clinic_name}` : ''}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
                <View style={{ width:26, height:26,
                  backgroundColor:c.is_official?'#EFF6FF':'#F3F4F6',
                  borderRadius:13, alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name={c.is_official?'medical':'person-outline'} size={13}
                    color={c.is_official?BLUE:'#9CA3AF'} />
                </View>
                <Text style={{ fontSize:13, fontWeight:'700', color:'#111827', marginLeft:8 }}>
                  {c.author_name}
                </Text>
                {c.is_official && (
                  <View style={{ backgroundColor:BLUE, paddingVertical:2, paddingHorizontal:6,
                    borderRadius:4, marginLeft:6 }}>
                    <Text style={{ fontSize:10, fontWeight:'700', color:WHITE }}>치과의사</Text>
                  </View>
                )}
                <Text style={{ fontSize:11, color:'#9CA3AF', marginLeft:6 }}>{timeAgo(c.created_at)}</Text>
              </View>
              <Text style={{ fontSize:14, color:'#374151', lineHeight:22, marginLeft:34 }}>
                {c.content}
              </Text>
            </View>
          ))}

          {/* 댓글 입력 */}
          <View style={{ marginTop:8, borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, padding:12 }}>
            <TextInput
              value={comment} onChangeText={setComment}
              placeholder="댓글을 입력하세요..." placeholderTextColor="#9CA3AF"
              multiline
              style={{ fontSize:14, color:'#111827', minHeight:60,
                textAlignVertical:'top', marginBottom:8 }}
            />
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <TouchableOpacity onPress={submitComment}
                disabled={!comment.trim() || loading}
                style={{ backgroundColor:comment.trim()?BLUE:'#E5E7EB',
                  borderRadius:8, paddingVertical:8, paddingHorizontal:16 }}>
                <Text style={{ fontSize:13, fontWeight:'700',
                  color:comment.trim()?WHITE:'#9CA3AF' }}>
                  {loading ? '등록 중...' : '등록'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ height:24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}