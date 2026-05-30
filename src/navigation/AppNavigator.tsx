import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { QuestBoardScreen } from '../screens/QuestBoardScreen';
import { ActiveQuestsScreen } from '../screens/ActiveQuestsScreen';
import { CharacterScreen } from '../screens/CharacterScreen';
import { GachaScreen } from '../screens/GachaScreen';
import { useQuestStore } from '../store/useQuestStore';
import { Colors, Fonts } from '../constants/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.icon, focused && tabIconStyles.focusedIcon]}>{icon}</Text>
      <Text style={[tabIconStyles.label, focused && tabIconStyles.focusedLabel]}>{label}</Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2, paddingTop: 4 },
  icon: { fontSize: 20, opacity: 0.5 },
  focusedIcon: { opacity: 1 },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
  focusedLabel: { color: Colors.gold },
});

export function AppNavigator() {
  const activeCount = useQuestStore(s => s.getActiveQuests().length);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bgSecondary, borderBottomWidth: 0 },
          headerTintColor: Colors.gold,
          headerTitleStyle: {
            fontFamily: Fonts.mono,
            fontSize: Fonts.size.lg,
            fontWeight: 'bold',
            letterSpacing: 2,
          },
          tabBarStyle: {
            backgroundColor: Colors.bgSecondary,
            borderTopWidth: 2,
            borderTopColor: Colors.borderDim,
            height: 64,
            paddingBottom: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'ギルドホーム',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" label="ホーム" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="QuestBoard"
          component={QuestBoardScreen}
          options={{
            title: 'クエスト掲示板',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📋" label="掲示板" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ActiveQuests"
          component={ActiveQuestsScreen}
          options={{
            title: '進行中クエスト',
            tabBarBadge: activeCount > 0 ? activeCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: Colors.border,
              fontSize: 10,
            },
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="⚔" label="進行中" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Character"
          component={CharacterScreen}
          options={{
            title: 'キャラクター',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👤" label="キャラ" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Gacha"
          component={GachaScreen}
          options={{
            title: 'ガチャ',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🎲" label="ガチャ" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
