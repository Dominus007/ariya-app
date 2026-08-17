import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Downloads: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  /** mediaId is optional so Player can also just reflect the current player-store queue. */
  Player: { mediaId?: string } | undefined;
  /** Reflects the current player-store queue too, same as Player — see ShortsPlayerScreen. */
  ShortsPlayer: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
