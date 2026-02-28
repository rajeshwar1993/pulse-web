/**
 * Invite code admin utilities — CRUD on the invite_codes table.
 */
import { getAdmin } from './client';

/**
 * Create an invite code for a user. Returns the created record.
 */
export async function createInviteCode(userId: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await getAdmin()
    .from('invite_codes')
    .insert({
      creator_id: userId,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create invite code: ${error.message}`);
  return data;
}

/**
 * Get invite codes created by a user.
 */
export async function getInviteCodes(userId: string) {
  const { data, error } = await getAdmin()
    .from('invite_codes')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to get invite codes: ${error.message}`);
  return data;
}

/**
 * Delete all invite codes created by a specific user.
 */
export async function deleteUserInviteCodes(userId: string): Promise<void> {
  const { error } = await getAdmin()
    .from('invite_codes')
    .delete()
    .eq('creator_id', userId);
  if (error) throw new Error(`Failed to delete invite codes: ${error.message}`);
}

/**
 * Delete ALL invite codes.
 */
export async function deleteAllInviteCodes(): Promise<void> {
  const { error } = await getAdmin()
    .from('invite_codes')
    .delete()
    .neq('creator_id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(`Failed to delete all invite codes: ${error.message}`);
}
