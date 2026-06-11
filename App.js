import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen       from './src/screens/HomeScreen';
import SearchScreen     from './src/screens/SearchScreen';
import DetailScreen     from './src/screens/DetailScreen';
import SavedScreen      from './src/screens/SavedScreen';
import CommunityScreen  from './src/screens/CommunityScreen';
import WritePostScreen  from './src/screens/WritePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

import { BLUE, WHITE } from './src/constants';

/* ── 홈 스택 ── */
const HomeStack = createNativeStackNavigator();
function HomeTabScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown:false }}>
      <HomeStack.Screen name="홈메인"   component={HomeScreen} />
      <HomeStack.Screen name="병원상세" component={DetailScreen} />
    </HomeStack.Navigator>
  );
}

/* ── 검색 스택 ── */
const SearchStack = createNativeStackNavigator();
function SearchTabScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown:false }}>
      <SearchStack.Screen name="검색결과" component={SearchScreen}
        initialParams={{ treatment:{ key:'implant', label:'임플란트', icon:'medkit-outline' }, region:'서울특별시' }} />
      <SearchStack.Screen name="병원상세" component={DetailScreen} />
    </SearchStack.Navigator>
  );
}

/* ── 즐겨찾기 스택 ── */
const SavedStack = createNativeStackNavigator();
function SavedTabScreen() {
  return (
    <SavedStack.Navigator screenOptions={{ headerShown:false }}>
      <SavedStack.Screen name="즐겨찾기목록" component={SavedScreen} />
      <SavedStack.Screen name="즐겨찾기상세" component={DetailScreen} />
    </SavedStack.Navigator>
  );
}

/* ── 커뮤니티 스택 ── */
const CommunityStack = createNativeStackNavigator();
function CommunityTabScreen() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown:false }}>
      <CommunityStack.Screen name="커뮤니티목록" component={CommunityScreen} />
      <CommunityStack.Screen name="게시글상세"   component={PostDetailScreen} />
      <CommunityStack.Screen name="글쓰기"       component={WritePostScreen} />
    </CommunityStack.Navigator>
  );
}

/* ── 탭 네비게이터 ── */
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            const icons = {
              '홈탭':       focused ? 'home'       : 'home-outline',
              '검색탭':     focused ? 'search'      : 'search-outline',
              '즐겨찾기탭': focused ? 'bookmark'    : 'bookmark-outline',
              '커뮤니티탭': focused ? 'chatbubbles' : 'chatbubbles-outline',
            };
            return <Ionicons name={icons[route.name]} size={22} color={color} />;
          },
          tabBarActiveTintColor:   BLUE,
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: WHITE,
            borderTopColor:  '#F3F4F6',
            borderTopWidth:  1,
            height:          80,
            paddingBottom:   30,
          },
          tabBarLabelStyle: { fontSize:10, fontWeight:'600' },
          headerShown: false,
        })}>
        <Tab.Screen name="홈탭"       component={HomeTabScreen}      options={{ tabBarLabel:'홈' }} />
        <Tab.Screen name="검색탭"     component={SearchTabScreen}    options={{ tabBarLabel:'검색' }} />
        <Tab.Screen name="즐겨찾기탭" component={SavedTabScreen}     options={{ tabBarLabel:'즐겨찾기' }} />
        <Tab.Screen name="커뮤니티탭" component={CommunityTabScreen} options={{ tabBarLabel:'커뮤니티' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}