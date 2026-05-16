import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { api } from "../src/services/api";

type User = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

type Photo = {
  id: number;
  fileUrl: string;
  uploadedAt: string;
};

export default function UserProfileScreen() {
  const { userId, viewerId } = useLocalSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const loadUser = async () => {
    const response = await api.get(`/Users/${userId}`);
    setUser(response.data);
  };

  const loadPhotos = async () => {
    const response = await api.get(
      `/Users/${userId}/shared-photos?viewerId=${viewerId}`
    );

    setPhotos(response.data);
  };

  useEffect(() => {
    loadUser();
    loadPhotos();
  }, []);

  const formatDateTitle = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedPhotos = photos.reduce(
    (groups: Record<string, Photo[]>, photo) => {
      const dateTitle = formatDateTitle(photo.uploadedAt);

      if (!groups[dateTitle]) {
        groups[dateTitle] = [];
      }

      groups[dateTitle].push(photo);

      return groups;
    },
    {}
  );

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
          {user?.avatarUrl ? (
            <Image
              source={{
                uri: `http://192.168.1.10:5158${user.avatarUrl}`,
              }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.[0] || "A"}
              </Text>
            </View>
          )}

          <Text style={styles.username}>
            {user?.username}
          </Text>

          <Text style={styles.email}>
            {user?.email}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Общие фотографии
        </Text>

        {Object.entries(groupedPhotos).map(([dateTitle, datePhotos]) => (
          <View key={dateTitle} style={styles.dateGroup}>
            <Text style={styles.dateTitle}>
              {dateTitle}
            </Text>

            <View style={styles.grid}>
              {datePhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoCard}
                  onPress={() =>
                    router.push(`/photo?photoId=${photo.id}`)
                  }
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
          </View>
        ))}

        {photos.length === 0 && (
          <Text style={styles.empty}>
            Общих фотографий пока нет
          </Text>
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

  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
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

  email: {
    marginTop: 4,
    color: "#9B9B9B",
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 12,
  },

  dateGroup: {
    marginBottom: 18,
  },

  dateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 10,
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

  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#9B9B9B",
    fontSize: 16,
  },
});