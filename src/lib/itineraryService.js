import { supabase, isMockMode } from './supabaseClient';
import {
  mockFetchItinerary,
  mockAddItineraryItem,
  mockDeleteItineraryItem,
  mockClearItinerary,
} from './mockDatabase';

/**
 * Fetch all itinerary items for a trip, ordered chronologically.
 */
export const fetchItinerary = async (tripId) => {
  if (isMockMode) {
    return mockFetchItinerary(tripId);
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .select('id, title, location, start_time, notes, category_icon')
    .eq('trip_id', tripId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[fetchItinerary]', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

/**
 * Add a new itinerary activity for a trip.
 */
export const addItineraryItem = async (tripId, item) => {
  if (isMockMode) {
    return mockAddItineraryItem(tripId, item);
  }

  const userStr = localStorage.getItem('wandr_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert([{
      trip_id: tripId,
      title: item.title,
      location: item.location || '',
      start_time: item.start_time,
      notes: item.notes || '',
      category_icon: item.category_icon || 'activity',
      created_by: user ? user.id : null,
    }])
    .select()
    .single();

  if (error) {
    console.error('[addItineraryItem]', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

export const deleteItineraryItem = async (itemId) => {
  if (isMockMode) return mockDeleteItineraryItem(itemId);

  const { data, error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .select();

  if (error) {
    console.error('[deleteItineraryItem]', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

export const clearItinerary = async (tripId) => {
  if (isMockMode) return mockClearItinerary(tripId);

  const { data, error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('trip_id', tripId)
    .select();

  if (error) {
    console.error('[clearItinerary]', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};
