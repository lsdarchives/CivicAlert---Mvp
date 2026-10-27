
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import BottomNav from "../components/BottomNav";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "status" | "update" | "system";
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Report received",
    message:
      "Your pothole report has been received and is awaiting review.",
    time: "Today · 09:30",
    type: "status",
    read: false,
  },
  {
    id: "2",
    title: "Report under review",
    message:
      "Your streetlight report is being reviewed by the relevant department.",
    time: "Yesterday · 14:15",
    type: "update",
    read: false,
  },
  {
    id: "3",
    title: "Welcome to CivicAlert",
    message:
      "You can use CivicAlert to report community issues and follow their progress.",
    time: "Earlier",
    type: "system",
    read: true,
  },
];

const typeDetails = {
  status: { icon: "📋", label: "Report update" },
  update: { icon: "🔔", label: "Progress update" },
  system: { icon: "ℹ️", label: "Information" },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }

  function openNotification(item: NotificationItem) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, read: true }
          : notification
      )
    );

    if (item.type === "status" || item.type === "update") {
      Alert.alert(
        item.title,
        `${item.message}\n\nYour report details will be available here once notifications are connected to the backend.`
      );
    } else {
      Alert.alert(item.title, item.message);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STAY INFORMED</Text>
            <Text style={styles.heading}>Notifications</Text>
            <Text style={styles.subtitle}>
              Updates about your community reports.
            </Text>
          </View>

          <View style={styles.bellCircle}>
            <Text style={styles.bell}>🔔</Text>
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryEmoji}>✉️</Text>
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
              You're all caught up soon!
            </Text>
            <Text style={styles.summaryDescription}>
              {unreadCount === 0
                ? "You've read all your notifications."
                : `You have ${unreadCount} unread ${
                    unreadCount === 1 ? "notification" : "notifications"
                  }.`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
            >
              <Text style={styles.markRead}>Mark all as read</Text>
            </Pressable>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              We'll show important report updates here.
            </Text>
          </View>
        ) : (
          notifications.map((item) => {
            const detail = typeDetails[item.type];

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.notificationCard,
                  !item.read && styles.unreadCard,
                ]}
                onPress={() => openNotification(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${
                  item.read ? "Read" : "Unread"
                } notification`}
              >
                <View style={styles.notificationIcon}>
                  <Text style={styles.notificationEmoji}>
                    {detail.icon}
                  </Text>
                </View>

                <View style={styles.notificationBody}>
                  <View style={styles.notificationTop}>
                    <Text style={styles.notificationType}>
                      {detail.label}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.notificationTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.notificationMessage}>
                    {item.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {item.time}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerIcon}>🛡️</Text>
          <Text style={styles.footerText}>
            CivicAlert keeps you informed about the progress of your
            community reports.
          </Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  eyebrow: {
    color: "#176B56",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  heading: {
    color: "#172B3A",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#718096",
    fontSize: 13,
    marginTop: 7,
  },
  bellCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5EBF1",
  },
  bell: {
    fontSize: 21,
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#E65B55",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  summaryCard: {
    backgroundColor: "#176B56",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF25",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  summaryEmoji: {
    fontSize: 22,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  summaryDescription: {
    color: "#D9F0E8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#172B3A",
    fontSize: 18,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#DDF3E9",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#176B56",
    fontSize: 11,
    fontWeight: "800",
  },
  markRead: {
    color: "#176B56",
    fontSize: 12,
    fontWeight: "700",
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  unreadCard: {
    borderColor: "#B9E1D1",
    backgroundColor: "#FCFFFD",
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 19,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  notificationType: {
    color: "#176B56",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#176B56",
  },
  notificationTitle: {
    color: "#172B3A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  notificationMessage: {
    color: "#657587",
    fontSize: 12,
    lineHeight: 19,
  },
  notificationTime: {
    color: "#9AA6B2",
    fontSize: 10,
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#172B3A",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    color: "#718096",
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 18,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    marginTop: 14,
    marginBottom: 10,
  },
  footerIcon: {
    fontSize: 17,
    marginRight: 9,
  },
  footerText: {
    flex: 1,
    color: "#8491A0",
    fontSize: 11,
    lineHeight: 17,
  },
});
