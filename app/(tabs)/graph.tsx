import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { mockApiService } from "@/services/mockApi";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function GraphScreen() {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  // Removed unused panOffset state
  const panValue = useRef(new Animated.ValueXY()).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { data: graphData } = useQuery({
    queryKey: ["network-graph"],
    queryFn: mockApiService.getNetworkGraph,
  });

  // Create pan responder only for native platforms to avoid web warnings
  const panResponder = Platform.OS !== 'web' ? PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      panValue.setOffset({
        x: (panValue.x as any)._value,
        y: (panValue.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: panValue.x, dy: panValue.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      panValue.flattenOffset();
    },
    onPanResponderTerminationRequest: () => true,
    onPanResponderTerminate: () => {
      panValue.flattenOffset();
    },
  }) : { panHandlers: {} };

  const NetworkVisualization = () => {
    if (!graphData) return null;

    const svgWidth = screenWidth - 40;
    const svgHeight = 400;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) * 0.3;

    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleValue }, { translateX: panValue.x }, { translateY: panValue.y }] }
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width={svgWidth} height={svgHeight}>
        {/* Render edges */}
        {graphData.edges.map((edge, index) => {
          const sourceNode = graphData.nodes.find(n => n.id === edge.source);
          const targetNode = graphData.nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;

          const sourceAngle = (sourceNode.index / graphData.nodes.length) * 2 * Math.PI;
          const targetAngle = (targetNode.index / graphData.nodes.length) * 2 * Math.PI;
          
          const sourceX = centerX + Math.cos(sourceAngle) * radius;
          const sourceY = centerY + Math.sin(sourceAngle) * radius;
          const targetX = centerX + Math.cos(targetAngle) * radius;
          const targetY = centerY + Math.sin(targetAngle) * radius;

          return (
            <Line
              key={`edge-${index}`}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth={edge.weight * 2}
            />
          );
        })}

        {/* Render nodes */}
        {graphData.nodes.map((node, index) => {
          const angle = (index / graphData.nodes.length) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          const nodeColor = node.type === "account" ? "#3b82f6" : 
                           node.type === "post" ? "#f59e0b" : "#ef4444";

          return (
            <React.Fragment key={`node-${node.id}`}>
              <Circle
                cx={x}
                cy={y}
                r={node.suspicious ? 12 : 8}
                fill={nodeColor}
                stroke={node.suspicious ? "#ef4444" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth={node.suspicious ? 2 : 1}
                onPress={() => {
                  setSelectedNode(node);
                  // Navigate to case details if node has suspicious activity
                  if (node.suspicious) {
                    router.push(`/case/${node.id}`);
                  }
                }}
              />
              <SvgText
                x={x}
                y={y + 20}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {node.label.length > 8 ? `${node.label.substring(0, 8)}...` : node.label}
              </SvgText>
            </React.Fragment>
          );
        })}
        </Svg>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.mainScrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('graph.title')}</Text>
            <Text style={styles.subtitle}>
              {t('graph.subtitle')}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                const newZoom = Math.min(zoom + 0.2, 2);
                setZoom(newZoom);
                Animated.spring(scaleValue, {
                  toValue: newZoom,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <ZoomIn size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                const newZoom = Math.max(zoom - 0.2, 0.5);
                setZoom(newZoom);
                Animated.spring(scaleValue, {
                  toValue: newZoom,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <ZoomOut size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                setZoom(1);
                Animated.spring(scaleValue, {
                  toValue: 1,
                  useNativeDriver: false,
                }).start();
                Animated.spring(panValue, {
                  toValue: { x: 0, y: 0 },
                  useNativeDriver: false,
                }).start();
              }}
            >
              <RotateCcw size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.graphContainer}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
              style={styles.graphCard}
            >
              <NetworkVisualization />
            </LinearGradient>
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>{t('graph.legend')}</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
                <Text style={styles.legendText}>{t('graph.account')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
                <Text style={styles.legendText}>{t('graph.post')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
                <Text style={styles.legendText}>{t('graph.media')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.clustersSection}>
            <Text style={styles.clustersTitle}>{t('graph.detectedClusters')}</Text>
            <View style={styles.clustersList}>
              {graphData?.clusters.map((cluster) => (
                <TouchableOpacity
                  key={cluster.id}
                  style={styles.clusterCard}
                  onPress={() => router.push(`/case/${cluster.id}`)}
                >
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
                    style={styles.clusterCardGradient}
                  >
                    <View style={styles.clusterHeader}>
                      <Text style={styles.clusterName}>{cluster.name}</Text>
                      <View style={[
                        styles.riskBadge,
                        { backgroundColor: cluster.riskLevel === "high" ? "#ef4444" :
                          cluster.riskLevel === "medium" ? "#f59e0b" : "#10b981" }
                      ]}>
                        <Text style={styles.riskText}>{cluster.riskLevel.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.clusterDescription}>{cluster.description}</Text>
                    <Text style={styles.clusterNodes}>
                      {cluster.nodeCount} {t('graph.nodes')} • {cluster.edgeCount} {t('graph.connections')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        
        {selectedNode && (
          <View style={styles.nodeDetails}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
              style={styles.nodeDetailsCard}
            >
              <View style={styles.nodeDetailsHeader}>
                <Info size={20} color="#10b981" />
                <Text style={styles.nodeDetailsTitle}>{t('graph.nodeDetails')}</Text>
                <TouchableOpacity onPress={() => setSelectedNode(null)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.nodeLabel}>{selectedNode.label}</Text>
              <Text style={styles.nodeType}>{t('graph.type')}: {selectedNode.type}</Text>
              {selectedNode.suspicious && (
                <Text style={styles.suspiciousTag}>{t('graph.suspiciousActivity')}</Text>
              )}
            </LinearGradient>
          </View>
        )}
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
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  controls: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  graphContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 420,
  },
  graphCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    height: 400,
    overflow: "hidden",
  },
  legend: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  nodeDetails: {
    position: "absolute",
    top: 120,
    right: 20,
    left: 20,
    zIndex: 10,
  },
  nodeDetailsCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  nodeDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  nodeDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: "#94a3b8",
    fontWeight: "300",
  },
  nodeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  nodeType: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  suspiciousTag: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  clustersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clustersList: {
    gap: 12,
  },
  clustersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  clusterCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  clusterCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  clusterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clusterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  clusterDescription: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
    lineHeight: 20,
  },
  clusterNodes: {
    fontSize: 12,
    color: "#64748b",
  },
});