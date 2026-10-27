import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="my-reports" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="report" />
      <Stack.Screen name="report-confirmation" />
      <Stack.Screen name="report-details" />
    </Stack>
  );
}