import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ArenaScreen } from '../screens/ArenaScreen';
import { BattleScreen } from '../screens/BattleScreen';
import { ArenaShopScreen } from '../screens/ArenaShopScreen';
import { Colors, Fonts } from '../constants/theme';

export type ArenaStackParamList = {
  ArenaHome: undefined;
  Battle: { opponentId: string };
  ArenaShop: undefined;
};

const Stack = createStackNavigator<ArenaStackParamList>();

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.gold,
    letterSpacing: 2,
  },
});

function HeaderTitle({ title }: { title: string }) {
  return <Text style={styles.headerTitle}>{title}</Text>;
}

export function ArenaNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bgSecondary, borderBottomWidth: 0 },
        headerTintColor: Colors.gold,
        headerTitle: ({ children }) => <HeaderTitle title={children} />,
        cardStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen
        name="ArenaHome"
        component={ArenaScreen}
        options={{ title: '闘技場' }}
      />
      <Stack.Screen
        name="Battle"
        component={BattleScreen}
        options={{ title: 'バトル', gestureEnabled: false }}
      />
      <Stack.Screen
        name="ArenaShop"
        component={ArenaShopScreen}
        options={{ title: 'アリーナショップ' }}
      />
    </Stack.Navigator>
  );
}
