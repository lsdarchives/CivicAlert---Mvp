
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import { apiRequest, getAuthToken } from "../services/api";

const GREEN = "#23865B";
const DARK_GREEN = "#176642";
const BACKGROUND = "#F5F8F5";
const TEXT = "#172B22";
const MUTED = "#718078";
const BORDER = "#E4EBE5";

type Report = {
  id: number;
  referenceNumber: string;
  title: string;
  description?: string | null;
  category: string;
  streetAddress?: string | null;
  suburb?: string | null;
  nearestLandmark?: string | null;
  status: string;
  priority?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function getStatusLabel(status: string): string {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
      return "Submitted";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
    case "REJECTED":
      return "Rejected";
    default:
      return status || "Unknown";
  }
}

function getStatusStyle(status: string) {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
      return styles.submittedBadge;
    case "IN_PROGRESS":
      return styles.progressBadge;
    case "RESOLVED":
      return styles.resolvedBadge;
    case "REJECTED":
      return styles.rejectedBadge;
    default:
      return styles.defaultBadge;
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyReportsScreen() {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      const data = await apiRequest(
        "/reports/mine",
        "GET",
        undefined,
        token
      );

      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert(
        "Could not load reports",
        error instanceof Error
          ? error.message
          : "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Refresh the reports whenever the user opens this screen.
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  function openReport(report: Report) {
    router.push({
      pathname: "/report-details",
      params: {
        id: report.id.toString(),
        reference: report.referenceNumber,
        title: report.title,
        category: report.category,
        location: [
          report.streetAddress,
          report.suburb,
        ]
          .filter(Boolean)
          .join(", "),
        status: report.status,
      },
    });
  }

  const submittedCount = reports.filter(
    (report) => report.status?.toUpperCase() === "SUBMITTED"
  ).length;

  const inProgressCount = reports.filter(
    (report) => report.status?.toUpperCase() === "IN_PROGRESS"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status?.toUpperCase() === "RESOLVED"
  ).length;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CIVICALERT RESIDENT PORTAL</Text>
            <Text style={styles.heading}>My Reports</Text>
            <Text style={styles.subtitle}>
              Track the community issues you've reported.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>≡</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL REPORTS</Text>
          <Text style={styles.summaryNumber}>{reports.length}</Text>
          <Text style={styles.summaryDescription}>
            Issues submitted by you
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: "#D69B25" },
              ]}
            />
            <Text style={styles.statNumber}>{submittedCount}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: "#4386D8" },
              ]}
            />
            <Text style={styles.statNumber}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>In progress</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: GREEN },
              ]}
            />
            <Text style={styles.statNumber}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your submissions</Text>
            <Text style={styles.sectionSubtitle}>
              {reports.length} {reports.length === 1 ? "report" : "reports"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={loadReports}
            disabled={loading}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? "Loading..." : "↻ Refresh"}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.stateTitle}>Loading your reports</Text>
            <Text style={styles.stateMessage}>
              Getting the latest updates from CivicAlert.
            </Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>＋</Text>
            </View>
            <Text style={styles.stateTitle}>No reports yet</Text>
            <Text style={styles.stateMessage}>
              When you submit a community issue, it will appear here.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/report")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Submit a report
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.reportList}>
            {reports.map((report) => {
              const location = [
                report.streetAddress,
                report.suburb,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.reference}>
                      {report.referenceNumber || `Report #${report.id}`}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusStyle(report.status),
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(report.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reportTitle}>{report.title}</Text>

                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {report.category}
                    </Text>
                  </View>

                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>⌖</Text>
                    <Text style={styles.locationText}>
                      {location ||
                        report.nearestLandmark ||
                        "Location unavailable"}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.date}>
                      {formatDate(report.createdAt)}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openReport(report)}
                      style={({ pressed }) => [
                        styles.viewButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.viewButtonText}>
                        View details →
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  heading: {
    color: TEXT,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 270,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E3F1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: {
    color: DARK_GREEN,
    fontSize: 28,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: DARK_GREEN,
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#CDE7D7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 8,
  },
  summaryDescription: {
    color: "#E1F1E7",
    fontSize: 13,
    marginTop: 3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  statNumber: {
    color: TEXT,
    fontSize: 23,
    fontWeight: "800",
  },
  statLabel: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  refreshButton: {
    backgroundColor: "#E3F1E7",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  refreshButtonText: {
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  reportList: {
    gap: 14,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 13,
  },
  reference: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  submittedBadge: {
    backgroundColor: "#FFF2D5",
  },
  progressBadge: {
    backgroundColor: "#E4EEFF",
  },
  resolvedBadge: {
    backgroundColor: "#DDF4E5",
  },
  rejectedBadge: {
    backgroundColor: "#FCE6E6",
  },
  defaultBadge: {
    backgroundColor: "#EDF0ED",
  },
  statusText: {
    color: TEXT,
    fontSize: 10,
    fontWeight: "700",
  },
  reportTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F5F1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 13,
  },
  categoryText: {
    color: DARK_GREEN,
    fontSize: 11,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginBottom: 16,
  },
  locationIcon: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "700",
  },
  locationText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  date: {
    color: MUTED,
    fontSize: 11,
    flexShrink: 1,
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 3,
  },
  viewButtonText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 26,
    alignItems: "center",
    marginTop: 4,
  },
  stateTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 16,
  },
  stateMessage: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#E3F1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconText: {
    color: DARK_GREEN,
    fontSize: 32,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.75,
  },
  bottomSpace: {
    height: 24,
  },
});
