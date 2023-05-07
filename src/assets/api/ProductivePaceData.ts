export interface ProductivePace {
  name: string;
  productive: number;
  wasted: number;
  pace: number;
}

export const EXAMPLE_PRODUCTIVE_PACE_DATA = [
  {
    name: '09:00',
    productive: 0,
    wasted: 100,
    pace: 0,
  },
  {
    name: '10:27',
    productive: 87,
    wasted: 100,
    pace: 28,
  },
  {
    name: '12:11',
    productive: 87,
    wasted: 204,
    pace: 18,
  },
  {
    name: '13:14',
    productive: 150,
    wasted: 204,
    pace: 25,
  },
  {
    name: '13:30',
    productive: 150,
    wasted: 220,
    pace: 24,
  },
  {
    name: '15:10',
    productive: 250,
    wasted: 220,
    pace: 32,
  },
  {
    name: '15:43',
    productive: 250,
    wasted: 253,
    pace: 30, // 30, 27, 31, 30, 34, 24
  },
  {
    name: '16:40',
    productive: 250,
    wasted: 310,
    pace: 27,
  },
  {
    name: '18:11',
    productive: 341,
    wasted: 310,
    pace: 31,
  },
  {
    name: '18:38',
    productive: 341,
    wasted: 337,
    pace: 30,
  },
  {
    name: '21:10',
    productive: 435,
    wasted: 337,
    pace: 34,
  },
  {
    name: '26:06',
    productive: 435,
    wasted: 633,
    pace: 24,
  },
];
