import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import LocationPicker from "../components/LocationPicker";
import { apiRequest, getAuthToken } from "../services/api";

type SelectedLocation = {
  latitude: number | null;
  longitude: number | null;
  address: string;
};

export default function ReportScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [suburb, setSuburb] = useState("");
    const [landmark, setLandmark] = useState("");
    const [description, setDescription] = useState("");
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
        latitude: null,
        longitude: null,
        address: "",
    });

  const categories = [
    "Pothole",
    "Streetlight",
    "Water",
    "Waste",
    "Road Damage",
    "Other",
  ];

  async function choosePhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to attach a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }


async function submitReport() {
  if (!title.trim()) {
    Alert.alert("Missing title", "Please enter a title for the issue.");
    return;
  }

  if (!category) {
    Alert.alert("Missing category", "Please select an issue category.");
    return;
  }

  if (!selectedLocation.address.trim()) {
    Alert.alert(
      "Missing location",
      "Please enter the street address or capture your current location."
    );
    return;
  }

  if (!description.trim()) {
    Alert.alert(
      "Missing description",
      "Please describe the community issue."
    );
    return;
  }

  setLoading(true);

  try {
    const token = await getAuthToken();

    if (!token) {
      Alert.alert("Session expired", "Please sign in again.");
      router.replace("/");
      return;
    }

    const savedReport = await apiRequest(
      "/reports",
      "POST",
      {
        title: title.trim(),
        description: description.trim(),
        category,
        streetAddress: selectedLocation.address.trim(),
        suburb: suburb.trim(),
        nearestLandmark: landmark.trim(),
      },
      token
    );

    router.replace({
      pathname: "/report-confirmation" as any,
      params: {
        reference: savedReport.referenceNumber,
        title: savedReport.title,
        category: savedReport.category,
        address: [
          savedReport.streetAddress,
          savedReport.suburb,
        ]
          .filter(Boolean)
          .join(", "),
      },
    });
  } catch (error) {
    Alert.alert(
      "Report submission failed",
      error instanceof Error
        ? error.message
        : "Please try again."
    );
  } finally {
    setLoading(false);
  }
}



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>MAKE A DIFFERENCE</Text>
        <Text style={styles.heading}>Report an issue</Text>
        <Text style={styles.subtitle}>
          Help improve your community by reporting an issue that needs
          attention.
        </Text>

        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Be specific about the location</Text>
            <Text style={styles.infoText}>
              Accurate location details help the relevant team find the issue.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issue details</Text>
          <Text style={styles.sectionDescription}>
            Tell us what needs attention.
          </Text>

          <Text style={styles.label}>REPORT TITLE *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Large pothole on main road"
            placeholderTextColor="#9AA6B2"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          <Text style={styles.label}>CATEGORY *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryOption,
                    selected && styles.categorySelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>DESCRIPTION *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue and why it needs attention..."
            placeholderTextColor="#9AA6B2"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.characterCount}>
            {description.length}/2000 characters
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Where is the issue?</Text>
          <Text style={styles.sectionDescription}>
            Capture GPS coordinates or enter the address manually.
          </Text>

          <LocationPicker
            initialAddress={selectedLocation.address}
            initialLatitude={selectedLocation.latitude}
            initialLongitude={selectedLocation.longitude}
            onLocationSelected={setSelectedLocation}
          />

          <Text style={styles.label}>SUBURB / AREA</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hatfield"
            placeholderTextColor="#9AA6B2"
            value={suburb}
            onChangeText={setSuburb}
          />

          <Text style={styles.label}>NEAREST LANDMARK (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Near the local shopping centre"
            placeholderTextColor="#9AA6B2"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add a photo</Text>
          <Text style={styles.sectionDescription}>
            A photo can help explain the issue. This is optional.
          </Text>

          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: photoUri }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <Pressable
                style={styles.removePhoto}
                onPress={() => setPhotoUri(null)}
                accessibilityRole="button"
              >
                <Text style={styles.removePhotoText}>Remove photo ×</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.photoPicker}
              onPress={choosePhoto}
              accessibilityRole="button"
            >
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoPickerTitle}>Upload a photo</Text>
              <Text style={styles.photoPickerHint}>
                Choose an image from your device
              </Text>
            </Pressable>
          )}

          {!photoUri && (
            <Pressable
              style={styles.secondaryButton}
              onPress={choosePhoto}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Choose photo</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={submitReport}
          disabled={loading}
          accessibilityRole="button"
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Submitting report..." : "Submit report →"}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Please provide accurate information. Your report will be saved when
          backend submission is implemented.
        </Text>
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
    paddingBottom: 28,
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
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  infoBanner: {
    backgroundColor: "#E3F3EC",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  infoIcon: {
    fontSize: 22,
    marginRight: 11,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "800",
  },
  infoText: {
    color: "#4C7166",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  sectionTitle: {
    color: "#172B3A",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 15,
  },
  label: {
    color: "#344658",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 17,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#172B3A",
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 13,
  },
  characterCount: {
    color: "#9AA6B2",
    fontSize: 10,
    textAlign: "right",
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: "#DCE5EC",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  categorySelected: {
    backgroundColor: "#E3F3EC",
    borderColor: "#176B56",
  },
  categoryText: {
    color: "#657587",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#176B56",
    fontWeight: "800",
  },
  photoPicker: {
    minHeight: 135,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DCE5EC",
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  photoIcon: {
    fontSize: 27,
    marginBottom: 8,
  },
  photoPickerTitle: {
    color: "#172B3A",
    fontSize: 14,
    fontWeight: "800",
  },
  photoPickerHint: {
    color: "#8491A0",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },
  photoPreviewContainer: {
    borderRadius: 14,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 190,
    backgroundColor: "#EAF1F4",
  },
  removePhoto: {
    backgroundColor: "#FCE9E8",
    padding: 11,
    alignItems: "center",
  },
  removePhotoText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#176B56",
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#176B56",
    fontSize: 13,
    fontWeight: "800",
  },
  submitButton: {
    minHeight: 52,
    backgroundColor: "#176B56",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  disclaimer: {
    color: "#8491A0",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 13,
    paddingHorizontal: 8,
  },
});
