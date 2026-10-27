
import { useEffect, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type PopupNotificationProps = {
  visible: boolean;
  title: string;
  message: string;
  onPress?: () => void;
  onDismiss: () => void;
  actionLabel?: string;
};

export default function PopupNotification({
  visible,
  title,
  message,
  onPress,
  onDismiss,
  actionLabel = "View",
}: PopupNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-140)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 150,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -140,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>CIVICALERT UPDATE</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {onPress && (
              <Pressable
                onPress={onPress}
                accessibilityRole="button"
                style={styles.viewButton}
              >
                <Text style={styles.viewButtonText}>{actionLabel}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              style={styles.dismissButton}
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close notification"
          hitSlop={10}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCEBE4",
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#172B3A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E3F3EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingRight: 4,
  },
  label: {
    color: "#176B56",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    color: "#172B3A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  message: {
    color: "#657587",
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
    gap: 16,
  },
  viewButton: {
    backgroundColor: "#176B56",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  dismissButton: {
    paddingVertical: 7,
  },
  dismissText: {
    color: "#718096",
    fontSize: 11,
    fontWeight: "700",
  },
  closeButton: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  closeText: {
    color: "#94A3B0",
    fontSize: 23,
    lineHeight: 24,
  },
});
