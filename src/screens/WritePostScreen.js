import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import { BLUE, WHITE } from '../constants';

export default function WritePostScreen({ navigation }) {
  const [category, setCategory] = useState('치료후기');
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [author,   setAuthor]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const cats = ['치료후기','질문·상담','가격정보','치과추천'];

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      category,
      title:       title.trim(),
      content:     content.trim(),
      author_name: author.trim() || '익명',
    });
    setLoading(false);
    if (!error) navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:WHITE }}>
      <View style={{ paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1,
        borderBottomColor:'#F3F4F6', flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize:16, fontWeight:'700', color:'#111827' }}>글쓰기</Text>
        <TouchableOpacity onPress={submit} disabled={!title.trim() || !content.trim() || loading}>
          <Text style={{ fontSize:15, fontWeight:'700',
            color: title.trim() && content.trim() ? BLUE : '#D1D5DB' }}>
            {loading ? '등록 중...' : '등록'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex:1, padding:16 }}>
        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>카테고리</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:16 }}>
          {cats.map(c => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)}
              style={{ paddingVertical:8, paddingHorizontal:16, borderRadius:99,
                marginRight:8, marginBottom:8,
                backgroundColor: category===c ? BLUE : '#F3F4F6',
                borderWidth:1, borderColor: category===c ? BLUE : '#E5E7EB' }}>
              <Text style={{ fontSize:13, fontWeight:'600',
                color: category===c ? WHITE : '#374151' }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>닉네임 (선택)</Text>
        <TextInput
          value={author} onChangeText={setAuthor}
          placeholder="익명으로 작성됩니다" placeholderTextColor="#9CA3AF"
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
            paddingHorizontal:14, paddingVertical:12, fontSize:15,
            marginBottom:16, color:'#111827' }}
        />

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>
          제목 <Text style={{ color:'#EF4444' }}>*</Text>
        </Text>
        <TextInput
          value={title} onChangeText={setTitle}
          placeholder="제목을 입력해주세요" placeholderTextColor="#9CA3AF"
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
            paddingHorizontal:14, paddingVertical:12, fontSize:15,
            marginBottom:16, color:'#111827' }}
        />

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>
          내용 <Text style={{ color:'#EF4444' }}>*</Text>
        </Text>
        <TextInput
          value={content} onChangeText={setContent}
          placeholder="내용을 입력해주세요" placeholderTextColor="#9CA3AF"
          multiline numberOfLines={8} textAlignVertical="top"
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
            paddingHorizontal:14, paddingVertical:12, fontSize:15,
            marginBottom:16, minHeight:150, color:'#111827' }}
        />

        <Text style={{ fontSize:12, color:'#9CA3AF', textAlign:'center', marginBottom:24 }}>
          개인 병원 광고·홍보 글은 삭제될 수 있습니다
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}