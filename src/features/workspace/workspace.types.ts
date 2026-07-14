export type Workspace = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppSetting = {
  key: string;
  value: string;
};

export const APP_SETTING_KEYS = {
  SELECTED_WORKSPACE_ID: 'selected_workspace_id',
  THEME: 'theme',
} as const;
