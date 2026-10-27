
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { apiRequest, clearAuthToken, getAuthToken } from "../services/api";

const GREEN = "#176B56";
const BACKGROUND = "#F4F7FB";
const DARK = "#172B3A";
const MUTED = "#7B8996";
const NOTIFICATION_KEY = "civicalert_notification_preferences";

type Profile = {
  id?: number;
  fullName: string;
  email: string;
  role?: string;
  createdAt?: string;
};

type Preferences = {
  reportUpdates: boolean;
  communityUpdates: boolean;
};

type ModalType =
  | "personal"
  | "notifications"
  | "password"
  | "deactivate"
  | "about"
  | null;

const DEFAULT_PREFERENCES: Preferences = {
  reportUpdates: true,
  communityUpdates: true,
};

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      const result = (await apiRequest(
        "/account/me",
        "GET",
        undefined,
        token,
      )) as Profile;

      setProfile(result);
      setFullName(result.fullName ?? "");
    } catch (error) {
      Alert.alert(
        "Unable to load profile",
        error instanceof Error
          ? error.message
          : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();

    AsyncStorage.getItem(NOTIFICATION_KEY)
      .then((saved) => {
        if (saved) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...JSON.parse(saved),
          });
        }
      })
      .catch(() => {
        // Keep the default preferences if storage is unavailable.
      });
  }, [loadProfile]);

  // Refresh the profile when the user returns to this screen.
  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await clearAuthToken();
          router.replace("/");
        },
      },
    ]);
  }

  async function savePersonalInformation() {
    const cleanedName = fullName.trim();

    if (!cleanedName) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      const updated = (await apiRequest(
        "/account/me",
        "PUT",
        { fullName: cleanedName },
        token,
      )) as Profile;

      setProfile((previous) => ({
        ...previous,
        ...updated,
        fullName: updated.fullName ?? cleanedName,
      }));

      setFullName(updated.fullName ?? cleanedName);
      setActiveModal(null);
      Alert.alert("Success", "Your personal information was updated.");
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing information", "Complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Password too short",
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Check your new password.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      await apiRequest(
        "/account/change-password",
        "PUT",
        { currentPassword, newPassword },
        token,
      );

      setActiveModal(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("Success", "Your password has been changed.");
    } catch (error) {
      Alert.alert(
        "Password change failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateAccount() {
    if (!currentPassword.trim()) {
      Alert.alert(
        "Password required",
        "Enter your current password to deactivate your account.",
      );
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/");
        return;
      }

      await apiRequest(
        "/account/me",
        "DELETE",
        { currentPassword },
        token,
      );

      await clearAuthToken();
      setActiveModal(null);

      Alert.alert(
        "Account deactivated",
        "Your account has been disabled. Your reports and history are preserved.",
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (error) {
      Alert.alert(
        "Deactivation failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updatePreference(
    key: keyof Preferences,
    value: boolean,
  ) {
    const updated = { ...preferences, [key]: value };

    setPreferences(updated);

    try {
      await AsyncStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(updated),
      );
    } catch {
      Alert.alert(
        "Couldn't save preferences",
        "Your notification preferences could not be saved on this device.",
      );
    }
  }

  function openModal(modal: ModalType) {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveModal(modal);
  }

  function renderMenuRow(
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
  ) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.menuRow,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.menuIcon}>
          <Text style={styles.menuIconText}>{icon}</Text>
        </View>

        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  function renderModalContent() {
    switch (activeModal) {
      case "personal":
        return (
          <>
            <Text style={styles.modalTitle}>Personal information</Text>
            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#98A4AF"
              autoCapitalize="words"
              editable={!saving}
            />

            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={profile?.email ?? ""}
              editable={false}
            />
            <Text style={styles.helperText}>
              Your email address cannot be changed here.
            </Text>

            <ActionButton
              title="Save changes"
              loading={saving}
              onPress={savePersonalInformation}
            />
          </>
        );

      case "notifications":
        return (
          <>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.modalDescription}>
              Choose which updates you want to keep enabled on this device.
              These preferences do not yet enable server push notifications.
            </Text>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.menuTitle}>Report updates</Text>
                <Text style={styles.menuSubtitle}>
                  Updates about your submitted reports
                </Text>
              </View>
              <Switch
                value={preferences.reportUpdates}
                onValueChange={(value) =>
                  void updatePreference("reportUpdates", value)
                }
                trackColor={{ true: GREEN, false: "#D7DEE5" }}
              />
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.menuTitle}>Community updates</Text>
                <Text style={styles.menuSubtitle}>
                  Updates about community activity
                </Text>
              </View>
              <Switch
                value={preferences.communityUpdates}
                onValueChange={(value) =>
                  void updatePreference("communityUpdates", value)
                }
                trackColor={{ true: GREEN, false: "#D7DEE5" }}
              />
            </View>
          </>
        );

      case "password":
        return (
          <>
            <Text style={styles.modalTitle}>Change password</Text>
            <Text style={styles.modalDescription}>
              Confirm your current password before choosing a new one.
            </Text>

            <Text style={styles.fieldLabel}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={styles.fieldLabel}>New password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={styles.fieldLabel}>Confirm new password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
            />

            <ActionButton
              title="Change password"
              loading={saving}
              onPress={changePassword}
            />
          </>
        );

      case "deactivate":
        return (
          <>
            <Text style={styles.modalTitle}>Deactivate account</Text>
            <Text style={styles.warningText}>
              Your account will be disabled and you will be signed out.
              Your submitted reports and history will not be deleted.
              You may need support to reactivate your account.
            </Text>

            <Text style={styles.fieldLabel}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
            />

            <ActionButton
              title="Deactivate account"
              loading={saving}
              destructive
              onPress={deactivateAccount}
            />
          </>
        );

      case "about":
        return (
          <>
            <Text style={styles.modalTitle}>About CivicAlert</Text>
            <Text style={styles.modalDescription}>
              CivicAlert helps residents report local issues, follow the
              progress of their reports, and engage with their community.
            </Text>
            <Text style={styles.modalDescription}>
              Your reports help keep a record of issues raised by residents.
              Deactivating an account does not delete that history.
            </Text>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>
                Manage your CivicAlert account.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>●</Text>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.fullName?.trim()?.[0] ?? "R").toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.residentName}>
                {loading ? "Loading profile..." : profile?.fullName ?? "Resident"}
              </Text>
              <Text style={styles.residentEmail}>
                {profile?.email ?? "Your account email"}
              </Text>
              <View style={styles.residentBadge}>
                <Text style={styles.residentBadgeText}>
                  RESIDENT ACCOUNT
                </Text>
              </View>
            </View>
          </View>

          {loading && (
            <ActivityIndicator color={GREEN} style={styles.loader} />
          )}

          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            {renderMenuRow(
              "◎",
              "Personal information",
              "View and edit your name",
              () => openModal("personal"),
            )}
            <View style={styles.separator} />
            {renderMenuRow(
              "♧",
              "Notifications",
              "Choose your update preferences",
              () => openModal("notifications"),
            )}
            <View style={styles.separator} />
            {renderMenuRow(
              "◇",
              "Privacy and security",
              "Change your password",
              () => openModal("password"),
            )}
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            {renderMenuRow(
              "ⓘ",
              "About CivicAlert",
              "Learn about the platform",
              () => openModal("about"),
            )}
          </View>

          <Text style={styles.sectionTitle}>ACCOUNT CONTROL</Text>
          <View style={styles.menuCard}>
            {renderMenuRow(
              "!",
              "Deactivate account",
              "Disable your account while preserving reports",
              () => openModal("deactivate"),
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
            ]}
            onPress={handleLogout}
            accessibilityRole="button"
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>

          <Text style={styles.version}>CivicAlert · Resident App</Text>
        </ScrollView>

        <BottomNav />
      </View>

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => !saving && setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderModalContent()}

              <Pressable
                style={styles.cancelButton}
                disabled={saving}
                onPress={() => setActiveModal(null)}
              >
                <Text style={styles.cancelText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({
  title,
  loading,
  destructive,
  onPress,
}: {
  title: string;
  loading: boolean;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        destructive && styles.destructiveButton,
        loading && styles.disabledButton,
      ]}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.actionButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  screen: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { padding: 22, paddingBottom: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: GREEN,
    marginBottom: 6,
  },
  title: { fontSize: 30, fontWeight: "800", color: DARK },
  subtitle: { color: MUTED, fontSize: 14, marginTop: 5 },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#E4F4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: { color: GREEN, fontSize: 20 },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: "#E4F4EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 27, fontWeight: "800", color: GREEN },
  profileInfo: { flex: 1 },
  residentName: { color: DARK, fontSize: 18, fontWeight: "800" },
  residentEmail: { color: MUTED, fontSize: 12, marginTop: 4 },
  residentBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E4F4EC",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 9,
  },
  residentBadgeText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  loader: { marginBottom: 18 },
  sectionTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 3,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    paddingHorizontal: 15,
    marginBottom: 26,
  },
  menuRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0F5F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  menuIconText: { fontSize: 22, color: GREEN },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "700", color: DARK },
  menuSubtitle: { fontSize: 12, color: MUTED, marginTop: 4 },
  chevron: { color: MUTED, fontSize: 26, marginLeft: 8 },
  separator: { height: 1, backgroundColor: "#EDF1F5" },
  pressed: { opacity: 0.65 },
  logoutButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0D9D9",
    backgroundColor: "#FFF7F7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  logoutText: { color: "#B42318", fontWeight: "800", fontSize: 14 },
  version: {
    textAlign: "center",
    color: "#98A4AF",
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 34, 45, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    maxHeight: "88%",
  },
  modalTitle: {
    color: DARK,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  fieldLabel: {
    color: DARK,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DCE4EA",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: DARK,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  readOnlyInput: { backgroundColor: "#F4F7FB", color: MUTED },
  helperText: { color: MUTED, fontSize: 11, marginTop: 6 },
  actionButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 22,
  },
  destructiveButton: { backgroundColor: "#B42318" },
  disabledButton: { opacity: 0.65 },
  actionButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelText: { color: MUTED, fontSize: 14, fontWeight: "700" },
  warningText: {
    color: "#9B2C2C",
    backgroundColor: "#FFF4F4",
    padding: 12,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
    gap: 12,
  },
  preferenceText: { flex: 1 },
});
