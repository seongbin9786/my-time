export interface Log {
  name: string; // 단순 시작 시각임. 이후부터는 시작과 끝이 동시임.
  direction: string;
  productive: number;
  wasted: number;
}

export const EXAMPLE_AVAILABLE_REST_TIME = [
  {
    name: '07:20', // 단순 시작 시각임. 이후부터는 시작과 끝이 동시임.
    direction: '',
    productive: 0,
    wasted: 0,
  },
  {
    name: '09:00',
    direction: 'wasted',
    productive: 0,
    wasted: 100,
    pace: -200,
  },
  {
    name: '10:27',
    direction: 'productive',
    productive: 87,
    wasted: 100,
    pace: 0,
  },
  {
    name: '12:11',
    direction: 'wasted',
    productive: 87,
    wasted: 204,
    pace: 18,
  },
  {
    name: '13:14',
    direction: 'productive',
    productive: 150,
    wasted: 204,
    pace: 25,
  },
  {
    name: '13:30',
    direction: 'wasted',
    productive: 150,
    wasted: 220,
    pace: 24,
  },
  {
    name: '15:10',
    direction: 'productive',
    productive: 250,
    wasted: 220,
    pace: 32,
  },
  {
    name: '15:43',
    direction: 'wasted',
    productive: 250,
    wasted: 253,
    pace: 30, // 30, 27, 31, 30, 34, 24
  },
  {
    name: '16:40',
    direction: 'wasted',
    productive: 250,
    wasted: 310,
    pace: 27,
  },
  {
    name: '18:11',
    direction: 'productive',
    productive: 341,
    wasted: 310,
    pace: 31,
  },
  {
    name: '18:38',
    direction: 'wasted',
    productive: 341,
    wasted: 337,
    pace: 30,
  },
  {
    name: '21:10',
    direction: 'productive',
    productive: 435,
    wasted: 337,
    pace: 34,
  },
  {
    name: '26:06',
    direction: 'wasted',
    productive: 435,
    wasted: 633,
    pace: 24,
  },
];
