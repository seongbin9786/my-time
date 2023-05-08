export interface PlanBurndown {
  name: string;
  progress?: number;
  recommended: number;
}

export const PLAN_BURNDOWN_DATA = [
  {
    name: '08:00',
    progress: 80,
    recommended: 80,
  },
  {
    name: '10:00',
    progress: 75,
    recommended: 70,
  },
  {
    name: '12:00',
    progress: 65,
    recommended: 60,
  },
  {
    name: '14:00',
    progress: 50,
    recommended: 50,
  },
  {
    name: '16:00',
    recommended: 40,
  },
  {
    name: '18:00',
    recommended: 30,
  },
  {
    name: '20:00',
    recommended: 20,
  },
  {
    name: '22:00',
    recommended: 10,
  },
  {
    name: '24:00',
    recommended: 0,
  },
];
