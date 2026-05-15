import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

  const loadFolder = async () => {
    const response = await api.get(
      `/Folders/content/${folderId}?userId=${userId}`
    );

    setFolderName(response.data.folderName);
    setFolders(response.data.childFolders);
    setPhotos(response.data.photos);
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
});