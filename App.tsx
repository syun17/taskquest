import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useCharacterStore } from './src/store/useCharacterStore';
import { useQuestStore } from './src/store/useQuestStore';
import { useInventoryStore } from './src/store/useInventoryStore';
import { useBattleStore } from './src/store/useBattleStore';

function App() {
  const loadCharacter = useCharacterStore(s => s.load);
  const loadQuests = useQuestStore(s => s.load);
  const loadInventory = useInventoryStore(s => s.load);
  const loadBattle = useBattleStore(s => s.load);

  useEffect(() => {
    loadCharacter();
    loadQuests();
    loadInventory();
    loadBattle();
  }, [loadCharacter, loadQuests, loadInventory, loadBattle]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
