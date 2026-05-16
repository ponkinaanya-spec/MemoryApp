import { useEffect, useState, useCallback } from "react";
import {
  useLocalSearchParams,
  router,
  useFocusEffect,
} from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert
} from "react-native";

import { api } from "../src/services/api";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

type PhotoItem = {
  id: number;
  fileUrl: string;
  note: string | null;
  uploadedAt: string;
};

export default function ProfileScreen() {
  const { userId, username } = useLocalSearchParams();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [currentUsername, setCurrentUsername] = useState(
    String(username || "")
    );

    const [avatarUrl, setAvatarUrl] = useState<string | null>(
    null
    );

    const [requestsCount, setRequestsCount] = useState(0);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedUsername, setEditedUsername] = useState("");   

    const loadProfile = async () => {
    const userResponse = await api.get(`/Users/${userId}`);

    setCurrentUsername(userResponse.data.username);
    setEditedUsername(userResponse.data.username);
    setAvatarUrl(userResponse.data.avatarUrl);

    const photosResponse = await api.get(`/Photos/user/${userId}`);

    setPhotos(photosResponse.data);

    const requestsResponse = await api.get(`/Friends/requests/${userId}`);
    setRequestsCount(requestsResponse.data.length);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [userId])
    );

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

  const logout = async () => {
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("username");

    router.replace("/");
  };

    const saveUsername = async () => {
    if (!editedUsername.trim()) {
        Alert.alert("Ошибка", "Имя не может быть пустым");
        return;
    }

    await api.put(`/Users/${userId}`, {
        username: editedUsername,
    });

    setCurrentUsername(editedUsername);
    setIsEditingName(false);
    };

    const changeAvatar = async () => {
    const result =
        await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        });

    if (result.canceled) {
        return;
    }

    const image = result.assets[0];

    const formData = new FormData();

    formData.append("file", {
        uri: image.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
    } as any);

    await api.post(
        `/Users/${userId}/avatar`,
        formData,
        {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        }
    );

    loadProfile();
    };

    const deleteProfile = async () => {
        Alert.alert(
            "Удалить профиль?",
            "Будут удалены аккаунт, папки и фотографии пользователя.",
            [
            {
                text: "Отмена",
                style: "cancel",
            },
            {
                text: "Удалить",
                style: "destructive",
                onPress: async () => {
                await api.delete(`/Users/${userId}`);
                router.replace("/");
                },
            },
            ]
        );
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
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={changeAvatar}
            >
            {avatarUrl ? (
            <Image
                source={{
                uri: `http://192.168.1.10:5158${avatarUrl}`,
                }}
                style={styles.avatar}
            />
            ) : (
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                {String(currentUsername || "A")[0]}
                </Text>
            </View>
            )}

            <View style={styles.avatarEdit}>
              <Text style={styles.editIcon}>✎</Text>
            </View>
          </TouchableOpacity>

            <View style={styles.nameRow}>
            {isEditingName ? (
                <TextInput
                style={styles.nameInput}
                value={editedUsername}
                onChangeText={setEditedUsername}
                autoFocus
                />
            ) : (
                <Text style={styles.username}>
                {currentUsername}
                </Text>
            )}

            <TouchableOpacity
                onPress={() =>
                isEditingName ? saveUsername() : setIsEditingName(true)
                }
            >
                <Text style={styles.nameEdit}>
                {isEditingName ? "✓" : "✎"}
                </Text>
            </TouchableOpacity>
            </View> 

          <TouchableOpacity onPress={() => router.push(`/friends?userId=${userId}`)}>
            <Text style={styles.friendsLink}>Список друзей</Text>
          </TouchableOpacity>

          <TouchableOpacity
                onPress={() => router.push(`/friend-requests?userId=${userId}`)}
                >
                <Text style={styles.requestsLink}>
                Заявки в друзья{requestsCount > 0 ? ` (${requestsCount})` : ""}
                </Text>
                </TouchableOpacity>

          <TouchableOpacity onPress={deleteProfile}>
            <Text style={styles.deleteProfile}>
                Удалить профиль
            </Text>
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

  nameInput: {
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    minWidth: 140,
    },

    deleteProfile: {
        marginTop: 12,
        color: "#9A3F6B",
        fontSize: 14,
        fontWeight: "700",
    },

    requestsLink: {
        marginTop: 8,
        color: "#9A6BCB",
        fontSize: 15,
        fontWeight: "700",
    },
});