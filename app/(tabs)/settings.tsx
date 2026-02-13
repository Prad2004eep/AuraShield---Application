import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Shield,
  Bell,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Check,
} from "lucide-react-native";
import { useAuraShield } from "@/providers/AuraShieldProvider";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignOutButton from "@/components/SignOutButton";

export default function SettingsScreen() {
  const { user } = useAuraShield();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [newVipName, setNewVipName] = useState("");
  const [newVipHandle, setNewVipHandle] = useState("");
  const [newVipPlatform, setNewVipPlatform] = useState("Twitter");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const [vips, setVips] = useState([
    { id: "1", name: "John Doe", handle: "@johndoe", platform: "Twitter", verified: true },
    { id: "2", name: "Jane Smith", handle: "@janesmith", platform: "Instagram", verified: false },
    { id: "3", name: "Tech CEO", handle: "@techceo", platform: "LinkedIn", verified: true },
  ]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('aura-shield-language', languageCode);
      setCurrentLanguage(languageCode);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Logout functionality is now handled by SignOutButton component

  const addVip = () => {
    if (!newVipName.trim() || !newVipHandle.trim()) {
      Alert.alert(t('common.error'), t('settings.enterValidHandle'));
      return;
    }
    
    const newVip = {
      id: Date.now().toString(),
      name: newVipName.trim(),
      handle: newVipHandle.trim(),
      platform: newVipPlatform,
      verified: false,
    };
    
    setVips(prevVips => [...prevVips, newVip]);
    Alert.alert(t('common.success'), t('settings.vipAddedSuccess', { handle: newVipHandle }));
    setNewVipName("");
    setNewVipHandle("");
    setNewVipPlatform("Twitter");
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    rightElement,
    onPress 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
        style={styles.settingRowGradient}
      >
        <View style={styles.settingRowLeft}>
          <View style={styles.settingIcon}>
            <Icon size={20} color="#10b981" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.title')}</Text>
            <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
          </View>

          <SettingSection title={t('settings.profile')}>
            <SettingRow
              icon={User}
              title={user?.name || "User"}
              subtitle={user?.email}
            />
          </SettingSection>

          <SettingSection title={t('settings.notifications')}>
            <SettingRow
              icon={Bell}
              title={t('settings.pushNotifications')}
              subtitle={t('settings.pushNotificationsDesc')}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: "#374151", true: "#10b981" }}
                  thumbColor="#ffffff"
                />
              }
            />
            <SettingRow
              icon={Eye}
              title={t('settings.realTimeAlerts')}
              subtitle={t('settings.realTimeAlertsDesc')}
              rightElement={
                <Switch
                  value={realTimeAlerts}
                  onValueChange={setRealTimeAlerts}
                  trackColor={{ false: "#374151", true: "#10b981" }}
                  thumbColor="#ffffff"
                />
              }
            />
          </SettingSection>

          <SettingSection title={t('settings.language')}>
            <SettingRow
              icon={Globe}
              title={t('settings.language')}
              subtitle={t('settings.languageDesc')}
              rightElement={
                <TouchableOpacity 
                  style={styles.languageButton}
                  onPress={() => setShowLanguageModal(true)}
                >
                  <Text style={styles.languageButtonText}>
                    {languages.find(lang => lang.code === currentLanguage)?.name || 'English'}
                  </Text>
                </TouchableOpacity>
              }
              onPress={() => setShowLanguageModal(true)}
            />
          </SettingSection>

          <SettingSection title={t('settings.vipManagement')}>
            <View style={styles.addVipContainer}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
                style={styles.addVipCard}
              >
                <Text style={styles.addVipTitle}>{t('settings.addVipToMonitor')}</Text>
                <View style={styles.addVipColumn}>
                  <TextInput
                    style={styles.addVipInput}
                    placeholder={t('settings.vipNamePlaceholder')}
                    placeholderTextColor="#64748b"
                    value={newVipName}
                    onChangeText={setNewVipName}
                    multiline={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.addVipInput}
                    placeholder={t('settings.usernamePlaceholder')}
                    placeholderTextColor="#64748b"
                    value={newVipHandle}
                    onChangeText={setNewVipHandle}
                    multiline={false}
                    returnKeyType="done"
                    onSubmitEditing={addVip}
                  />
                  <View style={styles.addVipRow}>
                    <View style={styles.platformSelector}>
                      <Text style={styles.platformLabel}>{t('settings.platform')}:</Text>
                      <TouchableOpacity 
                        style={styles.platformButton}
                        onPress={() => {
                          const platforms = ["Twitter", "Instagram", "LinkedIn", "Facebook"];
                          const currentIndex = platforms.indexOf(newVipPlatform);
                          const nextIndex = (currentIndex + 1) % platforms.length;
                          setNewVipPlatform(platforms[nextIndex]);
                        }}
                      >
                        <Text style={styles.platformButtonText}>{newVipPlatform}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addVipButton} onPress={addVip}>
                      <Plus size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {vips.map((vip) => (
              <View key={vip.id} style={styles.vipCard}>
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
                  style={styles.vipCardGradient}
                >
                  <View style={styles.vipInfo}>
                    <Text style={styles.vipName}>{vip.name}</Text>
                    <Text style={styles.vipHandle}>{vip.handle} • {vip.platform}</Text>
                    {vip.verified && (
                      <View style={styles.verifiedBadge}>
                        <Shield size={12} color="#10b981" />
                        <Text style={styles.verifiedText}>{t('settings.verified')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.vipActions}>
                    <TouchableOpacity style={styles.vipActionButton}>
                      <Edit3 size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.vipActionButton}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </SettingSection>

          <SettingSection title={t('settings.account')}>
            <View style={styles.settingRow}>
              <SignOutButton
                style={styles.signOutButton}
                textStyle={styles.signOutText}
                iconColor="#ef4444"
                iconSize={20}
              />
            </View>
          </SettingSection>
        </ScrollView>
        
        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
                  <TouchableOpacity 
                    onPress={() => setShowLanguageModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.languageList}>
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={styles.languageOption}
                      onPress={() => handleLanguageChange(language.code)}
                    >
                      <View style={styles.languageOptionLeft}>
                        <Text style={styles.languageFlag}>{language.flag}</Text>
                        <Text style={styles.languageName}>{language.name}</Text>
                      </View>
                      {currentLanguage === language.code && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  settingRow: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRowGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  addVipContainer: {
    marginBottom: 16,
  },
  addVipCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  addVipTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 12,
  },
  addVipColumn: {
    gap: 12,
  },
  addVipRow: {
    flexDirection: "row",
    gap: 12,
  },
  addVipInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 8,
    minHeight: 44,
  },
  platformSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  platformLabel: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  platformButton: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  platformButtonText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "500",
  },
  addVipButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  vipCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  vipCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  vipInfo: {
    flex: 1,
  },
  vipName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 4,
  },
  vipHandle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  vipActions: {
    flexDirection: "row",
    gap: 8,
  },
  vipActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  languageButtonText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: "#94a3b8",
    fontWeight: "300",
  },
  languageList: {
    maxHeight: 300,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  languageOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  signOutText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 8,
  },
});