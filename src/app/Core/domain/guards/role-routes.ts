import { UserRole } from '../models/auth.models/auth.models';

export function defaultRouteForRole(role?: UserRole | null): string {
  switch (role) {
    case 'Support':
    case 'SupportTeam':
      return '/tickets';
    case 'AccountAdmin':
      return '/clients/tickets';
    case 'SuperAdmin':
      return '/dashboard';
    default:
      return '/login';
  }
}
