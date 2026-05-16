import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { api } from "../src/services/api";

type PhotoItem = {
  id: number;
  fileUrl: string;
  note: string | null;
  uploadedAt: string;
};

export default function ProfileScreen() {
  const { userId, username } = useLocalSearchParams();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const loadPhotos = async () => {
    const response = await api.get(`/Photos/user/${userId}`);
    setPhotos(response.data);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Профиль</Text>

        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {String(username || "A")[0]}
            </Text>
          </View>

          <Text style={styles.username}>{username}</Text>
          <Text style={styles.info}>Мои воспоминания</Text>
        </View>

        <Text style={styles.sectionTitle}>Мои фотографии</Text>

        <View style={styles.grid}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoCard}
              onPress={() => router.push(`/photo?photoId=${photo.id}`)}
            >
              <Image
                source={{
                  uri: `http://192.168.1.10:5158${photo.fileUrl}`,
                }}
                style={styles.photo}
              />
            </TouchableOpacity>
          ))}
        </View>

        {photos.length === 0 && (
          <Text style={styles.emptyText}>Фотографий пока нет</Text>
        )}
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
    width: 70,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  profileBlock: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 26,
    marginBottom: 22,
    shadowColor: "#9A6BCB",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
  },

  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  info: {
    marginTop: 6,
    color: "#9B9B9B",
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  photoCard: {
    width: "31.8%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#D8D8D8",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#9B9B9B",
    fontSize: 16,
  },
});