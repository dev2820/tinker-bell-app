import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        lazy: false,
      }}
    >
      <Tabs.Screen
        name="daily-todo"
        options={{
          title: "Daily View",
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
