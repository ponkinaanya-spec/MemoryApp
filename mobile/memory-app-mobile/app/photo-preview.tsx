import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

import { api } from "../src/services/api";

export default function PhotoPreviewScreen() {
    const { folderId, userId, imageUri } = useLocalSearchParams();

    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

  const uploadPhoto = async () => {
    try {
      setLoading(true);

    const uri = String(imageUri);

    const formData = new FormData();

    formData.append("ownerId", String(userId));
    formData.append("note", note);
    formData.append("folderIds", String(folderId));

      formData.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      await api.post("/Photos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.response?.data || error.message || "Не удалось загрузить фото"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>×</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Новое фото</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
            source={{ uri: String(imageUri) }}
            style={styles.image}
            resizeMode="contain"
        />

        <TextInput
            style={styles.noteInput}
            placeholder="Добавьте заметки к воспоминанию"
            placeholderTextColor="#B0B0B0"
            value={note}
            onChangeText={setNote}
            multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={uploadPhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Загрузка..." : "Загрузить фото"}
          </Text>
        </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  cancel: {
    width: 40,
    color: "#9A6BCB",
    fontSize: 34,
    fontWeight: "600",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  image: {
    width: "100%",
    height: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
  },

  noteInput: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: "#2E2E2E",
    textAlignVertical: "top",
  },

  button: {
    marginTop: 18,
    backgroundColor: "#9A6BCB",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});