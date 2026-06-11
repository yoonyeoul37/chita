import { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../supabase';
import { useAuth } from '../context/AuthContext';
import { BLUE, WHITE } from '../constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('로그인 실패', error.message);
    else navigation.goBack();
  };

  const handleGoogleLogin = async () => {
    setGLoading(true);
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'exp',
        path: 'chita',
      });
      console.log('redirectUri:', redirectUri);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      console.log('result:', JSON.stringify(result));
      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          navigation.goBack();
        }
      }
    } catch (e) {
      Alert.alert('오류', e.message);
      console.log('google error:', e);
    }
    setGLoading(false);
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
        <Text style={{ fontSize:26, fontWeight:'900', color:'#111827', marginBottom:6 }}>로그인</Text>
        <Text style={{ fontSize:14, color:'#9CA3AF', marginBottom:32 }}>치타에 오신 걸 환영해요 🦷</Text>

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
          flexDirection:'row', alignItems:'center', marginBottom:24 }}>
          <TextInput
            value={password} onChangeText={setPassword}
            placeholder="비밀번호 입력" placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPw}
            style={{ flex:1, paddingHorizontal:14, paddingVertical:13,
              fontSize:15, color:'#111827' }}
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding:14 }}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin}
          disabled={!email.trim() || !password.trim() || loading}
          style={{ backgroundColor: email.trim() && password.trim() ? BLUE : '#E5E7EB',
            borderRadius:14, paddingVertical:15, alignItems:'center', marginBottom:16 }}>
          {loading
            ? <ActivityIndicator color={WHITE} />
            : <Text style={{ fontSize:16, fontWeight:'700',
                color: email.trim() && password.trim() ? WHITE : '#9CA3AF' }}>로그인</Text>
          }
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={{ flexDirection:'row', alignItems:'center', marginBottom:16 }}>
          <View style={{ flex:1, height:1, backgroundColor:'#E5E7EB' }} />
          <Text style={{ fontSize:13, color:'#9CA3AF', marginHorizontal:12 }}>또는</Text>
          <View style={{ flex:1, height:1, backgroundColor:'#E5E7EB' }} />
        </View>

        {/* 구글 로그인 버튼 */}
        <TouchableOpacity onPress={handleGoogleLogin} disabled={gLoading}
          style={{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:14,
            paddingVertical:14, alignItems:'center', flexDirection:'row',
            justifyContent:'center', marginBottom:16, backgroundColor:WHITE }}>
          {gLoading
            ? <ActivityIndicator color="#374151" />
            : <>
                <Text style={{ fontSize:22, marginRight:8 }}>G</Text>
                <Text style={{ fontSize:15, fontWeight:'700', color:'#374151' }}>구글로 로그인</Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('회원가입')}
          style={{ alignItems:'center', paddingVertical:12 }}>
          <Text style={{ fontSize:14, color:'#9CA3AF' }}>
            계정이 없으신가요? <Text style={{ color:BLUE, fontWeight:'700' }}>회원가입</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}