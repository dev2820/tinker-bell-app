import * as React from "react";
import {
  StyleSheet,
  View,
  AppState,
  AppStateStatus,
  BackHandler,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WebviewLoading from "@/components/animations/WebviewLoading";
import Loading from "@/components/animations/Loading";
import { useRouter } from "expo-router";

const COOKIE_STORAGE_KEY = "storedCookies";

type Props = {
  url: string;
};
export default function WebviewContainer(props: Props) {
  const { url } = props;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const domain = "https://ticketbell.store";
  // const url = route.params?.url ?? domain;

  const [cookiesLoaded, setCookiesLoaded] = React.useState<string | null>(null);
  const [isWebviewLoading, setIsWebviewLoading] = React.useState<boolean>(true);
  const webViewRef = React.useRef<WebView>(null);
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState
  );
  const modalOpenStack = React.useRef<number>(0);

  const isLoading = React.useMemo(() => {
    return cookiesLoaded === null || isWebviewLoading;
  }, [cookiesLoaded, isWebviewLoading]);

  // 쿠키 저장 함수
  const saveCookies = async (cookieString: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(COOKIE_STORAGE_KEY, cookieString);
    } catch (error) {
      console.error("Failed to save cookies:", error);
    }
  };

  // 쿠키 불러오기 함수
  const loadCookies = async (): Promise<string> => {
    try {
      const savedCookies = await AsyncStorage.getItem(COOKIE_STORAGE_KEY);
      if (savedCookies) {
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
        router.back();
      } else if (path === "/setting") {
        router.push("/setting");
      } else if (path === "/") {
        router.replace("/tabs/daily-todo");
      } else if (path == "/experience") {
        router.push("/experience");
      }
    }

    if (data.type === "OPEN_MODAL") {
      modalOpenStack.current = modalOpenStack.current + 1;
    }
    if (data.type === "CLOSE_MODAL") {
      modalOpenStack.current = modalOpenStack.current - 1;
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

  React.useEffect(() => {
    const backAction = () => {
      if (webViewRef.current && modalOpenStack.current > 0) {
        webViewRef.current.injectJavaScript(`
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          `);
      } else {
        Alert.alert("종료하시겠어요?", "확인을 누르면 종료합니다.", [
          {
            text: "취소",
            onPress: () => {},
            style: "cancel",
          },
          { text: "확인", onPress: () => BackHandler.exitApp() },
        ]);
      }
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isLoading && url === domain && (
        <View style={styles.loadingContainer}>
          <WebviewLoading />
        </View>
      )}
      {isLoading && url !== domain && (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      )}
      {cookiesLoaded && (
        <WebView
          ref={webViewRef}
          style={[
            styles.container,
            { marginBottom: insets.bottom },
            isLoading ? { display: "none" } : {},
          ]}
          source={{
            uri: url,
          }}
          injectedJavaScript={cookiesLoaded} // 쿠키 설정 스크립트 적용
          onMessage={handleMessageFromWebview} // 메시지 처리 (쿠키 저장)
          cacheEnabled={true} // cache 활성화
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          androidLayerType="hardware"
          onLoad={() => setIsWebviewLoading(false)} // 웹뷰 로드 완료 시 로딩 상태 업데이트
          overScrollMode="never" // android에서 스크롤 끝에 도달하면 튕기는 현상 제거
          bounces={false} // ios에서 스크롤 끝에 도달하는 이펙트를 제거
          decelerationRate="fast" // 스크롤이 빠르게 중단되지 않게 함
          textZoom={100} // 텍스트 크기를 100%로 고정
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff", // 스플래시 화면 배경색 설정
    justifyContent: "center",
    alignItems: "center",
  },
});
