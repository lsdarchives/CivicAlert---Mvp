
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      alert("Please complete all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      alert("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Your passwords do not match.");
      return;
    }

    alert("Registration API connection will be added next.");
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
          <Link href="/" style={styles.backLink}>
            ← Back to sign in
          </Link>

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>C</Text>
            </View>
            <Text style={styles.brandName}>Join CivicAlert</Text>
            <Text style={styles.tagline}>
              Make your voice heard in your community.
            </Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Register as a resident to report local issues and follow their
              progress.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9299A5"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
            />

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
                placeholder="At least 8 characters"
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

            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password again"
              placeholderTextColor="#9299A5"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Create account</Text>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already registered? </Text>
              <Link href="/" style={styles.loginLink}>
                Sign in
              </Link>
            </View>
          </View>

          <Text style={styles.footerText}>
            Together, we can build better communities.
          </Text>
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
    paddingVertical: 28,
  },
  container: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 26,
  },
  backLink: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 22,
  },
  brand: {
    alignItems: "center",
    marginBottom: 27,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#176B56",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
  },
  brandName: {
    color: "#16352F",
    fontSize: 27,
    fontWeight: "800",
  },
  tagline: {
    color: "#697783",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  heading: {
    marginBottom: 20,
  },
  title: {
    color: "#172B3A",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 8,
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
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: "#DFE6EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#172B3A",
    marginBottom: 15,
    backgroundColor: "#FCFDFE",
  },
  passwordContainer: {
    height: 49,
    borderWidth: 1,
    borderColor: "#DFE6EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  registerButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#176B56",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 20,
  },
  loginText: {
    color: "#697783",
    fontSize: 13,
  },
  loginLink: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "800",
  },
  footerText: {
    color: "#89939D",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
});
