
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = "http://localhost:8080/api";

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object,
  token?: string
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export async function saveAuthToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem("civicalert_token", token);
  } else {
    await SecureStore.setItemAsync("civicalert_token", token);
  }
}

export async function getAuthToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem("civicalert_token");
  }

  return SecureStore.getItemAsync("civicalert_token");
}

export async function clearAuthToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem("civicalert_token");
  } else {
    await SecureStore.deleteItemAsync("civicalert_token");
  }
}
