// Permission constants - từ Android app
export const PERMISSIONS = {
  VIEW_DOCUMENTS: 'RIGHT_719',
  EDIT_DOCUMENTS: 'RIGHT_729',
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
