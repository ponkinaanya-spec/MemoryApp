import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

type Friend = {
  id: number;
  username: string;
  email: string;
};

export default function FriendsScreen() {
  const { userId } = useLocalSearchParams();

  const [search, setSearch] = useState("");

  const [friends] = useState<Friend[]>([]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      friend.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Друзья</Text>

        <View style={{ width: 70 }} />
      </View>

      <TextInput
        style={styles.search}
        placeholder="Поиск по имени или почте"
        placeholderTextColor="#9B9B9B"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredFriends.map((friend) => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.left}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {friend.username[0]}
                </Text>
              </View>

              <View>
                <Text style={styles.username}>
                  {friend.username}
                </Text>

                <Text style={styles.email}>
                  {friend.email}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.removeButton}>
              <Text style={styles.removeText}>−</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filteredFriends.length === 0 && (
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

    shadowColor: "#9A6BCB",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 8,
  },

  friendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#9A6BCB",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 8,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
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

  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1E6FA",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: "#9A6BCB",
    fontSize: 24,
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