import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, Filter, Download, CheckCircle } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { mockApiService } from "@/services/mockApi";
import { apiService } from "@/services/api";
import { filterOutResolved } from "@/services/resolutionStore";
import { router } from "expo-router";
import { Alert } from "@/types/alert";
import { useTranslation } from "react-i18next";

export default function AlertsScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: alertsData, refetch } = useQuery({
    queryKey: ["alerts", searchQuery, selectedSeverity],
    queryFn: async () => {
      const vip = '';
      const opts = { search: searchQuery, severity: selectedSeverity === "all" ? undefined : selectedSeverity } as const;
      try {
        if (apiService.useLive()) {
          const [live, local] = await Promise.all([
            apiService.getAlerts(vip, opts).catch(() => ({ alerts: [], total: 0 })),
            mockApiService.getAlerts(opts).catch(() => ({ alerts: [], total: 0 })),
          ]);
          // Merge: include locally imported alerts (e.g., uploads) into live list
          const map = new Map<string, Alert>();
          for (const a of [...local.alerts, ...live.alerts]) map.set(String(a.id), a as Alert);
          let alerts = Array.from(map.values());
          alerts.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
          alerts = await filterOutResolved(alerts);
          return { alerts, total: alerts.length };
        }
        // Pure mock
        const mock = await mockApiService.getAlerts(opts);
        mock.alerts = await filterOutResolved(mock.alerts || []);
        mock.total = mock.alerts.length;
        return mock;
      } catch {
        const fallback = await mockApiService.getAlerts(opts);
        fallback.alerts = await filterOutResolved(fallback.alerts || []);
        fallback.total = fallback.alerts.length;
        return fallback;
      }
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const SeverityFilter = ({ severity, label }: { severity: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedSeverity === severity && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedSeverity(severity)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedSeverity === severity && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <Pressable
      style={styles.alertCard}
      onPress={() => router.push(`/case/${alert.id}`)}
      role="button"
      accessibilityLabel={`Open case ${alert.id}`}
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
          <View style={styles.alertActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                console.log('Downloading case PDF for alert:', alert.id);
                // In a real app, this would trigger PDF download
              }}
            >
              <Download size={16} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                console.log('Marking alert as resolved:', alert.id);
                // In a real app, this would update the alert status
              }}
            >
              <CheckCircle size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.alertTitle}>{alert.title}</Text>
        <Text style={styles.alertDescription} numberOfLines={3}>
          {alert.description}
        </Text>

        <View style={styles.alertFooter}>
          <Text style={styles.alertVip}>{t('dashboard.target')}: {alert.vipName}</Text>
          <Text style={styles.alertTime}>
            {new Date(alert.timestamp).toLocaleDateString()} • {new Date(alert.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.alertMeta}>
          <Text style={styles.alertSource}>{t('alerts.source')}: {alert.source}</Text>
          <Text style={styles.alertConfidence}>{t('alerts.confidence')}: {Math.round(alert.confidence * 100)}%</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('alerts.title')}</Text>
          <Text style={styles.subtitle}>
            {alertsData?.total || 0} {t('navigation.alerts').toLowerCase()} • {alertsData?.alerts.filter(a => a.severity === "high").length || 0} {t('common.high').toLowerCase()} {t('alerts.priority')}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('alerts.searchPlaceholder')}
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <SeverityFilter severity="all" label={t('common.all')} />
            <SeverityFilter severity="high" label={t('common.high')} />
            <SeverityFilter severity="medium" label={t('common.medium')} />
            <SeverityFilter severity="low" label={t('common.low')} />
          </ScrollView>
        </View>

        <ScrollView
          style={styles.alertsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
        >
          {alertsData?.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
          
          {alertsData?.alerts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t('alerts.noAlerts')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {t('alerts.tryAdjustingFilters')}
              </Text>
            </View>
          )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterButtonActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertCard: {
    marginBottom: 16,
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
    marginBottom: 12,
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
  alertActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertVip: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  alertTime: {
    fontSize: 12,
    color: "#64748b",
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertSource: {
    fontSize: 12,
    color: "#64748b",
  },
  alertConfidence: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});