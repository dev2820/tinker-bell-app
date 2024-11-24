import { Tabs, usePathname } from "expo-router";

export default function TabsLayout() {
  const pathname = usePathname();
  console.log("tabs layout", pathname);
  return (
    <Tabs initialRouteName="index">
      <Tabs.Screen
        name="daily-todo"
        options={{
          title: "Daily View",
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="calendar-todo"
        options={{
          title: "Calendar View",
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
