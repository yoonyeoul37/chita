import { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BLUE, WHITE } from '../constants';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !nickname.trim()) return;
    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 해요');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, nickname.trim());
    setLoading(false);
    if (error) {
      Alert.alert('회원가입 실패', error.message);
    } else {
      Alert.alert('가입 완료! 🎉', '이메일 인증 후 로그인해주세요', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:WHITE }}>
      <View style={{ paddingHorizontal:16, paddingVertical:12,
        borderBottomWidth:1, borderBottomColor:'#F3F4F6',
        flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={{ flex:1, padding:24 }}>
        <Text style={{ fontSize:26, fontWeight:'900', color:'#111827', marginBottom:6 }}>회원가입</Text>
        <Text style={{ fontSize:14, color:'#9CA3AF', marginBottom:32 }}>치타 계정을 만들어보세요 🦷</Text>

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>닉네임</Text>
        <TextInput
          value={nickname} onChangeText={setNickname}
          placeholder="닉네임 입력" placeholderTextColor="#9CA3AF"
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
            paddingHorizontal:14, paddingVertical:13, fontSize:15,
            marginBottom:16, color:'#111827' }}
        />

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>이메일</Text>
        <TextInput
          value={email} onChangeText={setEmail}
          placeholder="이메일 입력" placeholderTextColor="#9CA3AF"
          keyboardType="email-address" autoCapitalize="none"
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
            paddingHorizontal:14, paddingVertical:13, fontSize:15,
            marginBottom:16, color:'#111827' }}
        />

        <Text style={{ fontSize:13, fontWeight:'700', color:'#374151', marginBottom:8 }}>비밀번호</Text>
        <View style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
          flexDirection:'row', alignItems:'center', marginBottom:32 }}>
          <TextInput
            value={password} onChangeText={setPassword}
            placeholder="6자 이상 입력" placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPw}
            style={{ flex:1, paddingHorizontal:14, paddingVertical:13,
              fontSize:15, color:'#111827' }}
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding:14 }}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSignUp}
          disabled={!email.trim() || !password.trim() || !nickname.trim() || loading}
          style={{ backgroundColor: email.trim() && password.trim() && nickname.trim() ? BLUE : '#E5E7EB',
            borderRadius:14, paddingVertical:15, alignItems:'center' }}>
          {loading
            ? <ActivityIndicator color={WHITE} />
            : <Text style={{ fontSize:16, fontWeight:'700',
                color: email.trim() && password.trim() && nickname.trim() ? WHITE : '#9CA3AF' }}>가입하기</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}