
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ReportConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    reference?: string;
    title?: string;
    category?: string;
    address?: string;
  }>();

  const reference = params.reference || "PENDING";
  const reportTitle = params.title || "Community issue";
  const category = params.category || "General";
  const address = params.address || "Address not provided";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topLabel}>
          <Text style={styles.brandMark}>C</Text>
          <Text style={styles.brandName}>CivicAlert</Text>
        </View>

        <View style={styles.successCircle}>
          <Text style={styles.successIcon}>✓</Text>
        </View>

        <Text style={styles.eyebrow}>REPORT SUBMITTED</Text>
        <Text style={styles.heading}>Thank you for speaking up!</Text>
        <Text style={styles.subtitle}>
          Your community report has been prepared successfully. Keep your
          reference number so you can identify your report later.
        </Text>

        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>YOUR REFERENCE NUMBER</Text>
          <Text style={styles.referenceNumber}>{reference}</Text>
          <View style={styles.referenceDivider} />
          <Text style={styles.referenceHint}>
            Keep this number for your records.
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeading}>Report summary</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text>📋</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Issue</Text>
              <Text style={styles.detailValue}>{reportTitle}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text>🏷️</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{category}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text>📍</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            This is currently a confirmation preview. Your report is not yet
            stored in the database. We’ll enable real submission and tracking
            when the backend is connected.
          </Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/my-reports")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>View my reports →</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/home")}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Back to home</Text>
        </Pressable>

        <Text style={styles.footer}>
          Every report is a step towards a better community.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 30,
    alignItems: "center",
  },
  topLabel: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    marginBottom: 34,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#176B56",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 34,
  },
  brandName: {
    color: "#172B3A",
    fontSize: 17,
    fontWeight: "800",
  },
  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#DDF3E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
    borderWidth: 1,
    borderColor: "#B9E1D1",
  },
  successIcon: {
    color: "#176B56",
    fontSize: 42,
    fontWeight: "800",
  },
  eyebrow: {
    color: "#176B56",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  heading: {
    color: "#172B3A",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  referenceCard: {
    width: "100%",
    backgroundColor: "#176B56",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
  },
  referenceLabel: {
    color: "#D9F0E8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  referenceNumber: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 11,
  },
  referenceDivider: {
    height: 1,
    backgroundColor: "#FFFFFF35",
    alignSelf: "stretch",
    marginVertical: 14,
  },
  referenceHint: {
    color: "#D9F0E8",
    fontSize: 11,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    marginBottom: 14,
  },
  detailsHeading: {
    color: "#172B3A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 17,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 17,
  },
  detailIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#EFF7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    paddingTop: 2,
  },
  detailLabel: {
    color: "#8491A0",
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    color: "#172B3A",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  notice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7E6",
    borderRadius: 13,
    padding: 13,
    marginBottom: 20,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 9,
  },
  noticeText: {
    flex: 1,
    color: "#80652B",
    fontSize: 11,
    lineHeight: 17,
  },
  primaryButton: {
    width: "100%",
    minHeight: 51,
    borderRadius: 14,
    backgroundColor: "#176B56",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    width: "100%",
    minHeight: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE5EC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    color: "#8491A0",
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
  },
});

