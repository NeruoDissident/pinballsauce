/* Crush Hour: the layout. Pure data, read by engine/table/build.js. See docs/TABLE_FORMAT.md.

   Three playfields standing as a heart (`at: [column, row]`):

        row 0     [ school ]     [ plaza ]      columns -0.5 and 0.5: the two lobes. Both drain into ramps to Home
        row 1            [ home ]               column 0: the point of the heart. The plunger and the real drain

     school  Sakura High       the Club Room in the middle (desks either side of a door, the Rooftop stair behind it),
                               the Lockers (the two-ball lock), the Track (a lap round the top), the Nurse's Office
     plaza   Starlight Plaza   the Crepe Stand in the middle, the Ferris Wheel (a spinner lane), the Photo Booth, the
                               Wishing Fountain, the Coaster (a lap round the top)
     home    Maple Street      Porch Lights, the Heartbeats, the Garden Gate, the Sweet Shop, the Bike Rack, the Boba
                               Cafe, the Bus Stop; the School Run and the Plaza Line climb to the two lobes

   The cleft between the lobes carries two ramps that cross over its top: the Sky Bridge (school to plaza) and the
   Promenade (plaza to school). Each comes down the cleft and hooks into the far lobe's inner inlane.

   Where the geometry comes from: each lobe is the shot-tested symmetric field of docs/NEW_TABLE_CHECKLIST.md
   (Appendix A), the home field is its home field, and the roads up and the drain ramps are the test bench's. The
   two bridges are this table's own.

   Inside a field's `pieces` a point [x, y] is measured from that field's own top-left corner. Ramp paths and tunnel
   waypoints cross fields, so they are written ['#fieldId', x, y]. The plaza is the school mirrored about the
   heart's axis: a school point (x, y) is the plaza point (640 - x, y). */
const aL = Math.atan2(-0.925, -0.38),
  aR = Math.atan2(-0.925, 0.38); // the two directions ramps leave the flippers in
const PINK = '#ff7eb6',
  SKY = '#7fd4ff',
  GOLD = '#ffd24a',
  MINT = '#8ff0c8';
const lights = (c, c2, xr) => [
  [30, 640, c, 110],
  [(xr || 620) - 10, 640, c, 110],
  [96, 452, c, 110],
  [(xr || 620) - 76, 452, c, 110],
  [320, 40, c2, 150],
  [150, 150, c, 110],
  [490, 150, c, 110]
];
// the Sky Bridge, school to plaza: up from the school's right mouth, over the top of the cleft, down the plaza's
// side of it and into the plaza's left inlane. The Promenade is its mirror.
const bridge = [
  ['#school', 528, 300],
  ['#school', 574, 200],
  ['#school', 626, 142],
  ['#plaza', -36, 112],
  ['#plaza', -18, 104],
  ['#plaza', -6, 118],
  ['#plaza', -2, 160],
  ['#plaza', -4, 320],
  ['#plaza', -4, 520],
  ['#plaza', 8, 596],
  ['#plaza', 40, 644],
  ['#plaza', 68, 664],
  ['#plaza', 80, 688],
  ['#plaza', 81, 716]
];
const mirror = path => path.map(p => [p[0] === '#school' ? '#plaza' : '#school', 640 - p[1], p[2]]);

export const layout = {
  fields: [
    /* ---------- SAKURA HIGH (the left lobe) ---------- */
    {
      id: 'school',
      name: 'Sakura High',
      short: 'Sakura High',
      at: [-0.5, 0],
      statue: {id: 'trophy', x: 320, y: 178, r: 20},
      boss: {x: 320, y: 650},
      spawn: [
        [150, 585],
        [225, 640],
        [320, 600],
        [415, 640],
        [490, 585],
        [236, 578],
        [370, 560],
        [320, 690]
      ],
      pieces: [
        {t: 'bumper', x: 236, y: 232, r: 24, group: 'bells', conduit: true},
        {t: 'bumper', x: 404, y: 232, r: 24, group: 'bells', conduit: true},
        {t: 'bumper', x: 320, y: 262, r: 24, group: 'bells', conduit: true},
        {t: 'mouth', id: 'track', x: 188, y: 480, side: -1},
        {t: 'mouth', id: 'skywalk', x: 452, y: 480, side: 1},
        {t: 'scoopBlock', mouth: 'track', side: -1, xg: 66, topY: 380, name: 'lockers'},
        {t: 'hole', id: 'lockers', name: 'Lockers', x: 112, y: 488, r: 13, eject: 'L'},
        {t: 'wall', w: 3, pts: ['@track.rb', '@track.rt']},
        // the Club Room: desks either side of the Clubroom Door, the Rooftop stair behind it
        {t: 'bank', id: 'desks', name: 'Desks', kind: 'drop', from: [248, 396], to: [300, 372], n: 2},
        {t: 'bank', id: 'desks', kind: 'drop', from: [340, 372], to: [392, 396], n: 2},
        {
          t: 'bank',
          id: 'clubDoor',
          name: 'Clubroom Door',
          kind: 'drop',
          from: [300, 372],
          to: [320, 366],
          n: 1,
          door: {time: 22, popup: ['Clubroom Open', 'The Rooftop stair is clear']}
        },
        {t: 'bank', id: 'clubDoor', kind: 'drop', from: [320, 366], to: [340, 372], n: 1},
        {
          t: 'wall',
          w: 3,
          style: 'scoop',
          pts: [
            [300, 372],
            [298, 346],
            [308, 332],
            [320, 328],
            [332, 332],
            [342, 346],
            [340, 372]
          ]
        },
        {t: 'hole', id: 'rooftop', name: 'Rooftop', x: 320, y: 352, r: 13, eject: 'R'},
        // the Globe: a spinner lane left of centre, straight up into the desks
        {
          t: 'wall',
          w: 3,
          pts: [
            [252, 548],
            [252, 468]
          ]
        },
        {
          t: 'wall',
          w: 3,
          pts: [
            [296, 548],
            [296, 468]
          ]
        },
        {t: 'spinner', id: 'globe', x: 274, y: 508, r: 20},
        {t: 'wall', w: 3, pts: ['@skywalk.lb', '@skywalk.lt']},
        {t: 'scoopBlock', mouth: 'skywalk', side: 1, xg: 574, topY: 380, name: 'nurse'},
        {t: 'hole', id: 'nurse', name: "Nurse's Office", x: 528, y: 488, r: 13, eject: 'R'},
        {t: 'floorSet', id: 'passes', name: 'Hall Passes', col: '#d8f3ff'}, // the two inlanes and two outlanes, lit as one set
        // the lock's own lamps, beside the Lockers
        {t: 'lamp', x: 150, y: 600, show: 'lockLit', label: 'lock', col: MINT},
        {t: 'lamp', x: 150, y: 632, show: 'lock1', label: 'letter 1', col: MINT}
      ],
      torches: lights(SKY, '#e8f8ff')
    },

    /* ---------- STARLIGHT PLAZA (the right lobe) ---------- */
    {
      id: 'plaza',
      name: 'Starlight Plaza',
      short: 'the Plaza',
      at: [0.5, 0],
      statue: {id: 'cupid', x: 320, y: 178, r: 20},
      boss: {x: 320, y: 650},
      spawn: [
        [150, 585],
        [225, 640],
        [320, 600],
        [415, 640],
        [490, 585],
        [404, 578],
        [270, 560],
        [320, 690]
      ],
      pieces: [
        {t: 'bumper', x: 236, y: 232, r: 24, group: 'claws', conduit: true},
        {t: 'bumper', x: 404, y: 232, r: 24, group: 'claws', conduit: true},
        {t: 'bumper', x: 320, y: 262, r: 24, group: 'claws', conduit: true},
        {t: 'mouth', id: 'promenade', x: 188, y: 480, side: -1},
        {t: 'mouth', id: 'coaster', x: 452, y: 480, side: 1},
        {t: 'scoopBlock', mouth: 'promenade', side: -1, xg: 66, topY: 380, name: 'photo'},
        {t: 'hole', id: 'photo', name: 'Photo Booth', x: 112, y: 488, r: 13, eject: 'L'},
        {t: 'wall', w: 3, pts: ['@promenade.rb', '@promenade.rt']},
        // the Crepe Stand: a closed stall with a peaked roof, so nothing rests on it; the counter is its underside
        {
          t: 'block',
          name: 'crepe',
          pts: [
            [248, 396],
            [300, 372],
            [340, 372],
            [392, 396],
            [372, 344],
            [320, 326],
            [268, 344]
          ]
        },
        {t: 'bank', id: 'crepe', name: 'Crepe Stand', kind: 'target', from: [248, 396], to: [300, 372], n: 1, pad: 0.06},
        {t: 'bank', id: 'crepe', kind: 'target', from: [300, 372], to: [340, 372], n: 1, pad: 0.04},
        {t: 'bank', id: 'crepe', kind: 'target', from: [340, 372], to: [392, 396], n: 1, pad: 0.06},
        // the Ferris Wheel: a spinner lane right of centre, straight up into the stand's east face
        {
          t: 'wall',
          w: 3,
          pts: [
            [344, 548],
            [344, 468]
          ]
        },
        {
          t: 'wall',
          w: 3,
          pts: [
            [388, 548],
            [388, 468]
          ]
        },
        {t: 'spinner', id: 'ferris', x: 366, y: 508, r: 20},
        {t: 'wall', w: 3, pts: ['@coaster.lb', '@coaster.lt']},
        {t: 'scoopBlock', mouth: 'coaster', side: 1, xg: 574, topY: 380, name: 'fountain'},
        {t: 'hole', id: 'fountain', name: 'Wishing Fountain', x: 528, y: 488, r: 13, eject: 'R'},
        {t: 'floorSet', id: 'strings', name: 'String Lights', col: '#fff0c0'},
        // the Fountain's own lamp: lit when a wish is waiting
        {t: 'lamp', x: 490, y: 600, show: 'wish', label: 'wish', col: GOLD}
      ],
      torches: lights(GOLD, '#fff6d8')
    },

    /* ---------- MAPLE STREET (the point of the heart: the plunger, the real drain, the state lamps) ---------- */
    {
      id: 'home',
      name: 'Maple Street',
      short: 'Maple Street',
      at: [0, 1],
      shooter: true,
      boss: {x: 303, y: 650},
      spawn: [
        [160, 585],
        [215, 640],
        [303, 600],
        [392, 640],
        [445, 600],
        [255, 560],
        [350, 560],
        [303, 690]
      ],
      pieces: [
        {
          t: 'lanes',
          id: 'porch',
          name: 'Porch Lights',
          y: 118,
          r: 13,
          xs: [284, 320, 356],
          posts: {xs: [266, 302, 338, 374], y0: 92, y1: 142, w: 4},
          skill: true,
          ballReset: true
        },
        {t: 'bumper', x: 258, y: 234, r: 24, group: 'hearts', opensGrave: true},
        {t: 'bumper', x: 382, y: 234, r: 24, group: 'hearts', opensGrave: true},
        {t: 'bumper', x: 320, y: 304, r: 24, group: 'hearts', opensGrave: true},
        {t: 'mouth', id: 'schoolRun', x: 172, y: 480, side: -1},
        {t: 'mouth', id: 'plazaLine', x: 434, y: 480, side: 1},
        // high banks: the Garden Gate (drops) above the School Run; the Sweet Shop (standups) up the right
        {t: 'bank', id: 'gate', name: 'Garden Gate', kind: 'drop', from: [192, 336], to: [254, 310], n: 3},
        {
          t: 'block',
          name: 'gate',
          pts: [
            [190, 330],
            [252, 304],
            [236, 270],
            [190, 282]
          ]
        },
        {t: 'bank', id: 'sweets', name: 'Sweet Shop', kind: 'target', from: [412, 298], to: [482, 323], n: 3, pad: 0.05},
        {
          t: 'block',
          name: 'sweets',
          pts: [
            [412, 298],
            [482, 323],
            [540, 300],
            [540, 250],
            [446, 262]
          ]
        },
        // the left wedge between the orbit guide and the School Run
        {t: 'block', name: 'wedge', pts: [[66, 390], '@schoolRun.lt', '@schoolRun.lb', [72, 520], [66, 500]]},
        {t: 'wall', w: 3, pts: ['@schoolRun.rb', '@schoolRun.rt']},
        // the Bike Rack: two standups low on the left, with the kickback below it
        {t: 'bank', id: 'bikes', name: 'Bike Rack', kind: 'target', from: [70, 640], to: [112, 604], n: 2, pad: 0.1},
        {
          t: 'block',
          name: 'bikes',
          pts: [
            [70, 640],
            [112, 604],
            [96, 584],
            [66, 576],
            [66, 636]
          ]
        },
        // the Boba Cafe: the sure scoop, dead centre, with a wide mouth
        {t: 'centerScoop', x: 303, w: 28},
        {t: 'hole', id: 'cafe', name: 'Boba Cafe', x: 303, y: 444, r: 14, eject: 'L'},
        // the Plaza Line and, hanging below the right orbit guide, the shelter with the Bus Stop in its base
        {t: 'wall', w: 3, pts: ['@plazaLine.lb', '@plazaLine.lt']},
        {
          t: 'block',
          name: 'shelter',
          pts: ['@plazaLine.rt', [540, 390], [540, 640], ['notch', 505, 602], [470, 640], [470, 540], '@plazaLine.rb']
        },
        {t: 'hole', id: 'busStop', name: 'Bus Stop', x: 505, y: 622, r: 13, eject: 'R'},
        {t: 'spinner', id: 'pinwheel', x: 195, y: 540, r: 20, rot: Math.atan2(0.925, 0.38) - Math.PI / 2},
        // state lamps. The multiplier up the middle and the ball save above the flippers; they keep clear of the rune
        // ring (twelve dots on a circle of radius 96 round (303, 650)) and of the guard post between the flippers
        {t: 'lamp', x: 303, y: 784, show: 'mult2', label: '2x'},
        {t: 'lamp', x: 303, y: 708, show: 'mult3', label: '3x'},
        {t: 'lamp', x: 303, y: 680, show: 'mult4', label: '4x'},
        {t: 'lamp', x: 303, y: 652, show: 'mult5', label: '5x'},
        {t: 'lamp', x: 303, y: 624, show: 'mult6', label: '6x'},
        {t: 'lamp', x: 303, y: 818, r: 10, show: 'save', label: 'ball save', col: SKY},
        {t: 'lamp', x: 41, y: 850, show: 'kickback', label: 'kick', col: SKY},
        {t: 'lamp', x: 255, y: 640, show: 'rally', label: 'squad', col: GOLD},
        {t: 'lamp', x: 351, y: 640, show: 'grave', label: 'zone', col: '#9db8e8'},
        // the Perfect Day: one lamp for each of its three stops, one on each playfield
        {t: 'lamp', x: 263, y: 596, show: 'dayCafe', label: 'boba', col: PINK},
        {t: 'lamp', x: 303, y: 590, show: 'dayRoof', label: 'rooftop', col: PINK},
        {t: 'lamp', x: 343, y: 596, show: 'dayPhoto', label: 'photo', col: PINK},
        {t: 'shooter'},
        {t: 'kickback', x: 41, y: 935, r: 17}
      ],
      torches: lights(PINK, '#ffe4f0', 586)
    }
  ],

  /* ---------- THE FRIEND ZONE: this table's Grave. The room itself is a standard part; a table only names it. ---------- */
  grave: {
    name: 'The Friend Zone',
    short: 'the Friend Zone',
    light: 'One More Chance',
    nails: 'Mixed Signals',
    torches: ['#8fb0d8', '#8fb0d8', '#ffe4f0']
  },

  /* ---------- RAMPS. A ramp starts at the mouth of the same id. `drain` ramps have no mouth: they take every ball
     that leaves the foot of the named field. k is how hard gravity pulls along a ramp (0.2 unless given). ---------- */
  ramps: [
    // the two ways up from Maple Street. They come in over the apron and up the outside edge, so they hide no flipper
    {
      id: 'schoolRun',
      name: 'School Run',
      from: 'home',
      to: 'school',
      up: true,
      k: 0.06,
      path: [
        ['#home', 90, 280],
        ['#home', 10, 160],
        ['#home', -100, 60],
        ['#school', 150, 1010],
        ['#school', 95, 920],
        ['#school', 48, 830],
        ['#school', 36, 740],
        ['#school', 46, 676],
        ['#school', 66, 656],
        ['#school', 80, 670],
        ['#school', 81, 712]
      ]
    },
    {
      id: 'plazaLine',
      name: 'Plaza Line',
      from: 'home',
      to: 'plaza',
      up: true,
      k: 0.06,
      path: [
        ['#home', 516, 280],
        ['#home', 600, 160],
        ['#home', 760, 60],
        ['#plaza', 490, 1010],
        ['#plaza', 545, 920],
        ['#plaza', 592, 830],
        ['#plaza', 604, 740],
        ['#plaza', 594, 676],
        ['#plaza', 574, 656],
        ['#plaza', 560, 670],
        ['#plaza', 559, 716]
      ]
    },
    // a lap of each lobe. `calls: 2`: two rivals follow the ball round
    {
      id: 'track',
      name: 'The Track',
      from: 'school',
      to: 'school',
      calls: 2,
      path: [
        ['#school', 118, 310],
        ['#school', 92, 220],
        ['#school', 118, 142],
        ['#school', 200, 86],
        ['#school', 320, 66],
        ['#school', 440, 86],
        ['#school', 522, 142],
        ['#school', 550, 220],
        ['#school', 560, 420],
        ['#school', 559, 680],
        ['#school', 559, 716]
      ]
    },
    {
      id: 'coaster',
      name: 'The Coaster',
      from: 'plaza',
      to: 'plaza',
      calls: 2,
      path: [
        ['#plaza', 522, 310],
        ['#plaza', 548, 220],
        ['#plaza', 522, 142],
        ['#plaza', 440, 86],
        ['#plaza', 320, 66],
        ['#plaza', 200, 86],
        ['#plaza', 118, 142],
        ['#plaza', 90, 220],
        ['#plaza', 80, 420],
        ['#plaza', 81, 680],
        ['#plaza', 81, 716]
      ]
    },
    // the two bridges over the cleft of the heart. The Promenade is lifted so the two can cross
    {id: 'skywalk', name: 'Sky Bridge', from: 'school', to: 'plaza', path: bridge},
    {id: 'promenade', name: 'The Promenade', from: 'plaza', to: 'school', lift: 30, path: mirror(bridge)},
    // the two drains that are ramps: a ball lost on a lobe slides down to Maple Street
    {
      id: 'slideS',
      name: 'Walk Home',
      drain: 'school',
      to: 'home',
      path: [
        ['#school', 320, 1180],
        ['#home', -30, 440],
        ['#home', 20, 620],
        ['#home', 81, 640],
        ['#home', 81, 712]
      ]
    },
    {
      id: 'slideP',
      name: 'Last Bus',
      drain: 'plaza',
      to: 'home',
      path: [
        ['#plaza', 320, 1180],
        ['#home', 680, 440],
        ['#home', 600, 620],
        ['#home', 525, 640],
        ['#home', 525, 716]
      ]
    }
  ],

  /* ---------- TUNNELS: scoop to scoop, under the table ---------- */
  tunnels: [
    {
      from: 'busStop',
      to: 'lockers',
      via: [
        ['#home', 560, 380],
        ['#home', 200, 100],
        ['#school', 300, 900],
        ['#school', 140, 640]
      ]
    },
    {
      from: 'rooftop',
      to: 'photo',
      via: [
        ['#school', 420, 300],
        ['#school', 640, 220],
        ['#plaza', 40, 320],
        ['#plaza', 112, 430]
      ]
    },
    {
      from: 'rise',
      to: 'busStop',
      via: [
        ['#home', 400, 1210],
        ['#home', 470, 1040],
        ['#home', 540, 780]
      ]
    }
  ],

  /* ---------- SHOT INSERTS, in field coordinates. A shot id is the id of the ramp, scoop, bank, bumper group,
     spinner, lane set, statue or orbit it stands for (orbits are orbitL<n> and orbitR<n>, n the field's place in
     the list above, counted from 0). ---------- */
  shots: [
    {id: 'orbitL0', name: 'Hallway', tier: 'school', x: 43, y: 545},
    {id: 'lockers', name: 'Lockers', tier: 'school', x: 112, y: 545},
    {id: 'track', name: 'The Track', tier: 'school', x: 206, y: 524, ang: aL},
    {id: 'desks', name: 'Desks', tier: 'school', x: 368, y: 436},
    {id: 'rooftop', name: 'Rooftop', tier: 'school', x: 320, y: 444},
    {alias: 'clubDoor', of: 'rooftop'},
    {id: 'bells', name: 'School Bells', tier: 'school', x: 320, y: 304, ang: 0, kind: 'dot'},
    {id: 'skywalk', name: 'Sky Bridge', tier: 'school', x: 434, y: 524, ang: aR},
    {id: 'nurse', name: 'Nurse', tier: 'school', x: 528, y: 545},
    {id: 'orbitR0', name: 'Hallway', tier: 'school', x: 597, y: 545},
    {id: 'globe', name: 'The Globe', tier: 'school', x: 274, y: 532, ang: 0, kind: 'dot'},
    {id: 'passes', name: 'Hall Passes', tier: 'school', x: 320, y: 760, ang: 0, kind: 'dot'},
    {id: 'trophy', name: 'Trophy Case', tier: 'school', x: 320, y: 216, ang: 0, kind: 'dot'},

    {id: 'orbitL1', name: 'Boardwalk', tier: 'plaza', x: 43, y: 545},
    {id: 'photo', name: 'Photo Booth', tier: 'plaza', x: 112, y: 545},
    {id: 'promenade', name: 'Promenade', tier: 'plaza', x: 206, y: 524, ang: aL},
    {id: 'crepe', name: 'Crepe Stand', tier: 'plaza', x: 272, y: 436},
    {id: 'claws', name: 'Claw Machines', tier: 'plaza', x: 320, y: 304, ang: 0, kind: 'dot'},
    {id: 'coaster', name: 'The Coaster', tier: 'plaza', x: 434, y: 524, ang: aR},
    {id: 'fountain', name: 'Fountain', tier: 'plaza', x: 528, y: 545},
    {id: 'orbitR1', name: 'Boardwalk', tier: 'plaza', x: 597, y: 545},
    {id: 'ferris', name: 'Ferris Wheel', tier: 'plaza', x: 366, y: 532, ang: 0, kind: 'dot'},
    {id: 'strings', name: 'String Lights', tier: 'plaza', x: 320, y: 760, ang: 0, kind: 'dot'},
    {id: 'cupid', name: 'Cupid', tier: 'plaza', x: 320, y: 216, ang: 0, kind: 'dot'},

    {id: 'orbitL2', name: 'The Block', tier: 'home', x: 43, y: 545},
    {id: 'bikes', name: 'Bike Rack', tier: 'home', x: 138, y: 648, ang: Math.atan2(-0.77, -0.64)},
    {id: 'schoolRun', name: 'School Run', tier: 'home', x: 198, y: 574, ang: aL},
    {id: 'gate', name: 'Garden Gate', tier: 'home', x: 236, y: 372, ang: Math.atan2(-0.92, -0.39)},
    {id: 'cafe', name: 'Boba Cafe', tier: 'home', x: 303, y: 505},
    {id: 'hearts', name: 'Heartbeats', tier: 'home', x: 320, y: 268, ang: 0, kind: 'dot'},
    {id: 'sweets', name: 'Sweet Shop', tier: 'home', x: 430, y: 356, ang: Math.atan2(-0.942, 0.336)},
    {id: 'plazaLine', name: 'Plaza Line', tier: 'home', x: 416, y: 524, ang: aR},
    {id: 'busStop', name: 'Bus Stop', tier: 'home', x: 505, y: 668},
    {id: 'orbitR2', name: 'The Block', tier: 'home', x: 563, y: 545},
    {id: 'pinwheel', name: 'Pinwheel', tier: 'home', x: 168, y: 566, ang: 0, kind: 'dot'},
    {id: 'porch', name: 'Porch Lights', tier: 'home', x: 320, y: 172, ang: 0, kind: 'dot'}
  ]
};
