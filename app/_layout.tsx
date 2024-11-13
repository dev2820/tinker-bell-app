import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  NavigationContainer,
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/useColorScheme";
import WebviewContainer from "@/components/webview/WebviewContainer";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator<{ index: { url?: string } }>();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="index"
          screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
          }}
        >
          <Stack.Screen
            options={{
              transitionSpec: {
                open: {
                  animation: "spring",
                  config: {
                    stiffness: 2000,
                    damping: 1000,
                  },
                },
                close: {
                  animation: "spring",
                  config: {
                    stiffness: 1000,
                    damping: 500,
                  },
                },
              },
            }}
            name="index"
            component={WebviewContainer}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
