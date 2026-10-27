import { Link, useFocusEffect, useRouter } from "expo-router";
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

const GREEN = "#176B56";

type CommunityReport = {
  id: number;
  referenceNumber?: string;
  title: string;
  description?: string;
  category: string;
  streetAddress?: string | null;
  suburb?: string | null;
  status: string;
  createdAt?: string | null;
};

const communityTips = [
  {
    icon: "♻",
    title: "Keep shared spaces clean",
    description:
      "Dispose of rubbish responsibly and report overflowing public bins.",
    tag: "CLEANER STREETS",
    color: "#E2F2EB",
  },
  {
    icon: "💡",
    title: "Help identify unsafe areas",
    description:
      "Report broken streetlights and other hazards in public spaces.",
    tag: "SAFER STREETS",
    color: "#FFF0D9",
  },
  {
    icon: "💧",
    title: "Protect our water",
    description:
      "Report visible leaks promptly to help reduce water waste.",
    tag: "SAVE WATER",
    color: "#E6EEFC",
  },
];

const communityTopics = [
  {
    icon: "🛣",
    title: "Roads & potholes",
    description: "Help highlight road problems.",
  },
  {
    icon: "💡",
    title: "Streetlights",
    description: "Help make public spaces safer.",
  },
  {
    icon: "🗑",
    title: "Waste collection",
    description: "Keep neighbourhoods cleaner.",
  },
];

function formatDate(value?: string | null) {
  if (!value) return "Recently reported";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently reported";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

function statusLabel(status: string) {
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
      return status || "Update pending";
  }
}

export default function HomeScreen() {
  const router = useRouter();

  const [communityReports, setCommunityReports] = useState<
    CommunityReport[]
  >([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [communityUnavailable, setCommunityUnavailable] = useState(false);

  const loadCommunityReports = useCallback(async () => {
    setLoadingCommunity(true);
    setCommunityUnavailable(false);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      // This resident-accessible endpoint needs to be added to the backend.
      const data = await apiRequest(
        "/reports/community",
        "GET",
        undefined,
        token
      );

      setCommunityReports(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch {
      setCommunityUnavailable(true);
    } finally {
      setLoadingCommunity(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadCommunityReports();
    }, [loadCommunityReports])
  );

  function openCommunityReport(report: CommunityReport) {
    router.push({
      pathname: "/report-details",
      params: {
        id: String(report.id),
        reference: report.referenceNumber || String(report.id),
        title: report.title,
        category: report.category,
        location: [report.streetAddress, report.suburb]
          .filter(Boolean)
          .join(", "),
        status: report.status,
      },
    });
  }

  function chooseTopic(topic: string) {
    router.push({
      pathname: "/report",
      params: { category: topic },
    });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>RESIDENT PORTAL</Text>
            <Text style={styles.brand}>CivicAlert</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Alert.alert(
                "Sign out",
                "To sign out, use the sign-out option from your account screen."
              )
            }
            style={styles.profileButton}
          >
            <Text style={styles.profileText}>My account</Text>
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <View style={styles.welcomePill}>
            <Text style={styles.welcomePillText}>
              YOUR COMMUNITY, YOUR VOICE
            </Text>
          </View>

          <Text style={styles.welcomeTitle}>
            Let's make our neighbourhood better.
          </Text>

          <Text style={styles.welcomeDescription}>
            Discover what's happening, stay informed, and help make a
            difference where you live.
          </Text>

          <Link href="/report" style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              ＋ Report a Problem
            </Text>
          </Link>

          <View style={styles.welcomeFooter}>
            <Text style={styles.welcomeFooterText}>
              Every useful report is a step forward.
            </Text>
          </View>
        </View>

        {/* Community feed */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeadingGroup}>
            <Text style={styles.sectionTitle}>Community pulse</Text>
            <Text style={styles.sectionSubtitle}>
              See what residents are reporting.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={loadCommunityReports}
            disabled={loadingCommunity}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshText}>
              {loadingCommunity ? "Loading..." : "↻ Refresh"}
            </Text>
          </Pressable>
        </View>

        {loadingCommunity ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={GREEN} />
            <Text style={styles.loadingText}>
              Loading community updates...
            </Text>
          </View>
        ) : communityReports.length > 0 ? (
          <View style={styles.reportList}>
            {communityReports.map((report) => {
              const location = [
                report.streetAddress,
                report.suburb,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Pressable
                  key={report.id}
                  accessibilityRole="button"
                  onPress={() => openCommunityReport(report)}
                  style={({ pressed }) => [
                    styles.communityCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.communityCardTop}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>
                        {report.category}
                      </Text>
                    </View>

                    <Text style={styles.reportDate}>
                      {formatDate(report.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.communityReportTitle}>
                    {report.title}
                  </Text>

                  {report.description ? (
                    <Text
                      numberOfLines={2}
                      style={styles.communityDescription}
                    >
                      {report.description}
                    </Text>
                  ) : null}

                  <View style={styles.communityCardFooter}>
                    <Text style={styles.locationText}>
                      ⌖ {location || "Neighbourhood location"}
                    </Text>

                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {statusLabel(report.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.viewReportText}>
                    View report details →
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCommunityCard}>
            <View style={styles.emptyCommunityIcon}>
              <Text style={styles.emptyCommunityIconText}>◎</Text>
            </View>

            <Text style={styles.emptyCommunityTitle}>
              Your community feed is coming together
            </Text>

            <Text style={styles.emptyCommunityDescription}>
              {communityUnavailable
                ? "Community reports will appear here once the public community feed is connected."
                : "There are no community reports to display yet. Check back for updates."}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={loadCommunityReports}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {/* Community topics */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeadingGroup}>
            <Text style={styles.sectionTitle}>Explore community topics</Text>
            <Text style={styles.sectionSubtitle}>
              What would you like to improve?
            </Text>
          </View>
        </View>

        <View style={styles.topicList}>
          {communityTopics.map((topic) => (
            <Pressable
              key={topic.title}
              accessibilityRole="button"
              onPress={() => chooseTopic(topic.title)}
              style={({ pressed }) => [
                styles.topicCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.topicIcon}>
                <Text style={styles.topicIconText}>{topic.icon}</Text>
              </View>

              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>
                  {topic.description}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Community information */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeadingGroup}>
              <Text style={styles.sectionTitle}>
                Community know-how
              </Text>
              <Text style={styles.sectionSubtitle}>
                Helpful ideas for everyday neighbourhood issues.
              </Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIcon}>
              <Text style={styles.infoBannerIconText}>✦</Text>
            </View>

            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>
                Stay informed. Take action.
              </Text>
              <Text style={styles.infoBannerDescription}>
                Use CivicAlert to report problems clearly and follow
                updates on the issues that matter to your community.
              </Text>
            </View>
          </View>

          {communityTips.map((tip) => (
            <View key={tip.title} style={styles.tipCard}>
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: tip.color },
                ]}
              >
                <Text style={styles.tipIconText}>{tip.icon}</Text>
              </View>

              <View style={styles.tipContent}>
                <Text style={styles.tipTag}>{tip.tag}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>
                  {tip.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Keep the requested Report a Problem section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeadingGroup}>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            <Text style={styles.sectionSubtitle}>
              Take the next step for your neighbourhood.
            </Text>
          </View>
        </View>

        <Link href="/report" style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Text style={styles.iconText}>＋</Text>
          </View>

          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Report a Problem</Text>
            <Text style={styles.actionDescription}>
              Tell us about an issue in your area.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Link>

        <Link href="/my-reports" style={styles.actionCard}>
          <View style={[styles.actionIcon, styles.blueIcon]}>
            <Text style={styles.iconText}>≡</Text>
          </View>

          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>My Reports</Text>
            <Text style={styles.actionDescription}>
              Track your own submissions and their status.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Link>

        {/* Keep Small Actions, Big Impact */}
        <View style={styles.notice}>
          <View style={styles.noticeHeading}>
            <View style={styles.noticeIcon}>
              <Text style={styles.noticeIconText}>♥</Text>
            </View>

            <View style={styles.noticeHeadingText}>
              <Text style={styles.noticeTitle}>
                Small Actions, Big Impact
              </Text>
              <Text style={styles.noticeSubtitle}>
                A better community starts with all of us.
              </Text>
            </View>
          </View>

          <Text style={styles.noticeDescription}>
            Clear reports help relevant municipal teams understand
            community problems and prioritise their response. You can
            also help by keeping shared spaces clean, reporting hazards,
            and sharing reliable information.
          </Text>

          <View style={styles.challengeDivider} />

          <Text style={styles.challengeLabel}>YOUR COMMUNITY CHALLENGE</Text>
          <Text style={styles.challengeTitle}>
            Notice one thing that needs attention this week.
          </Text>
          <Text style={styles.challengeDescription}>
            If you spot a genuine local problem, report it with a clear
            description and location so it can be followed up.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/report")}
            style={({ pressed }) => [
              styles.challengeButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.challengeButtonText}>
              Take action →
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          CivicAlert · Your voice, your community
        </Text>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 22,
    paddingTop: 35,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  eyebrow: {
    color: "#718078",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  brand: {
    color: "#16352F",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 3,
  },
  profileButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8E5",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
  },
  profileText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
  },
  welcome: {
    backgroundColor: GREEN,
    borderRadius: 22,
    padding: 23,
    marginBottom: 29,
  },
  welcomePill: {
    alignSelf: "flex-start",
    backgroundColor: "#2D806C",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 15,
  },
  welcomePillText: {
    color: "#E5F5EC",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    maxWidth: 340,
  },
  welcomeDescription: {
    color: "#E0F1EA",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderRadius: 11,
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    color: GREEN,
    fontWeight: "800",
    fontSize: 13,
  },
  welcomeFooter: {
    borderTopWidth: 1,
    borderTopColor: "#4C8A78",
    marginTop: 20,
    paddingTop: 14,
  },
  welcomeFooterText: {
    color: "#D6EDE3",
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  sectionHeadingGroup: {
    flex: 1,
  },
  sectionTitle: {
    color: "#172B3A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#718078",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: "#E2F2EB",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
  },
  refreshText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    marginBottom: 28,
  },
  loadingText: {
    color: "#718078",
    fontSize: 12,
  },
  reportList: {
    gap: 12,
    marginBottom: 29,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    padding: 16,
  },
  communityCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: "#E2F2EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryPillText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
  },
  reportDate: {
    color: "#89949D",
    fontSize: 10,
  },
  communityReportTitle: {
    color: "#172B3A",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  communityDescription: {
    color: "#718078",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  communityCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 14,
  },
  locationText: {
    color: "#718078",
    fontSize: 11,
    flexShrink: 1,
  },
  statusPill: {
    backgroundColor: "#F1F4F2",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: {
    color: "#4F655A",
    fontSize: 10,
    fontWeight: "700",
  },
  viewReportText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 13,
  },
  emptyCommunityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 17,
    padding: 23,
    alignItems: "center",
    marginBottom: 29,
  },
  emptyCommunityIcon: {
    backgroundColor: "#E2F2EB",
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCommunityIconText: {
    color: GREEN,
    fontSize: 27,
    fontWeight: "700",
  },
  emptyCommunityTitle: {
    color: "#172B3A",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },
  emptyCommunityDescription: {
    color: "#718078",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#C9DDD2",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 15,
  },
  outlineButtonText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
  },
  topicList: {
    gap: 10,
    marginBottom: 29,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 15,
    padding: 14,
  },
  topicIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#E2F2EB",
    alignItems: "center",
    justifyContent: "center",
  },
  topicIconText: {
    fontSize: 21,
  },
  topicInfo: {
    flex: 1,
    marginLeft: 13,
  },
  topicTitle: {
    color: "#172B3A",
    fontSize: 13,
    fontWeight: "800",
  },
  topicDescription: {
    color: "#7A8691",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  arrow: {
    color: "#819087",
    fontSize: 25,
    marginLeft: 8,
  },
  newsSection: {
    marginBottom: 29,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#E6EEFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerIconText: {
    color: "#315DB5",
    fontSize: 22,
  },
  infoBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    color: "#244A87",
    fontSize: 13,
    fontWeight: "800",
  },
  infoBannerDescription: {
    color: "#536B91",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
  },
  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  tipIconText: {
    fontSize: 21,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTag: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  tipTitle: {
    color: "#172B3A",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  tipDescription: {
    color: "#718078",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    padding: 15,
    marginBottom: 11,
  },
  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#E2F2EB",
    alignItems: "center",
    justifyContent: "center",
  },
  blueIcon: {
    backgroundColor: "#E6EEFC",
  },
  iconText: {
    color: GREEN,
    fontSize: 25,
    fontWeight: "700",
  },
  actionInfo: {
    flex: 1,
    marginLeft: 13,
  },
  actionTitle: {
    color: "#172B3A",
    fontSize: 14,
    fontWeight: "800",
  },
  actionDescription: {
    color: "#7A8691",
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },
  notice: {
    backgroundColor: "#E8F3ED",
    borderRadius: 17,
    padding: 18,
    marginTop: 14,
  },
  noticeHeading: {
    flexDirection: "row",
    alignItems: "center",
  },
  noticeIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeIconText: {
    color: GREEN,
    fontSize: 21,
  },
  noticeHeadingText: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    color: "#205744",
    fontSize: 15,
    fontWeight: "900",
  },
  noticeSubtitle: {
    color: "#557467",
    fontSize: 11,
    marginTop: 4,
  },
  noticeDescription: {
    color: "#557467",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 15,
  },
  challengeDivider: {
    height: 1,
    backgroundColor: "#C8DFD2",
    marginVertical: 17,
  },
  challengeLabel: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  challengeTitle: {
    color: "#205744",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  challengeDescription: {
    color: "#557467",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  challengeButton: {
    alignSelf: "flex-start",
    backgroundColor: GREEN,
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 15,
  },
  challengeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    textAlign: "center",
    color: "#8A959F",
    fontSize: 10,
    marginTop: 25,
  },
});
