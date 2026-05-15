import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

import { api } from "../src/services/api";
import * as ImagePicker from "expo-image-picker";

type FolderItem = {
  id: number;
  name: string;
};

type PhotoItem = {
  id: number;
  fileUrl: string;
  ownerName: string;
  uploadedAt: string;
};

export default function FolderScreen() {
  const { folderId, userId } = useLocalSearchParams();

  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
    const [accessUser, setAccessUser] = useState("");
    const [accessType, setAccessType] = useState<"viewer" | "editor">("viewer");

  const loadFolder = async () => {
    const response = await api.get(
      `/Folders/content/${folderId}?userId=${userId}`
    );

    setFolderName(response.data.folderName);
    setFolders(response.data.childFolders);
    setPhotos(response.data.photos);
  };

  const createChildFolder = async () => {
  if (!newFolderName.trim()) {
    return;
  }
  

  await api.post("/Folders", {
    name: newFolderName,
    ownerId: Number(userId),
    parentFolderId: Number(folderId),
  });

  setNewFolderName("");
  setMenuOpen(false);
  loadFolder();
};

    const grantAccess = async () => {
    if (!accessUser.trim()) {
        return;
    }

    await api.post("/FolderAccess/grant", {
        folderId: Number(folderId),
        userEmailOrUsername: accessUser,
        accessType,
    });

    setAccessUser("");
    setAccessType("viewer");
    setAccessMenuOpen(false);
    };
    const uploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
        alert("Нужно разрешить доступ к галерее");
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
    });

    if (result.canceled) {
        return;
    }

    const image = result.assets[0];

    setMenuOpen(false);

    router.push(
        `/photo-preview?folderId=${folderId}&userId=${userId}&imageUri=${encodeURIComponent(
        image.uri
        )}`
    );
    };

  useEffect(() => {
    loadFolder();
  }, []);

  useFocusEffect(
    useCallback(() => {
        loadFolder();
    }, [folderId])
    );
    const formatDateTitle = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const groupedPhotos = photos.reduce((groups: Record<string, PhotoItem[]>, photo) => {
  const dateTitle = formatDateTitle(photo.uploadedAt);

  if (!groups[dateTitle]) {
    groups[dateTitle] = [];
  }

  groups[dateTitle].push(photo);

  return groups;
}, {});
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{folderName}</Text>

        <TouchableOpacity onPress={() => setAccessMenuOpen(!accessMenuOpen)}>
            <Text style={styles.accessButton}>Доступ</Text>
        </TouchableOpacity>
      </View>
        {accessMenuOpen && (
            <View style={styles.accessMenu}>
                <TextInput
                style={styles.folderInput}
                placeholder="Имя или почта пользователя"
                placeholderTextColor="#8E8E8E"
                value={accessUser}
                onChangeText={setAccessUser}
                />

                <View style={styles.roleRow}>
                <TouchableOpacity
                    style={[
                    styles.roleButton,
                    accessType === "viewer" && styles.roleButtonActive,
                    ]}
                    onPress={() => setAccessType("viewer")}
                >
                    <Text
                    style={[
                        styles.roleText,
                        accessType === "viewer" && styles.roleTextActive,
                    ]}
                    >
                    Просмотр
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                    styles.roleButton,
                    accessType === "editor" && styles.roleButtonActive,
                    ]}
                    onPress={() => setAccessType("editor")}
                >
                    <Text
                    style={[
                        styles.roleText,
                        accessType === "editor" && styles.roleTextActive,
                    ]}
                    >
                    Редактор
                    </Text>
                </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.menuButton} onPress={grantAccess}>
                <Text style={styles.menuButtonText}>Выдать доступ</Text>
                </TouchableOpacity>
            </View>
            )}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
            {folders.map((folder) => (
            <TouchableOpacity
                key={folder.id}
                style={styles.card}
                onPress={() =>
                router.push(
                    `/folder?folderId=${folder.id}&userId=${userId}`
                )
                }
            >
              <View style={styles.previewGrid}>
                {[0, 1, 2, 3].map((item) => (
                  <View key={item} style={styles.previewBox} />
                ))}
              </View>

              <View style={styles.overlay}>
                <Text style={styles.cardText}>
                  {folder.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

{Object.entries(groupedPhotos).map(([dateTitle, datePhotos]) => (
  <View key={dateTitle} style={styles.dateGroup}>
    <Text style={styles.dateTitle}>{dateTitle}</Text>

    <View style={styles.photoGrid}>
      {datePhotos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.card}
          onPress={() =>
            router.push(`/photo?photoId=${photo.id}`)
          }
        >
          <Image
            source={{
              uri: `http://192.168.1.10:5158${photo.fileUrl}`,
            }}
            style={styles.photoImage}
          />

          <View style={styles.overlay}>
            <Text style={styles.cardText}>{photo.ownerName}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
))}
        </View>
      </ScrollView>
      {menuOpen && (
        <View style={styles.addMenu}>
            <TextInput
            style={styles.folderInput}
            placeholder="Название вложенной папки"
            placeholderTextColor="#8E8E8E"
            value={newFolderName}
            onChangeText={setNewFolderName}
            />

            <TouchableOpacity style={styles.menuButton} onPress={createChildFolder}>
            <Text style={styles.menuButtonText}>Создать папку</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonSecondary} onPress={uploadPhoto}>
            <Text style={styles.menuButtonText}>Добавить фото</Text>
            </TouchableOpacity>
        </View>
        )}

        <TouchableOpacity
        style={styles.addButton}
        onPress={() => setMenuOpen(!menuOpen)}
        >
        <Text style={styles.addButtonText}>{menuOpen ? "×" : "+"}</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1F8",
    paddingTop: 48,
    paddingHorizontal: 12,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  card: {
    width: "23.5%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#CFCFCF",
  },

  previewGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  previewBox: {
    width: "50%",
    height: "50%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#D8D8D8",
  },

  photoPlaceholder: {
    flex: 1,
    backgroundColor: "#BEBEBE",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 6,
  },

  cardText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  addButton: {
  position: "absolute",
  bottom: 28,
  alignSelf: "center",
  width: 54,
  height: 54,
  borderRadius: 16,
  backgroundColor: "#9A6BCB",
  alignItems: "center",
  justifyContent: "center",
  elevation: 8,
},

addButtonText: {
  color: "#FFFFFF",
  fontSize: 36,
  fontWeight: "700",
  marginTop: -4,
},

addMenu: {
  position: "absolute",
  left: 20,
  right: 20,
  bottom: 94,
  backgroundColor: "#FFFFFF",
  borderRadius: 24,
  padding: 16,
  shadowColor: "#9A6BCB",
  shadowOpacity: 0.25,
  shadowRadius: 24,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  elevation: 16,
},

folderInput: {
  backgroundColor: "#EFEFEF",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  marginBottom: 12,
},

menuButton: {
  backgroundColor: "#9A6BCB",
  borderRadius: 14,
  paddingVertical: 13,
  alignItems: "center",
},

menuButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

menuButtonSecondary: {
  backgroundColor: "#9A6BCB",
  borderRadius: 14,
  paddingVertical: 13,
  alignItems: "center",
  marginTop: 10,
},

photoImage: {
  width: "100%",
  height: "100%",
},

dateGroup: {
  width: "100%",
  marginTop: 18,
},

dateTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#2E2E2E",
  marginBottom: 10,
},

photoGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

accessButton: {
  color: "#9A6BCB",
  fontSize: 14,
  fontWeight: "700",
  width: 70,
  textAlign: "right",
},

accessMenu: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 14,
  marginBottom: 16,
  shadowColor: "#9A6BCB",
  shadowOpacity: 0.18,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  elevation: 10,
},

roleRow: {
  flexDirection: "row",
  gap: 10,
  marginBottom: 12,
},

roleButton: {
  flex: 1,
  backgroundColor: "#EFEFEF",
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: "center",
},

roleButtonActive: {
  backgroundColor: "#9A6BCB",
},

roleText: {
  color: "#6E6E6E",
  fontWeight: "700",
},

roleTextActive: {
  color: "#FFFFFF",
},
});