// Root Stack - single stack with all screens
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  DocList: {docType: string};
  DocDetail: {
    noLot: string;
    noOrd: string;
    noOrd712: string;
    noSty: string;
    nameDepFrom: string;
    nameDepTo: string;
    noDep: string;
    noDepTo: string;
    noPrd: string;
    namePrd: string;
    docType: string;
  };
  DocsToday: {docType: string};
};

// Keep for backwards compatibility
export type AuthStackParamList = {
  Login: undefined;
};

// Main Stack (alias for RootStackParamList)
export type MainStackParamList = RootStackParamList;

// Keep for backwards compatibility
export type HomeStackParamList = MainStackParamList;
export type DocumentsStackParamList = MainStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
