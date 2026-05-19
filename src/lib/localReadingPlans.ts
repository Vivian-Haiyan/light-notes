import type { ReadingPlan } from '../data/readingPlans';

const PLANS_KEY = 'reading-notes-reading-plans';

export const localReadingPlans = {
  getReadingPlans: (userId: string): ReadingPlan[] => {
    const key = `${PLANS_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveReadingPlans: (userId: string, plans: ReadingPlan[]): void => {
    const key = `${PLANS_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(plans));
  },

  addReadingPlan: (userId: string, plan: ReadingPlan): void => {
    const plans = localReadingPlans.getReadingPlans(userId);
    plans.unshift(plan);
    localReadingPlans.saveReadingPlans(userId, plans);
  },

  updateReadingPlan: (userId: string, id: string, updates: Partial<ReadingPlan>): void => {
    const plans = localReadingPlans.getReadingPlans(userId);
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates };
      localReadingPlans.saveReadingPlans(userId, plans);
    }
  },

  deleteReadingPlan: (userId: string, id: string): void => {
    const plans = localReadingPlans.getReadingPlans(userId);
    const filtered = plans.filter(p => p.id !== id);
    localReadingPlans.saveReadingPlans(userId, filtered);
  }
};
