import { BattleLogEntry, JobId, ManualBattleState, Opponent, SkillId } from '../types';
import { JOB_DATA, SKILLS } from '../constants/gameData';

const CRIT_CHANCE = 0.10;
const CRIT_MULTIPLIER = 1.5;
const EVADE_CHANCE = 0.05;

function rollCritical(): boolean { return Math.random() < CRIT_CHANCE; }
function rollEvasion(): boolean { return Math.random() < EVADE_CHANCE; }

export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  maxMp: number;
}

export function calculatePlayerStats(
  level: number,
  totalAttack: number,
  totalDefense: number,
  jobId?: JobId | null,
  incarnationBonus?: { atkBonus: number; defBonus: number },
): PlayerBattleStats {
  const job = jobId ? JOB_DATA[jobId] : null;
  const bonus = job ? job.bonus : null;

  const baseHp = 100 + level * 10 + totalDefense * 2;
  const baseAtk = 5 + level * 3 + totalAttack;
  const baseDef = 2 + Math.floor(level / 2) + totalDefense;
  const baseSpd = 3 + level;
  const baseMp = 50 + level * 5;

  const ib = incarnationBonus ?? { atkBonus: 0, defBonus: 0 };

  return {
    maxHp: Math.floor(baseHp * (bonus?.hpMult ?? 1)),
    attack: Math.floor(baseAtk * (bonus?.atkMult ?? 1)) + ib.atkBonus,
    defense: Math.floor(baseDef * (bonus?.defMult ?? 1)) + ib.defBonus,
    speed: Math.floor(baseSpd * (bonus?.spdMult ?? 1)),
    maxMp: Math.floor(baseMp * (bonus?.mpMult ?? 1)),
  };
}

export function simulateBattle(
  player: PlayerBattleStats,
  opponent: Opponent,
): { won: boolean; log: BattleLogEntry[] } {
  let playerHp = player.maxHp;
  let opponentHp = opponent.hp;
  const log: BattleLogEntry[] = [];
  let turn = 1;

  const playerFirst =
    player.speed > opponent.speed ||
    (player.speed === opponent.speed && Math.random() >= 0.5);

  while (playerHp > 0 && opponentHp > 0 && turn <= 30) {
    const playerAttack = () => {
      if (rollEvasion()) {
        log.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, actionType: 'attack', isEvaded: true });
        return;
      }
      const isCritical = rollCritical();
      const variance = Math.floor(Math.random() * 7) - 3;
      let dmg = Math.max(1, player.attack - opponent.defense + variance);
      if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
      opponentHp = Math.max(0, opponentHp - dmg);
      log.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, actionType: 'attack', isCritical });
    };

    const opponentAttack = () => {
      if (rollEvasion()) {
        log.push({ turn, attacker: 'opponent', damage: 0, playerHp, opponentHp, isEvaded: true });
        return;
      }
      const variance = Math.floor(Math.random() * 7) - 3;
      const dmg = Math.max(1, opponent.attack - player.defense + variance);
      playerHp = Math.max(0, playerHp - dmg);
      log.push({ turn, attacker: 'opponent', damage: dmg, playerHp, opponentHp });
    };

    if (playerFirst) {
      playerAttack();
      if (opponentHp > 0) {
        opponentAttack();
      }
    } else {
      opponentAttack();
      if (playerHp > 0) {
        playerAttack();
      }
    }

    turn++;
  }

  return { won: playerHp > 0, log };
}

export function simulateBattleWithSkills(
  player: PlayerBattleStats,
  opponent: Opponent,
  equippedSkills: SkillId[],
  jobId?: JobId | null,
): { won: boolean; log: BattleLogEntry[] } {
  let playerHp = player.maxHp;
  let opponentHp = opponent.hp;
  let playerMp = player.maxMp;
  const log: BattleLogEntry[] = [];
  let turn = 1;

  const job = jobId ? JOB_DATA[jobId] : null;
  const skillPowerMult = job?.bonus.skillPowerMult ?? 1;

  const playerFirst =
    player.speed > opponent.speed ||
    (player.speed === opponent.speed && Math.random() >= 0.5);

  while (playerHp > 0 && opponentHp > 0 && turn <= 30) {
    const usableSkills = equippedSkills.filter(id => {
      const sk = SKILLS[id];
      return sk && playerMp >= sk.mpCost;
    });
    const useSkill = usableSkills.length > 0 && Math.random() < 0.4;
    const chosenSkillId = useSkill ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;

    const playerTurn = () => {
      if (chosenSkillId) {
        const sk = SKILLS[chosenSkillId];
        playerMp = Math.max(0, playerMp - sk.mpCost);
        if (sk.effect.type === 'damage') {
          if (rollEvasion()) {
            log.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: chosenSkillId, actionType: 'skill', isEvaded: true });
            return;
          }
          const isCritical = rollCritical();
          const variance = Math.floor(Math.random() * 7) - 3;
          let dmg = Math.max(1, Math.floor(player.attack * sk.effect.power * skillPowerMult) - opponent.defense + variance);
          if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
          opponentHp = Math.max(0, opponentHp - dmg);
          log.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, skillUsed: chosenSkillId, actionType: 'skill', isCritical });
        } else if (sk.effect.type === 'heal') {
          const healAmt = Math.floor(sk.effect.power * skillPowerMult);
          playerHp = Math.min(player.maxHp, playerHp + healAmt);
          log.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: chosenSkillId, actionType: 'heal', healAmount: healAmt });
        } else {
          if (rollEvasion()) {
            log.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: chosenSkillId, actionType: 'skill', isEvaded: true });
            return;
          }
          const isCritical = rollCritical();
          const variance = Math.floor(Math.random() * 7) - 3;
          let dmg = Math.max(1, player.attack - opponent.defense + variance);
          if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
          opponentHp = Math.max(0, opponentHp - dmg);
          log.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, skillUsed: chosenSkillId, actionType: 'skill', isCritical });
        }
      } else {
        if (rollEvasion()) {
          log.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, actionType: 'attack', isEvaded: true });
          return;
        }
        const isCritical = rollCritical();
        const variance = Math.floor(Math.random() * 7) - 3;
        let dmg = Math.max(1, player.attack - opponent.defense + variance);
        if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
        opponentHp = Math.max(0, opponentHp - dmg);
        log.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, actionType: 'attack', isCritical });
      }
    };

    const opponentTurn = () => {
      if (rollEvasion()) {
        log.push({ turn, attacker: 'opponent', damage: 0, playerHp, opponentHp, isEvaded: true });
        return;
      }
      const variance = Math.floor(Math.random() * 7) - 3;
      const dmg = Math.max(1, opponent.attack - player.defense + variance);
      playerHp = Math.max(0, playerHp - dmg);
      log.push({ turn, attacker: 'opponent', damage: dmg, playerHp, opponentHp });
    };

    if (playerFirst) {
      playerTurn();
      if (opponentHp > 0) opponentTurn();
    } else {
      opponentTurn();
      if (playerHp > 0) playerTurn();
    }

    turn++;
  }

  return { won: playerHp > 0, log };
}

export function executePlayerAction(
  action: 'attack' | 'skill' | 'defend',
  skillId: SkillId | null,
  state: ManualBattleState,
  player: PlayerBattleStats,
  opponent: Opponent,
  jobId?: JobId | null,
): ManualBattleState {
  const job = jobId ? JOB_DATA[jobId] : null;
  const skillPowerMult = job?.bonus.skillPowerMult ?? 1;

  let { playerHp, opponentHp, playerMp, turn, buffPlayerDef, debuffOpponentDef, poisonTurns, hasteTurns } = state;
  const newLog = [...state.log];

  if (action === 'attack') {
    if (rollEvasion()) {
      newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, actionType: 'attack', isEvaded: true });
    } else {
      const isCritical = rollCritical();
      const variance = Math.floor(Math.random() * 7) - 3;
      const effectiveDef = Math.max(0, opponent.defense - debuffOpponentDef);
      let dmg = Math.max(1, player.attack - effectiveDef + variance);
      if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
      opponentHp = Math.max(0, opponentHp - dmg);
      newLog.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, actionType: 'attack', isCritical });
    }
  } else if (action === 'defend') {
    newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, actionType: 'defend' });
  } else if (action === 'skill' && skillId) {
    const sk = SKILLS[skillId];
    if (sk && playerMp >= sk.mpCost) {
      playerMp = Math.max(0, playerMp - sk.mpCost);
      const eff = sk.effect;
      if (eff.type === 'damage') {
        if (rollEvasion()) {
          newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill', isEvaded: true });
        } else {
          const isCritical = rollCritical();
          const variance = Math.floor(Math.random() * 7) - 3;
          const effectiveDef = Math.max(0, opponent.defense - debuffOpponentDef);
          let dmg = Math.max(1, Math.floor(player.attack * eff.power * skillPowerMult) - effectiveDef + variance);
          if (isCritical) dmg = Math.floor(dmg * CRIT_MULTIPLIER);
          opponentHp = Math.max(0, opponentHp - dmg);
          newLog.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill', isCritical });
        }
      } else if (eff.type === 'heal') {
        const healAmt = Math.floor(eff.power * skillPowerMult);
        playerHp = Math.min(player.maxHp, playerHp + healAmt);
        newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'heal', healAmount: healAmt });
      } else if (eff.type === 'buff' && eff.stat === 'defense') {
        buffPlayerDef = Math.floor(player.defense * eff.power);
        newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill' });
      } else if (eff.type === 'debuff' && eff.stat === 'defense') {
        debuffOpponentDef = Math.floor(opponent.defense * eff.power);
        newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill' });
      } else if (eff.type === 'debuff' && !eff.stat) {
        poisonTurns = eff.duration ?? 3;
        newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill' });
      } else if (eff.type === 'buff' && eff.stat === 'speed') {
        hasteTurns = eff.duration ?? 2;
        newLog.push({ turn, attacker: 'player', damage: 0, playerHp, opponentHp, skillUsed: skillId, actionType: 'skill' });
      }
    }
  }

  if (opponentHp <= 0) {
    return { ...state, playerHp, opponentHp, playerMp, log: newLog, isPlayerTurn: false, buffPlayerDef, debuffOpponentDef, poisonTurns, hasteTurns };
  }

  // 敵のターン
  const isDefending = action === 'defend';
  if (rollEvasion()) {
    newLog.push({ turn, attacker: 'opponent', damage: 0, playerHp, opponentHp, isEvaded: true });
  } else {
    const effectivePDef = player.defense + buffPlayerDef;
    const variance2 = Math.floor(Math.random() * 7) - 3;
    let dmg2 = Math.max(1, opponent.attack - effectivePDef + variance2);
    if (isDefending) dmg2 = Math.floor(dmg2 * 0.5);
    playerHp = Math.max(0, playerHp - dmg2);
    newLog.push({ turn, attacker: 'opponent', damage: dmg2, playerHp, opponentHp });
  }

  // 毒ダメージ
  if (poisonTurns > 0) {
    const poisonDmg = Math.max(1, Math.floor(opponent.hp * 0.05));
    opponentHp = Math.max(0, opponentHp - poisonDmg);
    poisonTurns--;
    newLog.push({ turn, attacker: 'player', damage: poisonDmg, playerHp, opponentHp, actionType: 'skill' });
  }

  // バフ期限消費
  if (buffPlayerDef > 0) buffPlayerDef = Math.max(0, buffPlayerDef - 1);
  if (hasteTurns > 0) hasteTurns--;

  return {
    ...state,
    playerHp,
    opponentHp,
    playerMp,
    turn: turn + 1,
    isPlayerTurn: true,
    log: newLog,
    buffPlayerDef,
    debuffOpponentDef,
    poisonTurns,
    hasteTurns,
  };
}
