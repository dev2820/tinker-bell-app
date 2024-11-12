import * as React from "react";
import { StyleSheet, View, Text, AppState, AppStateStatus } from "react-native";

import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
const COOKIE_STORAGE_KEY = "storedCookies";

export default function HomeScreen() {
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

  // WebView에서 쿠키를 가져와 저장
  const handleMessage = (event: WebViewMessageEvent): void => {
    const { data } = event.nativeEvent;
    console.log(data);
    if (data.startsWith("cookies:")) {
      const cookies = data.replace("cookies:", "");
      saveCookies(cookies); // 쿠키 저장
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
    window.ReactNativeWebView.postMessage('cookies:' + document.cookie);
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
            uri: "https://ticketbell.store/",
          }}
          injectedJavaScript={cookiesLoaded} // 쿠키 설정 스크립트 적용
          onMessage={handleMessage} // 메시지 처리 (쿠키 저장)
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
// return (
//   <ParallaxScrollView
//     headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
//     headerImage={
//       <Image
//         source={require("@/assets/images/emoji1.png")}
//         style={styles.reactLogo}
//       />
//     }
//   >

//     <ThemedView style={styles.titleContainer}>
//       <ThemedText type="title">Welcome!</ThemedText>
//       <HelloWave />
//     </ThemedView>
//     <ThemedView style={styles.stepContainer}>
//       <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//       <ThemedText>
//         Edit{" "}
//         <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
//         to see changes. Press{" "}
//         <ThemedText type="defaultSemiBold">
//           {Platform.select({ ios: "cmd + d", android: "cmd + m" })}
//         </ThemedText>{" "}
//         to open developer tools.
//       </ThemedText>
//     </ThemedView>
//     <ThemedView style={styles.stepContainer}>
//       <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//       <ThemedText>
//         Tap the Explore tab to learn more about what's included in this
//         starter app.
//       </ThemedText>
//     </ThemedView>
//     <ThemedView style={styles.stepContainer}>
//       <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//       <ThemedText>
//         When you're ready, run{" "}
//         <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
//         to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
//         directory. This will move the current{" "}
//         <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
//         <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//       </ThemedText>
//     </ThemedView>
//   </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: "absolute",
//   },
// });
