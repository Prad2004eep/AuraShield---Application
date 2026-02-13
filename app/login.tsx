import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import { useAuraShield } from "@/providers/AuraShieldProvider";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuraShield();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('login.fillAllFields'));
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      login({
        id: "1",
        email,
        name: "Security Analyst",
        role: "analyst",
      });
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={48} color="#10b981" />
            </View>
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('login.email')}
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder={t('login.password')}
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748b" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? t('login.authenticating') : t('login.signIn')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.demoText}>
              {t('login.demoCredentials')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#ffffff",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  demoText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginTop: 16,
  },
});