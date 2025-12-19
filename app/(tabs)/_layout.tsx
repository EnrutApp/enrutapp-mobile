import { Tabs } from "@/components/bottom-tabs";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      translucent={true}
      minimizeBehavior="onScrollDown"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: () => ({ sfSymbol: "house" }),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: "Mapa",
          tabBarIcon: () => ({ sfSymbol: "map" }),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Asignaciones",
          tabBarIcon: () => ({ sfSymbol: "list.bullet" }),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: () => ({ sfSymbol: "calendar" }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: () => ({ sfSymbol: "person" }),
        }}
      />
    </Tabs>
  );
}
