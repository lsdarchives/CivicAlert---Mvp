import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ReportDiscussion from "../components/ReportDiscussion";
import { getAuthToken } from "../services/api";

export default function ReportDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    reportId?: string | string[];
    reference?: string | string[];
    title?: string | string[];
    category?: string | string[];
    location?: string | string[];
    status?: string | string[];
  }>();

  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const idParam = getParam(params.reportId) ?? getParam(params.id);
  const parsedId = Number(idParam);
  const reportId =
    idParam && Number.isSafeInteger(parsedId) && parsedId > 0
      ? parsedId
      : null;

  const reference = getParam(params.reference) ?? "Not available";
  const title = getParam(params.title) ?? "Untitled report";
  const category = getParam(params.category) ?? "Not specified";
  const location = getParam(params.location) ?? "Not specified";
  const status = getParam(params.status) ?? "SUBMITTED";
  const statusLabel = status.replace(/_/g, " ");

  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    let active = true;

    getAuthToken()
      .then((savedToken) => {
        if (active) {
          setToken(savedToken);
          if (!savedToken) {
            setTokenError("Please sign in again to join the discussion.");
          }
        }
      })
      .catch(() => {
        if (active) {
          setTokenError("Could not load your login session.");
        }
      })
      .finally(() => {
        if (active) setTokenLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>CIVICALERT</Text>
        <Text style={styles.heading}>Report details</Text>
        <Text style={styles.subtitle}>
          Review this community report and join the discussion.
        </Text>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.reference}>{reference}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.reportTitle}>{title}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>CATEGORY</Text>
          <Text style={styles.value}>{category}</Text>

          <Text style={styles.label}>LOCATION</Text>
          <Text style={styles.value}>{location}</Text>

          <Text style={styles.label}>CURRENT STATUS</Text>
          <Text style={styles.value}>{statusLabel}</Text>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Status updates</Text>
            <Text style={styles.noticeText}>
              This page currently displays the report details passed from the
              previous screen. Live status details can be connected separately.
            </Text>
          </View>
        </View>

        <View style={styles.discussionContainer}>
          {!reportId ? (
            <Text style={styles.info}>
              Discussion is unavailable because this screen was not given the
              report's database ID. Open a report from the community feed after
              the navigation link has been updated.
            </Text>
          ) : tokenLoading ? (
            <ActivityIndicator />
          ) : !token ? (
            <Text style={styles.info}>{tokenError}</Text>
          ) : (
            <ReportDiscussion reportId={reportId} token={token} />
          )}
        </View>

        <Link href="/my-reports" asChild>
          <Text style={styles.backLink}>← Back to my reports</Text>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eyebrow: {
    color: "#287A55",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heading: {
    color: "#173D32",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#66756E",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2EAE5",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  reference: {
    color: "#287A55",
    fontSize: 13,
    fontWeight: "800",
  },
  statusBadge: {
    backgroundColor: "#E5F3E9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: "#236442",
    fontSize: 11,
    fontWeight: "800",
  },
  reportTitle: {
    color: "#173D32",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5EAE7",
    marginVertical: 18,
  },
  label: {
    color: "#748179",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 14,
  },
  value: {
    color: "#24372E",
    fontSize: 15,
    marginTop: 5,
  },
  notice: {
    backgroundColor: "#F0F6F1",
    borderRadius: 12,
    padding: 14,
    marginTop: 22,
  },
  noticeTitle: {
    color: "#236442",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  noticeText: {
    color: "#53645A",
    fontSize: 13,
    lineHeight: 20,
  },
  discussionContainer: {
    marginTop: 8,
  },
  info: {
    color: "#8A4B12",
    backgroundColor: "#FFF4E5",
    padding: 14,
    borderRadius: 10,
    lineHeight: 21,
  },
  backLink: {
    color: "#287A55",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 24,
    paddingVertical: 12,
  },
});
