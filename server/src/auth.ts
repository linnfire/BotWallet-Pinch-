import type { Request } from 'express';

/** Replace this adapter with your session/JWT provider in production. */
export function authenticatedUserId(request: Request): string {
  const userId = request.header('x-user-id');
  if (userId && /^[a-zA-Z0-9_-]{1,100}$/.test(userId)) return userId;
  return 'demo-user';
}

export function authenticatedUserProfile() {
  return { firstName: 'Agent', lastName: 'Owner', emailAddress: 'agent.owner@example.com' };
}
