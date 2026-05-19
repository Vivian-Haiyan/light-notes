import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { localReadingPlans } from '../lib/localReadingPlans';
import { useLocalData } from '../lib/runtimeConfig';

export interface ReadingPlan {
  id: string;
  bookId: string;
  bookTitle: string;
  startDate: string;
  endDate: string;
  dailyGoal: number;
  goalUnit: 'pages' | 'minutes';
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

const readingPlansCache = new Map<string, ReturnType<typeof createCacheEntry<ReadingPlan[]>>>();

function clearReadingPlansCache(userId: string) {
  readingPlansCache.delete(userId);
}

function toReadingPlan(row: {
  id: string;
  book_id: string | null;
  book_title: string;
  start_date: string;
  end_date: string;
  daily_goal: number;
  goal_unit: string;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}): ReadingPlan {
  return {
    id: row.id,
    bookId: row.book_id || '',
    bookTitle: row.book_title,
    startDate: row.start_date,
    endDate: row.end_date,
    dailyGoal: row.daily_goal,
    goalUnit: row.goal_unit as ReadingPlan['goalUnit'],
    progress: row.progress,
    status: row.status as ReadingPlan['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getReadingPlans(): Promise<ReadingPlan[]> {
  const userId = await requireUserId();
  
  if (useLocalData) {
    return localReadingPlans.getReadingPlans(userId);
  }

  const cachedPlans = readCache(readingPlansCache.get(userId) ?? null);
  if (cachedPlans) {
    return cachedPlans;
  }

  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const plans = data.map(toReadingPlan);
  readingPlansCache.set(userId, createCacheEntry(plans));
  return plans;
}

export async function getReadingPlanById(id: string): Promise<ReadingPlan | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    return localReadingPlans.getReadingPlans(userId).find((plan) => plan.id === id);
  }

  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toReadingPlan(data) : undefined;
}

export async function getReadingPlansByBookId(bookId: string): Promise<ReadingPlan[]> {
  const userId = await requireUserId();
  if (useLocalData) {
    return localReadingPlans.getReadingPlans(userId).filter((plan) => plan.bookId === bookId);
  }

  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toReadingPlan);
}

export async function addReadingPlan(
  plan: Omit<ReadingPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingPlan> {
  const userId = await requireUserId();
  if (useLocalData) {
    const now = new Date().toISOString();
    const createdPlan: ReadingPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    localReadingPlans.addReadingPlan(userId, createdPlan);
    return createdPlan;
  }

  const { data, error } = await supabase
    .from('reading_plans')
    .insert({
      user_id: userId,
      book_id: plan.bookId || null,
      book_title: plan.bookTitle,
      start_date: plan.startDate,
      end_date: plan.endDate,
      daily_goal: plan.dailyGoal,
      goal_unit: plan.goalUnit,
      progress: plan.progress,
      status: plan.status
    })
    .select()
    .single();
  if (error) throw error;
  clearReadingPlansCache(userId);
  return toReadingPlan(data);
}

export async function updateReadingPlan(
  id: string,
  updates: Partial<ReadingPlan>
): Promise<ReadingPlan | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    const currentPlan = localReadingPlans.getReadingPlans(userId).find((plan) => plan.id === id);
    if (!currentPlan) return undefined;
    const updatedPlan = {
      ...currentPlan,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localReadingPlans.updateReadingPlan(userId, id, updatedPlan);
    return updatedPlan;
  }

  const { data, error } = await supabase
    .from('reading_plans')
    .update({
      book_id: updates.bookId,
      book_title: updates.bookTitle,
      start_date: updates.startDate,
      end_date: updates.endDate,
      daily_goal: updates.dailyGoal,
      goal_unit: updates.goalUnit,
      progress: updates.progress,
      status: updates.status
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  clearReadingPlansCache(userId);
  return data ? toReadingPlan(data) : undefined;
}

export async function deleteReadingPlan(id: string): Promise<boolean> {
  const userId = await requireUserId();
  if (useLocalData) {
    localReadingPlans.deleteReadingPlan(userId, id);
    return true;
  }

  const { error } = await supabase.from('reading_plans').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearReadingPlansCache(userId);
  return true;
}
