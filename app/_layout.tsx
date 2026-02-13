import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuraShieldProvider, useAuraShield } from "@/providers/AuraShieldProvider";
import "@/i18n";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuraShield();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    const root = segments[0];
    const onLogin = root === "login";

    // If not authenticated, only allow the login screen
    if (!isAuthenticated && !onLogin) {
      router.replace("/login");
      return;
    }

    // If authenticated, prevent visiting the login screen
    if (isAuthenticated && onLogin) {
      router.replace("/(tabs)");
      return;
    }

    // Otherwise, allow navigation (including case details)
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack initialRouteName="login" screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="case/[id]" options={{
        headerShown: true,
        title: "Case Details",
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#ffffff",
      }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuraShieldProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuraShieldProvider>
    </QueryClientProvider>
  );
}