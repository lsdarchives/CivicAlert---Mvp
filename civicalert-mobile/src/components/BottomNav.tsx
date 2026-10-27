
import { usePathname, useRouter } from "expo-router";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Tab = "home" | "reports" | "report" | "profile";

const tabs: {
  id: Tab;
  label: string;
  icon: string;
  route: "/home" | "/my-reports" | "/report" | "/profile";
}[] = [
  { id: "home", label: "Home", icon: "⌂", route: "/home" },
  { id: "reports", label: "My Reports", icon: "▤", route: "/my-reports" },
  { id: "report", label: "Report", icon: "+", route: "/report" },
  { id: "profile", label: "Profile", icon: "○", route: "/profile" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab: Tab =
    pathname === "/home"
      ? "home"
      : pathname === "/report"
        ? "report"
        : pathname === "/profile"
          ? "profile"
          : "reports";

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = currentTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => router.replace(tab.route as any)}
            style={styles.tab}
          >
            <View
              style={[
                styles.iconContainer,
                active && styles.activeIconContainer,
                tab.id === "report" && styles.reportButton,
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  active && styles.activeIcon,
                  tab.id === "report" && styles.reportIcon,
                ]}
              >
                {tab.icon}
              </Text>
            </View>

            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EDF2",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 52,
  },
  iconContainer: {
    width: 34,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    backgroundColor: "#E4F4EC",
  },
  reportButton: {
    backgroundColor: "#176B56",
    borderRadius: 12,
  },
  icon: {
    fontSize: 23,
    color: "#7B8996",
    fontWeight: "600",
  },
  activeIcon: {
    color: "#176B56",
  },
  reportIcon: {
    color: "#FFFFFF",
    fontSize: 25,
  },
  label: {
    fontSize: 10,
    color: "#7B8996",
    fontWeight: "500",
  },
  activeLabel: {
    color: "#176B56",
    fontWeight: "800",
  },
});
