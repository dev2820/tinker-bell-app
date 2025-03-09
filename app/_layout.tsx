import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import React, { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="experience" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
