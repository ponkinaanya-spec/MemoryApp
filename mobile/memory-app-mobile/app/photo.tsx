import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { api } from "../src/services/api";

type Photo = {
  id: number;
  fileUrl: string;
  note: string | null;
  uploadedAt: string;
  ownerName: string;
};

export default function PhotoScreen() {
  const { photoId } = useLocalSearchParams();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  const loadPhoto = async () => {
    const response = await api.get(`/Photos/${photoId}`);
    setPhoto(response.data);
  };

  useEffect(() => {
    loadPhoto();
  }, []);

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (fullScreen) {
    return (
      <TouchableOpacity
        style={styles.fullScreen}
        onPress={() => setFullScreen(false)}
      >
        <Image
          source={{
            uri: `http://192.168.1.10:5158${photo.fileUrl}`,
          }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{photo.ownerName}</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setFullScreen(true)}>
          <Image
            source={{
              uri: `http://192.168.1.10:5158${photo.fileUrl}`,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <Text
            style={[
              styles.noteText,
              !photo.note && styles.emptyNote,
            ]}
          >
            {photo.note || "Заметок нет"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1F8",
    paddingTop: 48,
    paddingHorizontal: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  back: {
    color: "#9A6BCB",
    fontSize: 16,
    fontWeight: "700",
    width: 60,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  image: {
    width: "100%",
    height: 460,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  noteBox: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    minHeight: 80,
  },

  noteText: {
    fontSize: 16,
    color: "#2E2E2E",
  },

  emptyNote: {
    color: "#B0B0B0",
  },

  fullScreen: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },
});