import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { api } from "../src/services/api";

type Folder = {
  id: number;
  name: string;
  isPinned: boolean;
  parentFolderId: number | null;
  previewPhotos: string[];
};

export default function HomeScreen() {
  const { userId, username } = useLocalSearchParams();

  const [ownFolders, setOwnFolders] = useState<Folder[]>([]);
  const [sharedFolders, setSharedFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadFolders = async () => {
    const response = await api.get(`/Folders/home/${userId}`);

    setOwnFolders(response.data.ownFolders);
    setSharedFolders(response.data.sharedFolders);
  };
  const createFolder = async () => {
  if (!newFolderName.trim()) {
    return;
  }

  await api.post("/Folders", {
    name: newFolderName,
    ownerId: Number(userId),
    parentFolderId: null,
  });

  setNewFolderName("");
  setMenuOpen(false);
  loadFolders();
};

  useEffect(() => {
    loadFolders();
  }, []);

  const filteredOwnFolders = ownFolders.filter((folder) =>
    folder.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSharedFolders = sharedFolders.filter((folder) =>
    folder.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Memory</Text>
        <View style={styles.profileCircle}>
          <Text style={styles.profileLetter}>
            {String(username || "A")[0]}
          </Text>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Поиск"
        placeholderTextColor="#FFFFFF"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Мои папки ›</Text>

        <View style={styles.grid}>
          {filteredOwnFolders.map((folder) => (
            <TouchableOpacity key={folder.id} style={styles.card}>
              <View style={styles.previewGrid}>
                {[0, 1, 2, 3].map((item) => (
                  <View key={item} style={styles.previewBox} />
                ))}
              </View>

              <View style={styles.cardOverlay}>
                <Text style={styles.cardText}>{folder.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Доступные мне ›</Text>

        <View style={styles.grid}>
          {filteredSharedFolders.map((folder) => (
            <TouchableOpacity key={folder.id} style={styles.card}>
              <View style={styles.previewGrid}>
                {[0, 1, 2, 3].map((item) => (
                  <View key={item} style={styles.previewBox} />
                ))}
              </View>

              <View style={styles.cardOverlay}>
                <Text style={styles.cardText}>{folder.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

        {menuOpen && (
            <View style={styles.addMenu}>
                <TextInput
                style={styles.folderInput}
                placeholder="Название папки"
                placeholderTextColor="#8E8E8E"
                value={newFolderName}
                onChangeText={setNewFolderName}
                />

                <TouchableOpacity style={styles.menuButton} onPress={createFolder}>
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
  },

  logo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#9A6BCB",
  },

  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
  },

  profileLetter: {
    color: "#9A6BCB",
    fontWeight: "700",
  },

  search: {
    backgroundColor: "#9A6BCB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 14,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    marginTop: 10,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  card: {
    width: "31.8%",
    aspectRatio: 1,
    backgroundColor: "#BEBEBE",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
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
    borderColor: "#D8D8D8",
    backgroundColor: "#CFCFCF",
  },

  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
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