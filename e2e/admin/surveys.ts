/**
 * Missed pulse survey admin utilities.
 */
import { getAdmin } from './client';

/**
 * Delete ALL missed pulse surveys.
 */
export async function deleteAllSurveys(): Promise<void> {
  const { error } = await getAdmin()
    .from('missed_pulse_surveys')
    .delete()
    .neq('user_id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(`Failed to delete all surveys: ${error.message}`);
}
