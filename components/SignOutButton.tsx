import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { LogOut } from "lucide-react-native";
import { router } from "expo-router";
import { useAuraShield } from "@/providers/AuraShieldProvider";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SignOutButtonProps {
  style?: any;
  textStyle?: any;
  iconSize?: number;
  iconColor?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export default function SignOutButton({
  style,
  textStyle,
  iconSize = 20,
  iconColor = "#ef4444",
  showIcon = true,
  showText = true,
}: SignOutButtonProps) {
  const { logout } = useAuraShield();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('settings.signOut'),
          style: "destructive",
          onPress: async () => {
            try {
              // Clear user session from context and storage
              await logout();
              await AsyncStorage.removeItem('userToken');
              // Navigate directly to login (avoid POP_TO_TOP/dismissAll)
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              // Fallback navigation
              router.replace('/login');
            }
          }
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={handleSignOut}
      accessibilityLabel={t('settings.signOut')}
      accessibilityRole="button"
    >
      {showIcon && <LogOut size={iconSize} color={iconColor} />}
      {showText && (
        <Text style={textStyle}>
          {t('settings.signOut')}
        </Text>
      )}
    </TouchableOpacity>
  );
}
