import type {NavigatorScreenParams} from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

// Main Stack (all screens in one stack)
export type MainStackParamList = {
  Home: undefined;
  DocList: {docType: string};
  DocDetail: {noLot: string; noOrd: string; docType: string};
  DocsToday: {docType: string};
};

// Keep for backwards compatibility
export type HomeStackParamList = MainStackParamList;
export type DocumentsStackParamList = MainStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
