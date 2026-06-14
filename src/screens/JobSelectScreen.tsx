import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { PixelBorder } from '../components/common/PixelBorder';
import { GuildButton } from '../components/common/GuildButton';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { JobId } from '../types';
import { JOB_DATA } from '../constants/gameData';

interface Props {
  onSelect: (jobId: JobId) => void;
  onClose: () => void;
  isInitial: boolean;
  currentGold: number;
  currentJobId: JobId | null;
}

const JOB_ORDER: JobId[] = ['warrior', 'mage', 'rogue', 'priest'];

function formatMult(mult: number): string {
  const pct = Math.round((mult - 1) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export function JobSelectScreen({ onSelect, onClose, isInitial, currentGold, currentJobId }: Props) {
  return (
    <View style={styles.container}>
      <PixelBorder style={styles.header}>
        <Text style={styles.title}>【 職業選択 】</Text>
        <Text style={styles.subtitle}>
          {isInitial ? '初回選択は無料です' : `変更コスト: 500G (所持: ${currentGold}G)`}
        </Text>
      </PixelBorder>

      <ScrollView contentContainerStyle={styles.list}>
        {JOB_ORDER.map(jobId => {
          const job = JOB_DATA[jobId];
          const isCurrent = currentJobId === jobId;
          const canAfford = isInitial || currentGold >= job.changeCost;

          return (
            <PixelBorder key={jobId} style={StyleSheet.flatten([styles.card, isCurrent && styles.cardCurrent] as StyleProp<ViewStyle>) as ViewStyle}>
              <View style={styles.cardHeader}>
                <Text style={styles.jobIcon}>{job.icon}</Text>
                <View style={styles.cardTitles}>
                  <Text style={styles.jobName}>{job.name}</Text>
                  {isCurrent && <Text style={styles.currentBadge}>現在の職業</Text>}
                </View>
              </View>
              <Text style={styles.jobDesc}>{job.description}</Text>

              <View style={styles.bonusGrid}>
                <View style={styles.bonusRow}>
                  <Text style={styles.bonusLabel}>ATK</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.atkMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.atkMult)}
                  </Text>
                  <Text style={styles.bonusLabel}>DEF</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.defMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.defMult)}
                  </Text>
                </View>
                <View style={styles.bonusRow}>
                  <Text style={styles.bonusLabel}>HP</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.hpMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.hpMult)}
                  </Text>
                  <Text style={styles.bonusLabel}>MP</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.mpMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.mpMult)}
                  </Text>
                </View>
                <View style={styles.bonusRow}>
                  <Text style={styles.bonusLabel}>SPD</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.spdMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.spdMult)}
                  </Text>
                  <Text style={styles.bonusLabel}>SKILL</Text>
                  <Text style={[styles.bonusValue, { color: job.bonus.skillPowerMult >= 1 ? Colors.green : Colors.red }]}>
                    {formatMult(job.bonus.skillPowerMult)}
                  </Text>
                </View>
              </View>

              {!isCurrent && (
                <GuildButton
                  label={isInitial ? 'この職業を選ぶ' : `500G で変更する`}
                  onPress={() => onSelect(jobId)}
                  disabled={!canAfford}
                  variant={canAfford ? 'primary' : 'ghost'}
                  style={styles.selectBtn}
                />
              )}
            </PixelBorder>
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
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardCurrent: {
    borderColor: Colors.gold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  jobIcon: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  cardTitles: {
    flex: 1,
  },
  jobName: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.text,
  },
  currentBadge: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.gold,
    marginTop: 2,
  },
  jobDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    marginBottom: Spacing.sm,
  },
  bonusGrid: {
    marginBottom: Spacing.sm,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bonusLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    width: 40,
  },
  bonusValue: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    width: 50,
    marginRight: Spacing.sm,
  },
  selectBtn: {
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDim,
  },
});
