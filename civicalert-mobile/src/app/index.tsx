
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { apiRequest, saveAuthToken } from "../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
  if (!email.trim() || !password) {
    alert("Please enter your email address and password.");
    return;
  }

  try {
    const data = await apiRequest("/auth/login", "POST", {
      email: email.trim(),
      password,
    });

    await saveAuthToken(data.token);
    router.replace("/home" as any);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Unable to sign in. Please try again."
    );
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>C</Text>
            </View>
            <Text style={styles.brandName}>CivicAlert</Text>
            <Text style={styles.tagline}>
              Your community. Your voice. Our future.
            </Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to report community issues and track their progress.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9299A5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#9299A5"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Sign in</Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to CivicAlert? </Text>
              <Link href="/explore" style={styles.registerLink}>
                Create an account
              </Link>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Making our communities better, together.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 36,
  },
  container: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 26,
  },
  brand: {
    alignItems: "center",
    marginBottom: 38,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#176B56",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  brandName: {
    color: "#16352F",
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  tagline: {
    color: "#697783",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  heading: {
    marginBottom: 25,
  },
  title: {
    color: "#172B3A",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 9,
  },
  subtitle: {
    color: "#6C7886",
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  label: {
    color: "#273B4B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 5,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: "#DFE6EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#172B3A",
    marginBottom: 19,
    backgroundColor: "#FCFDFE",
  },
  passwordContainer: {
    height: 51,
    borderWidth: 1,
    borderColor: "#DFE6EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 23,
    backgroundColor: "#FCFDFE",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#172B3A",
  },
  showPassword: {
    color: "#176B56",
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 10,
  },
  loginButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#176B56",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  registerText: {
    color: "#697783",
    fontSize: 13,
  },
  registerLink: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
  footerText: {
    color: "#89939D",
    fontSize: 12,
    textAlign: "center",
  },
});
