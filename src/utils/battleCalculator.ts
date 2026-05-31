import { BattleLogEntry, Opponent } from '../types';

export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export function calculatePlayerStats(
  level: number,
  totalAttack: number,
  totalDefense: number,
): PlayerBattleStats {
  return {
    maxHp: 100 + level * 10 + totalDefense * 2,
    attack: 5 + level * 3 + totalAttack,
    defense: 2 + Math.floor(level / 2) + totalDefense,
    speed: 3 + level,
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
      const variance = Math.floor(Math.random() * 7) - 3;
      const dmg = Math.max(1, player.attack - opponent.defense + variance);
      opponentHp = Math.max(0, opponentHp - dmg);
      log.push({ turn, attacker: 'player', damage: dmg, playerHp, opponentHp });
    };

    const opponentAttack = () => {
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
