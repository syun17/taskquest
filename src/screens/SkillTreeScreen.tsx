import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Alert,
} from 'react-native';
import { PixelBorder } from '../components/common/PixelBorder';
import { GuildButton } from '../components/common/GuildButton';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { SkillId } from '../types';
import { SKILL_TREE, SKILLS } from '../constants/gameData';

interface Props {
  level: number;
  skillPoints: number;
  unlockedSkills: SkillId[];
  equippedSkills: SkillId[];
  onUnlock: (skillId: SkillId) => boolean;
  onEquip: (skillId: SkillId) => boolean;
  onUnequip: (skillId: SkillId) => void;
  onClose: () => void;
}

export function SkillTreeScreen({
  level,
  skillPoints,
  unlockedSkills,
  equippedSkills,
  onUnlock,
  onEquip,
  onUnequip,
  onClose,
}: Props) {
  const handleUnlock = (skillId: SkillId) => {
    const node = SKILL_TREE.find(n => n.skillId === skillId);
    if (!node) return;

    if (level < node.requiredLevel) {
      Alert.alert('レベル不足', `Lv${node.requiredLevel} 以上が必要です`);
      return;
    }
    if (skillPoints < node.spCost) {
      Alert.alert('SP不足', `SP${node.spCost} が必要です (所持: ${skillPoints})`);
      return;
    }
    if (node.prerequisite && !unlockedSkills.includes(node.prerequisite)) {
      const prereq = SKILLS[node.prerequisite];
      Alert.alert('前提スキル未習得', `先に「${prereq.name}」を習得してください`);
      return;
    }

    const ok = onUnlock(skillId);
    if (ok) {
      Alert.alert('スキル習得', `「${SKILLS[skillId].name}」を習得しました！`);
    }
  };

  const handleEquipToggle = (skillId: SkillId) => {
    if (equippedSkills.includes(skillId)) {
      onUnequip(skillId);
    } else {
      const ok = onEquip(skillId);
      if (!ok) {
        Alert.alert('装備スロット満杯', '装備スキルは最大3つまでです');
      }
    }
  };

  return (
    <View style={styles.container}>
      <PixelBorder style={styles.header}>
        <Text style={styles.title}>【 スキルツリー 】</Text>
        <View style={styles.headerRow}>
          <Text style={styles.spText}>SP: {skillPoints}</Text>
          <Text style={styles.slotText}>装備スロット: {equippedSkills.length}/3</Text>
        </View>
      </PixelBorder>

      <ScrollView contentContainerStyle={styles.list}>
        {SKILL_TREE.map((node, index) => {
          const skill = SKILLS[node.skillId];
          const isUnlocked = unlockedSkills.includes(node.skillId);
          const isEquipped = equippedSkills.includes(node.skillId);
          const prereqMet = !node.prerequisite || unlockedSkills.includes(node.prerequisite);
          const levelMet = level >= node.requiredLevel;
          const spMet = skillPoints >= node.spCost;
          const canUnlock = !isUnlocked && prereqMet && levelMet && spMet;

          return (
            <View key={node.skillId}>
              {index > 0 && node.prerequisite && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                </View>
              )}
              <PixelBorder style={StyleSheet.flatten([styles.card, isUnlocked && styles.cardUnlocked, isEquipped && styles.cardEquipped] as StyleProp<ViewStyle>) as ViewStyle}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.skillName, !isUnlocked && styles.locked]}>{skill.name}</Text>
                    {isEquipped && <Text style={styles.equippedBadge}>装備中</Text>}
                    {isUnlocked && !isEquipped && <Text style={styles.unlockedBadge}>習得済</Text>}
                    {!isUnlocked && <Text style={styles.lockedBadge}>未習得</Text>}
                  </View>
                  <View style={styles.meta}>
                    <Text style={styles.metaText}>必要Lv: {node.requiredLevel}</Text>
                    <Text style={styles.metaText}>SP: {node.spCost}</Text>
                    <Text style={styles.metaText}>MP: {skill.mpCost}</Text>
                  </View>
                </View>

                <Text style={[styles.skillDesc, !isUnlocked && styles.lockedText]}>{skill.description}</Text>

                {node.prerequisite && (
                  <Text style={styles.prereqText}>
                    前提: {SKILLS[node.prerequisite].name}
                    {prereqMet ? ' ✓' : ' ✗'}
                  </Text>
                )}

                <View style={styles.btnRow}>
                  {!isUnlocked ? (
                    <GuildButton
                      label={`習得 (SP${node.spCost})`}
                      onPress={() => handleUnlock(node.skillId)}
                      disabled={!canUnlock}
                      variant={canUnlock ? 'primary' : 'ghost'}
                      style={styles.btn}
                    />
                  ) : (
                    <GuildButton
                      label={isEquipped ? 'セットを外す' : 'セットする'}
                      onPress={() => handleEquipToggle(node.skillId)}
                      variant={isEquipped ? 'danger' : 'gold'}
                      style={styles.btn}
                    />
                  )}
                </View>
              </PixelBorder>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <GuildButton label="閉じる" onPress={onClose} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.green,
  },
  slotText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  connector: {
    alignItems: 'center',
    height: 16,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderDim,
  },
  card: {
    marginBottom: 2,
    padding: Spacing.md,
  },
  cardUnlocked: {
    borderColor: Colors.green,
  },
  cardEquipped: {
    borderColor: Colors.gold,
  },
  cardHeader: {
    marginBottom: Spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillName: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.text,
    flex: 1,
  },
  locked: {
    color: Colors.textDim,
  },
  equippedBadge: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.gold,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  unlockedBadge: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.green,
  },
  lockedBadge: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  skillDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  lockedText: {
    color: Colors.textDim,
  },
  prereqText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    marginBottom: Spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDim,
  },
});
