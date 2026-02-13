import { Tabs } from "expo-router";
import React from "react";
import { Shield, AlertTriangle, Network, Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.dashboard'),
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('navigation.alerts'),
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: t('navigation.graph'),
          tabBarIcon: ({ color, size }) => <Network color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}