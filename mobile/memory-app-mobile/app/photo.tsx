import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Clipboard from "expo-clipboard";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState("");

  const photoUrl = photo
  ? `http://192.168.1.10:5158${photo.fileUrl}`
  : "";

const downloadPhoto = async () => {
  if (!photo) return;

  const permission = await MediaLibrary.requestPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Ошибка", "Нужно разрешить доступ к галерее");
    return;
  }

  const fileUri = FileSystem.documentDirectory + `memory-photo-${photo.id}.jpg`;

  const downloadedFile = await FileSystem.downloadAsync(photoUrl, fileUri);

  await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);

  Alert.alert("Готово", "Фото сохранено в галерею");
};

const copyPhotoLink = async () => {
  if (!photo) return;

  await Clipboard.setStringAsync(photoUrl);

  Alert.alert("Готово", "Ссылка на фото скопирована");
};

const openPhotoActions = () => {
  Alert.alert(
    "Фото",
    "Выберите действие",
    [
      {
        text: "Скопировать ссылку",
        onPress: copyPhotoLink,
      },
      {
        text: "Скачать",
        onPress: downloadPhoto,
      },
      {
        text: "Отмена",
        style: "cancel",
      },
    ]
  );
};

  const loadPhoto = async () => {
    const response = await api.get(`/Photos/${photoId}`);
    setPhoto(response.data);
    setEditedNote(response.data.note || "");
  };

  const saveNote = async () => {
  if (!photo) return;

  await api.put(`/Photos/${photo.id}/note`, {
    note: editedNote,
  });

  setPhoto({
    ...photo,
    note: editedNote,
  });

  setIsEditing(false);
};

const deletePhoto = async () => {
  if (!photo) return;

  Alert.alert(
    "Удалить фото?",
    "Это действие нельзя отменить.",
    [
      {
        text: "Отмена",
        style: "cancel",
      },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/Photos/${photo.id}`);
          router.back();
        },
      },
    ]
  );
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
            onLongPress={openPhotoActions}
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
        <View style={styles.metaRow}>
            <View style={styles.authorBlock}>
                <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {photo.ownerName[0]}
                </Text>
                </View>

                <Text style={styles.authorName}>{photo.ownerName}</Text>
            </View>

            <Text style={styles.dateText}>
                {new Date(photo.uploadedAt).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                })}
            </Text>
        </View>

    <View style={styles.noteBox}>
        {isEditing ? (
            <TextInput
            style={styles.noteInput}
            value={editedNote}
            onChangeText={setEditedNote}
            placeholder="Добавьте заметки к воспоминанию"
            placeholderTextColor="#B0B0B0"
            multiline
            />
        ) : (
            <Text
            style={[
                styles.noteText,
                !photo.note && styles.emptyNote,
            ]}
            >
            {photo.note || "Заметок нет"}
            </Text>
        )}
        </View>

        <View style={styles.actions}>
        {isEditing ? (
            <TouchableOpacity style={styles.actionButton} onPress={saveNote}>
            <Text style={styles.actionButtonText}>Сохранить</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditing(true)}
            >
            <Text style={styles.actionButtonText}>Изменить</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={deletePhoto}>
            <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
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

  noteInput: {
  fontSize: 16,
  color: "#2E2E2E",
  minHeight: 80,
  textAlignVertical: "top",
},

actions: {
  flexDirection: "row",
  gap: 10,
  marginTop: 14,
  marginBottom: 30,
},

actionButton: {
  flex: 1,
  backgroundColor: "#9A6BCB",
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: "center",
},

deleteButton: {
  flex: 1,
  backgroundColor: "#7E6A8E",
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: "center",
},

actionButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},

metaRow: {
  marginTop: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

authorBlock: {
  flexDirection: "row",
  alignItems: "center",
},

avatar: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#9A6BCB",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

avatarText: {
  color: "#FFFFFF",
  fontWeight: "700",
},

authorName: {
  fontSize: 15,
  fontWeight: "700",
  color: "#2E2E2E",
},

dateText: {
  fontSize: 12,
  color: "#9B9B9B",
  maxWidth: 150,
  textAlign: "right",
},
});