import * as React from "react";
import { StyleSheet, View, Text, AppState, AppStateStatus } from "react-native";

import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "react-native-screens/lib/typescript/native-stack/types";
const COOKIE_STORAGE_KEY = "storedCookies";

type RootStackParamList = {
  index: { url?: string };
};

export default function WebviewContainer({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "index">) {
  const domain = "https://ticketbell.store";
  const url = route.params?.url ?? domain;

  const [cookiesLoaded, setCookiesLoaded] = React.useState<string | null>(null);
  const webViewRef = React.useRef<WebView>(null);
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState
  );

  // 쿠키 저장 함수
  const saveCookies = async (cookieString: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(COOKIE_STORAGE_KEY, cookieString);
      console.log("Cookies saved:", cookieString);
    } catch (error) {
      console.error("Failed to save cookies:", error);
    }
  };

  // 쿠키 불러오기 함수
  const loadCookies = async (): Promise<string> => {
    try {
      const savedCookies = await AsyncStorage.getItem(COOKIE_STORAGE_KEY);
      if (savedCookies) {
        console.log("Cookies loaded:", savedCookies);
        return savedCookies;
      }
    } catch (error) {
      console.error("Failed to load cookies:", error);
    }
    return "";
  };

  // webview에서 온 message에 대한 핸들링
  const handleMessageFromWebview = (event: WebViewMessageEvent): void => {
    const data = JSON.parse(event.nativeEvent.data);

    // WebView에서 쿠키를 가져와 저장
    if (data.type === "COOKIE") {
      const cookies = data.cookies;
      saveCookies(cookies); // 쿠키 저장
      return;
    }

    if (data.type === "ROUTER_EVENT") {
      const path: string = data.path;
      if (path === "back") {
        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
      } else {
        const pushAction = StackActions.push("index", {
          url: `${domain}${path}`,
          isStack: true,
        });
        navigation.dispatch(pushAction);
      }
    }
  };

  // WebView에 쿠키를 설정하는 스크립트
  const setCookiesScript = async (): Promise<string> => {
    const savedCookies = await loadCookies();
    if (savedCookies) {
      const cookieArray = savedCookies
        .split("; ")
        .map((cookie) => {
          return `document.cookie="${cookie}";`;
        })
        .join(" ");
      return `${cookieArray}true;`;
    }
    return "true;";
  };

  // WebView에서 쿠키를 얻기 위한 스크립트
  const getCookiesScript = `
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'COOKIE', cookies: document.cookie }));
    true;
  `;

  React.useEffect(() => {
    const initializeCookies = async () => {
      const cookieScript = await setCookiesScript();
      setCookiesLoaded(cookieScript); // 쿠키를 설정하고 나면 WebView를 렌더링
    };

    initializeCookies();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/active/) && nextAppState === "background") {
        // 앱이 백그라운드로 전환될 때 WebView에 쿠키를 요청하는 JS 코드 주입
        webViewRef.current?.injectJavaScript(getCookiesScript);
      }
      setAppState(nextAppState);
    };

    const subscriber = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscriber.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {cookiesLoaded ? (
        <WebView
          ref={webViewRef}
          style={styles.container}
          source={{
            uri: url,
          }}
          injectedJavaScript={cookiesLoaded} // 쿠키 설정 스크립트 적용
          onMessage={handleMessageFromWebview} // 메시지 처리 (쿠키 저장)
          cacheEnabled={true} // cache 활성화
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          androidLayerType="hardware"
        />
      ) : (
        <Text>Webview Loading...</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
