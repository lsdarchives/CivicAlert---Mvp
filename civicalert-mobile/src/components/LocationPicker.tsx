
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type SelectedLocation = {
  latitude: number | null;
  longitude: number | null;
  address: string;
};

type LocationPickerProps = {
  initialAddress?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationSelected: (location: SelectedLocation) => void;
};

export default function LocationPicker({
  initialAddress = "",
  initialLatitude = null,
  initialLongitude = null,
  onLocationSelected,
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState<number | null>(
    initialLatitude
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialLongitude
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onLocationSelected({
      latitude,
      longitude,
      address,
    });
  }, [latitude, longitude, address]);

  async function useCurrentLocation() {
    setLoading(true);
    setError("");

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setError(
          "Location permission was denied. Enter the address manually instead."
        );
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = result.coords.latitude;
      const lon = result.coords.longitude;

      setLatitude(lat);
      setLongitude(lon);

      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });

        if (results.length > 0) {
          const place = results[0];
          const formattedAddress = [
            place.name,
            place.street,
            place.district,
            place.city,
          ]
            .filter(
              (part, index, array) =>
                Boolean(part) && array.indexOf(part) === index
            )
            .join(", ");

          if (formattedAddress) {
            setAddress(formattedAddress);
          }
        }
      } catch {
        // Coordinates are still useful if reverse geocoding fails.
      }
    } catch {
      setError(
        "Could not get your location. Please enter the address manually."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateCoordinates(lat: number, lon: number) {
    setLatitude(lat);
    setLongitude(lon);
    setError("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LOCATION OF THE ISSUE</Text>
      <Text style={styles.helper}>
        Use your current location or enter the address yourself.
      </Text>

      <Pressable
        style={styles.gpsButton}
        onPress={useCurrentLocation}
        disabled={loading}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.gpsIcon}>⌖</Text>
        )}

        <Text style={styles.gpsButtonText}>
          {loading ? "Finding your location..." : "Use my current location"}
        </Text>
      </Pressable>

      {Platform.OS !== "web" && latitude !== null && longitude !== null ? (
        <NativeMap
          latitude={latitude}
          longitude={longitude}
          onMove={updateCoordinates}
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapTitle}>
            {latitude !== null && longitude !== null
              ? "GPS location captured"
              : "Location preview"}
          </Text>
          <Text style={styles.mapDescription}>
            {Platform.OS === "web"
              ? "Use GPS or enter the address below. Map selection is available in the native Android app."
              : "Your selected coordinates will appear here."}
          </Text>
        </View>
      )}

      {latitude !== null && longitude !== null && (
        <View style={styles.coordinatesCard}>
          <Text style={styles.coordinatesTitle}>Selected coordinates</Text>
          <Text style={styles.coordinates}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesHint}>
            Move the map pin to adjust the location.
          </Text>
        </View>
      )}

      <Text style={styles.label}>STREET ADDRESS</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Street name and number"
        placeholderTextColor="#9AA6B2"
        style={styles.input}
        accessibilityLabel="Street address"
      />

      <Text style={styles.manualHint}>
        You can edit the address if the automatically detected location is
        not accurate.
      </Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

type NativeMapProps = {
  latitude: number;
  longitude: number;
  onMove: (latitude: number, longitude: number) => void;
};

function NativeMap({
  latitude,
  longitude,
  onMove,
}: NativeMapProps) {
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let mounted = true;

    import("react-native-maps")
      .then((module) => {
        if (mounted) {
          setMapComponents({
            MapView: module.default,
            Marker: module.Marker,
          });
        }
      })
      .catch(() => {
        if (mounted) setMapError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (mapError) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>Map unavailable</Text>
        <Text style={styles.mapDescription}>
          You can still use the captured GPS coordinates and address.
        </Text>
      </View>
    );
  }

  if (!MapComponents) {
    return (
      <View style={styles.mapPlaceholder}>
        <ActivityIndicator color="#176B56" />
        <Text style={styles.mapDescription}>Loading map...</Text>
      </View>
    );
  }

  const { MapView, Marker } = MapComponents;

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        onPress={(event: any) => {
          const coordinate = event.nativeEvent.coordinate;
          onMove(coordinate.latitude, coordinate.longitude);
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          onDragEnd={(event: any) => {
            const coordinate = event.nativeEvent.coordinate;
            onMove(coordinate.latitude, coordinate.longitude);
          }}
          title="Reported issue"
          description="Drag this pin to adjust the location"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    color: "#344658",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 10,
  },
  helper: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  gpsButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#176B56",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 14,
  },
  gpsIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 26,
  },
  gpsButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  mapContainer: {
    height: 220,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE5EC",
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    minHeight: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE5EC",
    backgroundColor: "#EAF1F4",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  mapIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  mapTitle: {
    color: "#172B3A",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  mapDescription: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },
  coordinatesCard: {
    backgroundColor: "#E3F3EC",
    padding: 12,
    borderRadius: 12,
  },
  coordinatesTitle: {
    color: "#176B56",
    fontSize: 11,
    fontWeight: "800",
  },
  coordinates: {
    color: "#172B3A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  coordinatesHint: {
    color: "#657587",
    fontSize: 11,
    marginTop: 4,
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
  manualHint: {
    color: "#8491A0",
    fontSize: 11,
    lineHeight: 17,
  },
  error: {
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
  },
});
