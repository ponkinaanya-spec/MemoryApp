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

  const formatDateTitle = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedPhotos = photos.reduce(
    (groups: Record<string, PhotoItem[]>, photo) => {
      const dateTitle = formatDateTitle(photo.uploadedAt);

      if (!groups[dateTitle]) {
        groups[dateTitle] = [];
      }

      groups[dateTitle].push(photo);
      return groups;
    },
    {}
  );

  const logout = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Профиль</Text>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileBlock}>
          <TouchableOpacity style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {String(username || "A")[0]}
              </Text>
            </View>

            <View style={styles.avatarEdit}>
              <Text style={styles.editIcon}>✎</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>

            <TouchableOpacity>
              <Text style={styles.nameEdit}>✎</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push(`/friends?userId=${userId}`)}>
            <Text style={styles.friendsLink}>Список друзей</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Мои фотографии</Text>

        {Object.entries(groupedPhotos).map(([dateTitle, datePhotos]) => (
          <View key={dateTitle} style={styles.dateGroup}>
            <Text style={styles.dateTitle}>{dateTitle}</Text>

            <View style={styles.grid}>
              {datePhotos.map((photo) => (
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
          </View>
        ))}

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

  logout: {
    color: "#9A6BCB",
    fontSize: 15,
    fontWeight: "700",
    width: 70,
    textAlign: "right",
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

  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
  },

  avatarEdit: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#9A6BCB",
  },

  editIcon: {
    color: "#9A6BCB",
    fontSize: 16,
    fontWeight: "700",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  nameEdit: {
    color: "#9A6BCB",
    fontSize: 18,
    fontWeight: "700",
  },

  friendsLink: {
    marginTop: 10,
    color: "#9A6BCB",
    fontSize: 15,
    fontWeight: "700",
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

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#9B9B9B",
    fontSize: 16,
  },
});