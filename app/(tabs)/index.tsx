import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, AlertTriangle, Eye, TrendingUp, Plus } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApiService } from "@/services/mockApi";
import { apiService } from "@/services/api";
import { useAuraShield } from "@/providers/AuraShieldProvider";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import * as ImagePicker from 'expo-image-picker';
import { analyzeImageWithGemini } from '@/services/gemini';

export default function DashboardScreen() {
  const { user, isAuthenticated, isLoading } = useAuraShield();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Add Evidence modal state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const generateMockData = async () => {
    setIsGenerating(true);
    try {
      // Simulate data generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      await queryClient.invalidateQueries();
      Alert.alert(
        t('common.success'),
        "Mock threat data generated successfully! New alerts and network data are now available.",
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), "Failed to generate mock data. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const launchImageFlow = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
      if (res.canceled || !res.assets?.length) return;

      setIsAnalyzing(true);
      const uri = res.assets[0].uri;
      const { result } = await analyzeImageWithGemini(uri);
      const newAlert = await mockApiService.addAlertFromGemini({
        platform: result.platform,
        type: result.type,
        title: result.title,
        description: result.description,
        severity: result.severity,
        vipName: result.vipName,
        source: result.source,
        confidence: result.confidence,
        imageUri: uri,
      });
      setShowEvidenceModal(false);
      await queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      router.push(`/case/${newAlert.id}`);
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to analyze image. Creating a fallback alert.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitUrlAnalysis = async () => {
    try {
      if (!inputUrl.trim()) return;
      setIsAnalyzing(true);
      let createdId: string | null = null;
      if (apiService.useLive()) {
        const alert = await apiService.analyzeUrl(inputUrl.trim());
        createdId = alert.id;
      } else {
        // Fallback: create a simple mock alert
        const fallback = await mockApiService.addAlertFromGemini({
          platform: 'Web',
          type: 'threat',
          title: 'Analyzed URL',
          description: inputUrl.trim(),
          severity: 'medium',
          vipName: 'Unknown',
          source: 'Web',
          confidence: 0.6,
        });
        createdId = fallback.id;
      }
      setShowEvidenceModal(false);
      setShowUrlInput(false);
      setInputUrl('');
      await queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      if (createdId) router.push(`/case/${createdId}`);
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to analyze URL. Creating a fallback alert.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: mockApiService.getDashboardStats,
  });

  const { data: recentAlerts } = useQuery({
    queryKey: ["recent-alerts"],
    queryFn: async () => {
      try {
        const { filterOutResolved } = await import('@/services/resolutionStore');
        if (apiService.useLive()) {
          const vip = '';
          // Merge local mock alerts (e.g., newly uploaded images) into live list
          const [live, local] = await Promise.all([
            apiService.getAlerts(vip, { limit: 10 }).catch(() => ({ alerts: [], total: 0 })),
            mockApiService.getAlerts({ limit: 10 }).catch(() => ({ alerts: [], total: 0 })),
          ]);
          const map = new Map<string, any>();
          for (const a of [...local.alerts, ...live.alerts]) map.set(String(a.id), a);
          let merged = Array.from(map.values());
          merged.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
          merged = merged.slice(0, 3);
          merged = await filterOutResolved(merged);
          return { alerts: merged, total: merged.length };
        }
        const res = await mockApiService.getAlerts({ limit: 3 });
        res.alerts = await filterOutResolved(res.alerts);
        res.total = res.alerts.length;
        return res;
      } catch {
        const res = await mockApiService.getAlerts({ limit: 3 });
        const { filterOutResolved } = await import('@/services/resolutionStore');
        res.alerts = await filterOutResolved(res.alerts);
        res.total = res.alerts.length;
        return res;
      }
    },
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <Icon size={24} color={color} />
          {trend && (
            <View style={styles.trendContainer}>
              <TrendingUp size={16} color="#10b981" />
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{t('dashboard.welcomeBack')}</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <View style={styles.shieldContainer}>
              <Shield size={32} color="#10b981" />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              title={t('dashboard.activeThreats')}
              value={stats?.activeThreats.toString() || "0"}
              icon={AlertTriangle}
              color="#ef4444"
              trend="+12%"
            />
            <StatCard
              title={t('dashboard.monitoredVips')}
              value={stats?.monitoredVips.toString() || "0"}
              icon={Eye}
              color="#3b82f6"
            />
            <StatCard
              title={t('dashboard.casesResolved')}
              value={stats?.resolvedCases.toString() || "0"}
              icon={Shield}
              color="#10b981"
              trend="+8%"
            />
            <StatCard
              title={t('dashboard.detectionRate')}
              value={`${stats?.detectionRate || 0}%`}
              icon={TrendingUp}
              color="#f59e0b"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('dashboard.recentAlerts')}</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/alerts")}>
                <Text style={styles.viewAllText}>{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsList}>
              {recentAlerts?.alerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertCard}
                  onPress={() => router.push(`/case/${alert.id}`)}
                >
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
                    style={styles.alertCardGradient}
                  >
                    <View style={styles.alertHeader}>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: alert.severity === "high" ? "#ef4444" : 
                          alert.severity === "medium" ? "#f59e0b" : "#10b981" }
                      ]}>
                        <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.alertTime}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertDescription} numberOfLines={2}>
                      {alert.description}
                    </Text>
                    <Text style={styles.alertVip}>{t('dashboard.target')}: {alert.vipName}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowEvidenceModal(true)}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.fabGradient}
          >
            <Plus size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Evidence Modal */}
        <Modal
          visible={showEvidenceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEvidenceModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: '85%', borderRadius: 16, overflow: 'hidden' }}>
              <LinearGradient colors={["#1e293b", "#0f172a"]} style={{ padding: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                  {t('evidence.newEvidence')}
                </Text>
                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    onPress={launchImageFlow}
                    style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1, padding: 14, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#10b981', fontWeight: '600' }}>{t('evidence.uploadImage')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowUrlInput(v => !v)}
                    style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', borderWidth: 1, padding: 14, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#60a5fa', fontWeight: '600' }}>{t('evidence.pasteUrl')}</Text>
                  </TouchableOpacity>

                  {showUrlInput && (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        placeholder={t('evidence.enterUrl')}
                        placeholderTextColor="#94a3b8"
                        value={inputUrl}
                        onChangeText={setInputUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 }}
                      />
                      <TouchableOpacity onPress={submitUrlAnalysis} style={{ backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.4)', borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: '#93c5fd', fontWeight: '600' }}>{t('evidence.analyzeUrl')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {isAnalyzing && (
                  <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="#10b981" />
                    <Text style={{ color: '#94a3b8' }}>{t('evidence.analyzing')}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setShowEvidenceModal(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#94a3b8' }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#94a3b8",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  shieldContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
  },
  statCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  viewAllText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  alertCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  alertTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 8,
  },
  alertVip: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});