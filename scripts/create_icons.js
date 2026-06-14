'use strict';
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// Colors (RGB)
const B = [0, 0, 0];        // black (background)
const G = [215, 170, 50];   // gold
const D = [140, 100, 30];   // dark gold / shadow
const S = [200, 200, 210];  // silver / highlight
const K = [220, 170, 110];  // skin
const C = [50, 195, 215];   // cyan accent
const L = [80, 120, 200];   // blue (clothes)
const N = [50, 80, 150];    // dark blue (shadow)
const O = [230, 120, 30];   // orange
const Y = [255, 230, 50];   // yellow
const R = [210, 50, 50];    // red
const V = [60, 180, 80];    // green (heal)
const W = [240, 240, 240];  // white/silver highlight
const P = [130, 60, 180];   // purple
const M = [190, 140, 230];  // light purple

// --- 16x16 pixel designs (scaled to 128x128 at factor=8) ---

// Human adventurer figure (blue clothes) → "キャラ" tab
const char16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,K,K,K,K,B,B,B,B,B,B],  // 1 - head top
  [B,B,B,B,B,K,K,K,K,K,K,B,B,B,B,B],  // 2 - head
  [B,B,B,B,B,K,K,K,K,K,K,B,B,B,B,B],  // 3 - head
  [B,B,B,B,B,B,K,K,K,K,B,B,B,B,B,B],  // 4 - head bottom / neck
  [B,B,B,B,B,B,K,K,K,K,B,B,B,B,B,B],  // 5 - neck
  [B,B,B,G,G,G,L,L,L,L,G,G,G,B,B,B],  // 6 - gold pauldrons + blue tunic
  [B,B,G,G,G,L,L,L,L,L,L,G,G,G,B,B],  // 7 - wide shoulders
  [B,B,G,L,L,L,L,L,L,L,L,L,L,G,B,B],  // 8 - chest (blue)
  [B,B,G,L,L,G,L,L,L,L,G,L,L,G,B,B],  // 9 - gold belt buckles
  [B,B,B,G,G,G,L,L,L,L,G,G,G,B,B,B],  // 10 - waist / gold trim
  [B,B,B,B,L,L,B,B,B,B,L,L,B,B,B,B],  // 11 - blue legs
  [B,B,B,B,L,L,B,B,B,B,L,L,B,B,B,B],  // 12 - blue legs
  [B,B,B,B,N,L,B,B,B,B,L,N,B,B,B,B],  // 13 - lower legs (shadow)
  [B,B,B,B,D,D,B,B,B,B,D,D,B,B,B,B],  // 14 - dark boots
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Knight helmet + pauldrons → BattleScreen monster
const monster16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,B,B,B,G,G,G,G,G,G,B,B,B,B,B],
  [B,B,B,B,G,G,D,D,D,D,G,G,B,B,B,B],
  [B,B,B,B,G,D,S,S,S,S,D,G,B,B,B,B],
  [B,B,B,B,G,D,S,C,C,S,D,G,B,B,B,B],
  [B,B,B,B,G,D,S,C,C,S,D,G,B,B,B,B],
  [B,B,B,B,G,G,D,D,D,D,G,G,B,B,B,B],
  [B,B,B,G,G,K,K,K,K,K,K,G,G,B,B,B],
  [B,B,B,G,K,K,K,K,K,K,K,K,G,B,B,B],
  [B,B,B,G,K,K,K,K,K,K,K,K,G,B,B,B],
  [B,B,B,G,G,K,K,K,K,K,K,G,G,B,B,B],
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],
  [B,G,G,D,G,G,G,G,G,G,G,G,D,G,G,B],
  [B,G,G,D,G,G,G,G,G,G,G,G,D,G,G,B],
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
];

// Trophy cup → "アリーナ" tab
const arena16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],
  [B,G,G,D,D,D,D,D,D,D,D,D,D,G,G,B],
  [B,G,D,D,D,S,S,S,S,S,S,D,D,D,G,B],
  [B,G,D,D,D,S,S,S,S,S,S,D,D,D,G,B],
  [B,G,D,D,D,D,D,D,D,D,D,D,D,D,G,B],
  [B,B,G,G,D,D,D,D,D,D,D,D,G,G,B,B],
  [B,B,B,B,G,G,G,G,G,G,G,G,B,B,B,B],
  [B,B,B,B,B,G,G,G,G,G,G,B,B,B,B,B],
  [B,B,B,G,G,G,G,G,G,G,G,G,G,B,B,B],
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],
  [B,B,G,D,D,D,D,D,D,D,D,D,D,G,B,B],
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
];

// Flame / fire → fireball skill, streak, fire achievements
const flame16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,Y,B,B,B,B,B,B,B,B],  // 1 - tip
  [B,B,B,B,B,B,Y,Y,Y,B,B,B,B,B,B,B],  // 2
  [B,B,B,B,B,O,Y,Y,Y,O,B,B,B,B,B,B],  // 3
  [B,B,B,B,O,O,Y,Y,O,O,B,B,B,B,B,B],  // 4
  [B,B,B,O,O,O,O,Y,O,O,O,B,B,B,B,B],  // 5
  [B,B,B,O,O,O,O,O,O,O,O,B,B,B,B,B],  // 6
  [B,B,B,O,O,O,R,R,O,O,O,B,B,B,B,B],  // 7
  [B,B,B,O,O,R,R,R,R,O,O,B,B,B,B,B],  // 8
  [B,B,B,O,R,R,R,R,R,R,O,B,B,B,B,B],  // 9
  [B,B,R,R,R,R,R,R,R,R,R,R,B,B,B,B],  // 10
  [B,B,R,R,R,R,R,R,R,R,R,R,B,B,B,B],  // 11
  [B,B,R,R,R,R,R,R,R,R,R,R,B,B,B,B],  // 12
  [B,B,B,R,R,R,R,R,R,R,R,B,B,B,B,B],  // 13
  [B,B,B,B,R,R,R,R,R,R,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Heal cross → heal skill
const heal16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 1
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 2
  [B,B,B,B,B,B,V,W,W,V,B,B,B,B,B,B],  // 3 - highlight
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 4
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 5
  [B,B,B,V,V,V,V,V,V,V,V,V,V,B,B,B],  // 6 - horizontal bar
  [B,B,B,V,V,V,V,W,W,V,V,V,V,B,B,B],  // 7 - highlight
  [B,B,B,V,V,V,V,V,V,V,V,V,V,B,B,B],  // 8
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 9
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 10
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 11
  [B,B,B,B,B,B,V,V,V,V,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Shield → shield skill, defend button, battle achievement
const shield16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 1
  [B,B,B,G,G,G,G,G,G,G,G,G,G,B,B,B],  // 2
  [B,B,G,G,G,G,G,G,G,G,G,G,G,G,B,B],  // 3
  [B,B,G,G,S,S,S,S,S,S,S,S,G,G,B,B],  // 4 - silver interior
  [B,B,G,G,S,S,S,S,S,S,S,S,G,G,B,B],  // 5
  [B,B,G,G,S,S,G,G,G,G,S,S,G,G,B,B],  // 6 - emblem
  [B,B,G,G,S,G,G,G,G,G,G,S,G,G,B,B],  // 7
  [B,B,G,G,S,G,G,G,G,G,G,S,G,G,B,B],  // 8
  [B,B,B,G,G,S,S,G,G,S,S,G,G,B,B,B],  // 9 - narrowing
  [B,B,B,G,G,S,S,S,S,S,S,G,G,B,B,B],  // 10
  [B,B,B,B,G,G,G,G,G,G,G,G,B,B,B,B],  // 11
  [B,B,B,B,B,G,G,G,G,G,G,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,G,G,G,G,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,G,G,B,B,B,B,B,B,B],  // 14 - pointed bottom
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Skull → poison skill
const skull16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,W,W,W,W,W,W,B,B,B,B,B],  // 1
  [B,B,B,B,W,W,W,W,W,W,W,W,B,B,B,B],  // 2
  [B,B,B,W,W,W,W,W,W,W,W,W,W,B,B,B],  // 3
  [B,B,B,W,W,C,C,W,W,C,C,W,W,B,B,B],  // 4 - eyes
  [B,B,B,W,W,C,C,W,W,C,C,W,W,B,B,B],  // 5 - eyes
  [B,B,B,W,W,W,W,W,W,W,W,W,W,B,B,B],  // 6
  [B,B,B,W,W,W,W,W,W,W,W,W,W,B,B,B],  // 7
  [B,B,B,B,W,W,W,W,W,W,W,W,B,B,B,B],  // 8 - jaw
  [B,B,B,B,W,W,W,W,W,W,W,W,B,B,B,B],  // 9
  [B,B,B,B,W,B,W,B,W,B,W,W,B,B,B,B],  // 10 - teeth
  [B,B,B,B,W,B,W,B,W,B,W,W,B,B,B,B],  // 11 - teeth
  [B,B,B,B,W,W,W,W,W,W,W,W,B,B,B,B],  // 12
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Lightning bolt → haste skill
const bolt16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,Y,Y,Y,Y,Y,B,B,B,B,B,B],  // 1
  [B,B,B,B,Y,Y,Y,Y,Y,B,B,B,B,B,B,B],  // 2
  [B,B,B,Y,Y,Y,Y,Y,B,B,B,B,B,B,B,B],  // 3
  [B,B,B,Y,Y,Y,Y,Y,Y,Y,Y,B,B,B,B,B],  // 4 - wide body
  [B,B,B,B,Y,Y,Y,Y,Y,Y,Y,Y,B,B,B,B],  // 5
  [B,B,B,B,B,Y,Y,Y,Y,Y,Y,B,B,B,B,B],  // 6
  [B,B,B,B,B,B,Y,Y,Y,Y,B,B,B,B,B,B],  // 7
  [B,B,B,B,B,B,Y,Y,Y,B,B,B,B,B,B,B],  // 8
  [B,B,B,B,B,B,Y,Y,B,B,B,B,B,B,B,B],  // 9
  [B,B,B,B,B,Y,Y,Y,B,B,B,B,B,B,B,B],  // 10
  [B,B,B,B,Y,Y,Y,B,B,B,B,B,B,B,B,B],  // 11
  [B,B,B,B,Y,Y,B,B,B,B,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Claw marks → rend skill (3 diagonal slashes)
const claw16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,R,R,B,B,R,R,B,B,R,R,B,B,B,B,B],  // 1
  [B,B,R,R,B,B,R,R,B,B,R,R,B,B,B,B],  // 2
  [B,B,B,R,R,B,B,R,R,B,B,R,R,B,B,B],  // 3
  [B,B,B,B,R,R,B,B,R,R,B,B,R,R,B,B],  // 4
  [B,B,B,B,B,R,R,B,B,R,R,B,B,R,R,B],  // 5
  [B,B,B,B,B,B,R,R,B,B,R,R,B,B,R,B],  // 6
  [B,B,B,B,B,B,B,R,R,B,B,R,R,B,B,B],  // 7
  [B,B,B,B,B,B,B,B,R,R,B,B,R,R,B,B],  // 8
  [B,B,B,B,B,B,B,B,B,R,R,B,B,R,R,B],  // 9
  [B,B,B,B,B,B,B,B,B,B,R,R,B,B,R,B],  // 10
  [B,B,B,B,B,B,B,B,B,B,B,R,R,B,B,B],  // 11
  [B,B,B,B,B,B,B,B,B,B,B,B,R,R,B,B],  // 12
  [B,B,B,B,B,B,B,B,B,B,B,B,B,R,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// 4-pointed star → divine_light skill, priest job, top achievements
const star16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,G,B,B,B,B,B,B,B,B],  // 1 - top tip
  [B,B,B,B,B,B,G,Y,G,B,B,B,B,B,B,B],  // 2
  [B,B,B,B,B,G,G,Y,G,G,B,B,B,B,B,B],  // 3
  [B,B,B,B,G,G,G,Y,G,G,G,B,B,B,B,B],  // 4
  [B,B,B,G,G,G,G,Y,G,G,G,G,B,B,B,B],  // 5
  [B,G,G,G,G,G,G,Y,G,G,G,G,G,G,B,B],  // 6 - horizontal ray
  [G,G,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,G,G,B,B],  // 7 - center
  [B,G,G,G,G,G,G,Y,G,G,G,G,G,G,B,B],  // 8 - horizontal ray
  [B,B,B,G,G,G,G,Y,G,G,G,G,B,B,B,B],  // 9
  [B,B,B,B,G,G,G,Y,G,G,G,B,B,B,B,B],  // 10
  [B,B,B,B,B,G,G,Y,G,G,B,B,B,B,B,B],  // 11
  [B,B,B,B,B,B,G,Y,G,B,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,B,G,B,B,B,B,B,B,B,B],  // 13 - bottom tip
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Magic orb → mage job
const orb16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,P,P,P,P,P,B,B,B,B,B,B],  // 1
  [B,B,B,B,P,P,P,P,P,P,P,B,B,B,B,B],  // 2
  [B,B,B,P,P,P,M,M,P,P,P,P,B,B,B,B],  // 3 - highlight
  [B,B,B,P,P,M,M,M,P,P,P,P,B,B,B,B],  // 4
  [B,B,B,P,P,P,P,P,P,P,P,P,B,B,B,B],  // 5
  [B,B,B,P,P,P,P,P,P,P,P,P,B,B,B,B],  // 6
  [B,B,B,P,P,P,C,C,C,P,P,P,B,B,B,B],  // 7 - cyan inner glow
  [B,B,B,P,P,P,C,C,C,P,P,P,B,B,B,B],  // 8
  [B,B,B,P,P,P,P,P,P,P,P,P,B,B,B,B],  // 9
  [B,B,B,P,P,P,P,P,P,P,P,P,B,B,B,B],  // 10
  [B,B,B,B,P,P,P,P,P,P,P,B,B,B,B,B],  // 11
  [B,B,B,B,B,P,P,P,P,P,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,G,G,G,B,B,B,B,B,B,B],  // 13 - gold stand
  [B,B,B,B,B,G,G,G,G,G,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Dagger → rogue job
const dagger16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,S,B,B,B,B,B,B,B,B],  // 1 - tip
  [B,B,B,B,B,B,S,S,S,B,B,B,B,B,B,B],  // 2
  [B,B,B,B,B,B,S,W,S,B,B,B,B,B,B,B],  // 3 - highlight
  [B,B,B,B,B,B,S,W,S,B,B,B,B,B,B,B],  // 4
  [B,B,B,B,B,B,S,W,S,B,B,B,B,B,B,B],  // 5
  [B,B,B,B,B,B,S,W,S,B,B,B,B,B,B,B],  // 6
  [B,D,D,D,D,D,D,D,D,D,D,D,D,B,B,B],  // 7 - crossguard
  [B,D,D,D,D,D,D,D,D,D,D,D,D,B,B,B],  // 8 - crossguard
  [B,B,B,B,B,B,G,G,G,B,B,B,B,B,B,B],  // 9 - handle
  [B,B,B,B,B,B,G,G,G,B,B,B,B,B,B,B],  // 10
  [B,B,B,B,B,B,G,G,G,B,B,B,B,B,B,B],  // 11
  [B,B,B,B,B,B,G,G,G,B,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,G,D,D,D,G,B,B,B,B,B,B],  // 13 - pommel
  [B,B,B,B,B,G,D,D,D,G,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Scroll → quest achievements, notice board icon
const scroll16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,G,G,G,G,G,G,G,G,G,G,B,B,B],  // 1 - top edge
  [B,B,G,D,G,G,G,G,G,G,G,G,D,G,B,B],  // 2 - rolled top
  [B,B,G,D,K,K,K,K,K,K,K,K,D,G,B,B],  // 3 - parchment
  [B,B,G,D,K,S,S,S,S,S,S,K,D,G,B,B],  // 4 - content lines
  [B,B,G,D,K,S,S,S,S,S,S,K,D,G,B,B],  // 5
  [B,B,G,D,K,K,K,K,K,K,K,K,D,G,B,B],  // 6 - gap
  [B,B,G,D,K,S,S,S,S,S,S,K,D,G,B,B],  // 7 - content
  [B,B,G,D,K,S,S,S,S,S,S,K,D,G,B,B],  // 8
  [B,B,G,D,K,K,K,K,K,K,K,K,D,G,B,B],  // 9 - gap
  [B,B,G,D,K,S,S,S,S,S,S,K,D,G,B,B],  // 10 - content
  [B,B,G,D,K,K,K,K,K,K,K,K,D,G,B,B],  // 11
  [B,B,G,D,G,G,G,G,G,G,G,G,D,G,B,B],  // 12 - rolled bottom
  [B,B,B,G,G,G,G,G,G,G,G,G,G,B,B,B],  // 13 - bottom edge
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Crown → arena rank achievements, top ranks
const crown16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 1
  [B,G,B,B,B,G,B,B,B,G,B,B,B,G,B,B],  // 2 - crown spikes
  [B,G,B,B,G,G,B,B,G,G,B,B,G,G,B,B],  // 3
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,B],  // 4 - crown body top
  [G,G,D,G,D,G,C,G,C,G,D,G,D,G,G,B],  // 5 - gems
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,B],  // 6
  [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,B],  // 7
  [B,G,G,G,G,G,G,G,G,G,G,G,G,G,B,B],  // 8 - crown brim
  [B,G,G,G,G,G,G,G,G,G,G,G,G,G,B,B],  // 9
  [B,B,G,G,G,G,G,G,G,G,G,G,G,B,B,B],  // 10
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 11
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 12
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Gem / diamond → guild rank, reincarnation achievements
const gem16 = [
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 0
  [B,B,B,B,B,B,B,C,B,B,B,B,B,B,B,B],  // 1 - top tip
  [B,B,B,B,B,B,C,C,C,B,B,B,B,B,B,B],  // 2
  [B,B,B,B,B,C,C,W,C,C,B,B,B,B,B,B],  // 3 - highlight
  [B,B,B,B,C,C,W,C,C,C,C,B,B,B,B,B],  // 4
  [B,B,B,C,C,C,C,C,C,C,C,C,B,B,B,B],  // 5 - facet lines
  [B,B,C,C,C,C,C,C,C,C,C,C,C,B,B,B],  // 6 - widest
  [B,B,C,L,L,L,L,C,C,L,L,C,C,B,B,B],  // 7 - blue facets
  [B,B,B,C,L,L,C,C,C,C,C,C,B,B,B,B],  // 8
  [B,B,B,B,C,C,C,C,C,C,C,B,B,B,B,B],  // 9 - narrowing
  [B,B,B,B,B,C,C,C,C,C,B,B,B,B,B,B],  // 10
  [B,B,B,B,B,B,C,C,C,B,B,B,B,B,B,B],  // 11
  [B,B,B,B,B,B,B,C,B,B,B,B,B,B,B,B],  // 12 - bottom tip
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 13
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 14
  [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],  // 15
];

// Scale each "macro-pixel" by factor (16x16 → 128x128 at factor=8)
function scale(grid, factor) {
  const out = [];
  for (const row of grid) {
    const bigRow = [];
    for (const px of row) {
      for (let i = 0; i < factor; i++) bigRow.push(px);
    }
    for (let i = 0; i < factor; i++) out.push(bigRow);
  }
  return out;
}

// Encode pixels as PNG binary
function makePNG(pixels) {
  const h = pixels.length;
  const w = pixels[0].length;

  // Raw scanlines: filter_byte(None=0) + R G B per pixel
  const raw = [];
  for (let y = 0; y < h; y++) {
    raw.push(0);
    for (let x = 0; x < w; x++) {
      raw.push(pixels[y][x][0], pixels[y][x][1], pixels[y][x][2]);
    }
  }
  const idat = zlib.deflateSync(Buffer.from(raw));

  // CRC-32 (required by PNG spec)
  const crcT = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcT[i] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) c = (c >>> 8) ^ crcT[(c ^ b) & 0xff];
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([lenBuf, t, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'src', 'assets', 'icons');
const SCALE = 8; // 16×16 → 128×128

const icons = [
  ['character.png', char16],
  ['monster.png',   monster16],
  ['arena.png',     arena16],
  ['flame.png',     flame16],
  ['heal.png',      heal16],
  ['shield.png',    shield16],
  ['skull.png',     skull16],
  ['bolt.png',      bolt16],
  ['claw.png',      claw16],
  ['star.png',      star16],
  ['orb.png',       orb16],
  ['dagger.png',    dagger16],
  ['scroll.png',    scroll16],
  ['crown.png',     crown16],
  ['gem.png',       gem16],
];

for (const [name, grid] of icons) {
  fs.writeFileSync(path.join(outDir, name), makePNG(scale(grid, SCALE)));
  console.log(`  ${name} created`);
}

console.log('Done. Output directory:', outDir);
