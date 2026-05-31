import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { QuestBoardScreen } from '../screens/QuestBoardScreen';
import { ActiveQuestsScreen } from '../screens/ActiveQuestsScreen';
import { CharacterScreen } from '../screens/CharacterScreen';
import { GachaScreen } from '../screens/GachaScreen';
import { ArenaNavigator } from './ArenaNavigator';
import { useQuestStore } from '../store/useQuestStore';
import { Colors, Fonts } from '../constants/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.containerFocused]}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    paddingHorizontal: 6,
    paddingBottom: 4,
    borderTopWidth: 0,
  },
  containerFocused: {
    borderTopWidth: 3,
    borderTopColor: Colors.gold,
    marginTop: -3,
  },
  icon: { fontSize: 18, opacity: 0.4 },
  iconFocused: { opacity: 1 },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelFocused: { color: Colors.gold },
});

export function AppNavigator() {
  const activeCount = useQuestStore(s => s.getActiveQuests().length);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.bgSecondary,
            borderBottomWidth: 3,
            borderBottomColor: Colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: Colors.gold,
          headerTitleStyle: {
            fontFamily: Fonts.mono,
            fontSize: Fonts.size.lg,
            fontWeight: 'bold',
            letterSpacing: 3,
          },
          tabBarStyle: {
            backgroundColor: Colors.bgSecondary,
            borderTopWidth: 3,
            borderTopColor: Colors.border,
            height: 68,
            paddingBottom: 8,
            elevation: 0,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '[ ギルドホーム ]',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" label="ホーム" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="QuestBoard"
          component={QuestBoardScreen}
          options={{
            title: '[ 掲示板 ]',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📋" label="掲示板" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ActiveQuests"
          component={ActiveQuestsScreen}
          options={{
            title: '[ 進行中 ]',
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
            title: '[ キャラ ]',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👤" label="キャラ" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Gacha"
          component={GachaScreen}
          options={{
            title: '[ ガチャ ]',
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🎲" label="ガチャ" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Arena"
          component={ArenaNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏟" label="闘技場" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
