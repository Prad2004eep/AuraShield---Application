import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Download, 
  Share, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Link as LinkIcon,
} from "lucide-react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApiService } from "@/services/mockApi";
import { useTranslation } from "react-i18next";

export default function CaseDetailsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: caseData } = useQuery({
    queryKey: ["case", id],
    queryFn: () => mockApiService.getCaseDetails(id!),
    enabled: !!id,
  });

  const downloadPDF = () => {
    Alert.alert(t('case.downloadPdf'), "Case evidence PDF would be downloaded");
  };

  const shareCase = () => {
    Alert.alert(t('common.share'), "Case details would be shared");
  };

  const markResolved = async () => {
    if (!id) return;
    await mockApiService.resolveAlert(String(id));
    // Also persist on-device so live API lists filter immediately too
    const { markResolved: persistResolved } = await import('@/services/resolutionStore');
    await persistResolved(String(id));
    // Invalidate cached lists so Dashboard/Alerts refresh
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    await queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
    Alert.alert(t('case.markResolved'), t('case.resolvedToast'));
    router.replace('/(tabs)/alerts');
  };

  if (!caseData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const EvidenceCard = ({ evidence }: { evidence: any }) => (
    <View style={styles.evidenceCard}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
        style={styles.evidenceCardGradient}
      >
        <View style={styles.evidenceHeader}>
          <Text style={styles.evidenceType}>{evidence.type}</Text>
          <Text style={styles.evidenceTime}>
            {new Date(evidence.timestamp).toLocaleString()}
          </Text>
        </View>
        
        {evidence.screenshot && (
          <Image source={{ uri: evidence.screenshot }} style={styles.screenshot} />
        )}
        
        <Text style={styles.evidenceDescription}>{evidence.description}</Text>
        
        {evidence.metadata && (
          <View style={styles.metadata}>
            {evidence.metadata.location && (
              <View style={styles.metadataItem}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={styles.metadataText}>{evidence.metadata.location}</Text>
              </View>
            )}
            {evidence.metadata.platform && (
              <View style={styles.metadataItem}>
                <LinkIcon size={14} color="#94a3b8" />
                <Text style={styles.metadataText}>{evidence.metadata.platform}</Text>
              </View>
            )}
            {evidence.metadata.author && (
              <View style={styles.metadataItem}>
                <User size={14} color="#94a3b8" />
                <Text style={styles.metadataText}>{evidence.metadata.author}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>{t('case.confidence')}:</Text>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: evidence.confidence > 0.8 ? "#10b981" : 
              evidence.confidence > 0.6 ? "#f59e0b" : "#ef4444" }
          ]}>
            <Text style={styles.confidenceText}>
              {Math.round(evidence.confidence * 100)}%
            </Text>
          </View>
        </View>
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{caseData.title}</Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: caseData.severity === "high" ? "#ef4444" : 
                  caseData.severity === "medium" ? "#f59e0b" : "#10b981" }
              ]}>
                <Text style={styles.severityText}>{caseData.severity.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.description}>{caseData.description}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={downloadPDF}>
              <Download size={20} color="#ffffff" />
              <Text style={styles.actionButtonText} numberOfLines={1}>
                {t('case.downloadPdf')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={shareCase}>
              <Share size={20} color="#ffffff" />
              <Text style={styles.actionButtonText} numberOfLines={1}>
                {t('common.share')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resolveButton} onPress={markResolved}>
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.actionButtonText} numberOfLines={1}>
                {t('case.markResolved')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.caseInfo}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
              style={styles.caseInfoCard}
            >
              <View style={styles.caseInfoRow}>
                <View style={styles.caseInfoItem}>
                  <Text style={styles.caseInfoLabel}>{t('dashboard.target')} VIP</Text>
                  <Text style={styles.caseInfoValue}>{caseData.vipName}</Text>
                </View>
                <View style={styles.caseInfoItem}>
                  <Text style={styles.caseInfoLabel}>{t('alerts.source')}</Text>
                  <Text style={styles.caseInfoValue}>{caseData.source}</Text>
                </View>
              </View>
              <View style={styles.caseInfoRow}>
                <View style={styles.caseInfoItem}>
                  <Text style={styles.caseInfoLabel}>{t('case.created')}</Text>
                  <Text style={styles.caseInfoValue}>
                    {new Date(caseData.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.caseInfoItem}>
                  <Text style={styles.caseInfoLabel}>{t('case.status')}</Text>
                  <View style={styles.statusContainer}>
                    <Clock size={14} color="#f59e0b" />
                    <Text style={[styles.caseInfoValue, { color: "#f59e0b" }]}>
                      {caseData.status}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.evidenceSection}>
            <Text style={styles.sectionTitle}>{t('case.evidence')}</Text>
            {caseData.evidence.map((evidence: any, index: number) => (
              <EvidenceCard key={index} evidence={evidence} />
            ))}
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>{t('case.analysis')}</Text>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
              style={styles.analysisCard}
            >
              <View style={styles.analysisHeader}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text style={styles.analysisTitle}>{t('case.riskAssessment')}</Text>
              </View>
              <Text style={styles.analysisText}>{caseData.analysis}</Text>
              <View style={styles.riskMetrics}>
                <View style={styles.riskMetric}>
                  <Text style={styles.riskLabel}>{t('case.threatLevel')}</Text>
                  <View style={[
                    styles.riskValue,
                    { backgroundColor: caseData.severity === "high" ? "#ef4444" : 
                      caseData.severity === "medium" ? "#f59e0b" : "#10b981" }
                  ]}>
                    <Text style={styles.riskValueText}>{caseData.severity}</Text>
                  </View>
                </View>
                <View style={styles.riskMetric}>
                  <Text style={styles.riskLabel}>{t('case.confidence')}</Text>
                  <View style={styles.riskValue}>
                    <Text style={styles.riskValueText}>
                      {Math.round(caseData.confidence * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#94a3b8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    marginRight: 12,
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
  description: {
    fontSize: 16,
    color: "#94a3b8",
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resolveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    flexShrink: 1,
  },
  caseInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  caseInfoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  caseInfoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  caseInfoItem: {
    flex: 1,
  },
  caseInfoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  caseInfoValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  evidenceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  evidenceCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  evidenceCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  evidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  evidenceType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    textTransform: "uppercase",
  },
  evidenceTime: {
    fontSize: 12,
    color: "#64748b",
  },
  screenshot: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#374151",
  },
  evidenceDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    gap: 8,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  analysisSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  analysisCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  analysisText: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 16,
  },
  riskMetrics: {
    flexDirection: "row",
    gap: 16,
  },
  riskMetric: {
    flex: 1,
  },
  riskLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  riskValue: {
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  riskValueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
});