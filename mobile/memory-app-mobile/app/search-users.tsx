import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";

import { api } from "../src/services/api";

type UserItem = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

export default function SearchUsersScreen() {
  const { userId } = useLocalSearchParams();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);

  const searchUsers = async (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    const response = await api.get(
      `/Users/search?query=${value}`
    );

    setUsers(response.data);
  };

  const addFriend = async (friendId: number) => {
    await api.post(
      `/Friends/add?userId=${userId}&friendId=${friendId}`
    );

    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Поиск</Text>

        <View style={{ width: 70 }} />
      </View>

      <TextInput
        style={styles.search}
        placeholder="Имя или почта"
        placeholderTextColor="#9B9B9B"
        value={search}
        onChangeText={searchUsers}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <TouchableOpacity
              style={styles.left}
              onPress={() =>
                router.push(
                  `/user-profile?userId=${user.id}&viewerId=${userId}`
                )
              }
            >
              {user.avatarUrl ? (
                <Image
                  source={{
                    uri: `http://192.168.1.10:5158${user.avatarUrl}`,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.username[0]}
                  </Text>
                </View>
              )}

              <View>
                <Text style={styles.username}>
                  {user.username}
                </Text>

                <Text style={styles.email}>
                  {user.email}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addFriend(user.id)}
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}

        {search.length > 0 && users.length === 0 && (
          <Text style={styles.empty}>
            Пользователи не найдены
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
    paddingHorizontal: 16,
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

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 18,
  },

  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  email: {
    marginTop: 2,
    fontSize: 13,
    color: "#9B9B9B",
  },

  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: -2,
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#9B9B9B",
    fontSize: 16,
  },
});