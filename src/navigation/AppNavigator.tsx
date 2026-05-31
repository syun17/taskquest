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

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderTopColor: 'transparent',
    paddingTop: 4,
  },
  containerFocused: {
    borderTopColor: Colors.gold,
  },
  icon: { fontSize: 22, opacity: 0.4 },
  iconFocused: { opacity: 1 },
  headerTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.gold,
    letterSpacing: 3,
  },
});

function HeaderTitle({ title }: { title: string }) {
  return <Text style={tabStyles.headerTitle}>{title}</Text>;
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.containerFocused]}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
    </View>
  );
}

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
          headerTitle: ({ children }) => <HeaderTitle title={children} />,
          tabBarStyle: {
            backgroundColor: Colors.bgSecondary,
            borderTopWidth: 3,
            borderTopColor: Colors.border,
            height: 56,
            paddingBottom: 4,
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
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="QuestBoard"
          component={QuestBoardScreen}
          options={{
            title: '[ 掲示板 ]',
            tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
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
            tabBarIcon: ({ focused }) => <TabIcon icon="⚔" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Character"
          component={CharacterScreen}
          options={{
            title: '[ キャラ ]',
            tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Gacha"
          component={GachaScreen}
          options={{
            title: '[ ガチャ ]',
            tabBarIcon: ({ focused }) => <TabIcon icon="🎲" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Arena"
          component={ArenaNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon="🏟" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
