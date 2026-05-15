import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { api } from "../src/services/api";

type FolderItem = {
  id: number;
  name: string;
};

type PhotoItem = {
  id: number;
  fileUrl: string;
  ownerName: string;
};

export default function FolderScreen() {
  const { folderId, userId } = useLocalSearchParams();

  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

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

  useEffect(() => {
    loadFolder();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{folderName}</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={styles.card}
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

          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.card}
            >
              <View style={styles.photoPlaceholder} />

              <View style={styles.overlay}>
                <Text style={styles.cardText}>
                  {photo.ownerName}
                </Text>
              </View>
            </TouchableOpacity>
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
    width: "31.8%",
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
});