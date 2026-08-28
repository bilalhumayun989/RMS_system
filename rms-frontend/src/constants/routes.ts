export const ROUTES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  TABLES: 'tables',
  ORDER: 'order',
  KITCHEN: 'kitchen',
  PAYMENT: 'payment',
  STAFF: 'staff',
} as const;

export type Screen = typeof ROUTES[keyof typeof ROUTES];
export default ROUTES;
