import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { api } from "../src/services/api";

type RequestItem = {
  id: number;
  senderId: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

export default function FriendRequestsScreen() {
  const { userId } = useLocalSearchParams();

  const [requests, setRequests] = useState<RequestItem[]>([]);

  const loadRequests = async () => {
    const response = await api.get(`/Friends/requests/${userId}`);
    setRequests(response.data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const acceptRequest = async (requestId: number) => {
    await api.post(`/Friends/accept?requestId=${requestId}`);
    loadRequests();
  };

  const declineRequest = async (requestId: number) => {
    await api.delete(`/Friends/decline?requestId=${requestId}`);
    loadRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Заявки</Text>

        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {requests.map((request) => (
          <View key={request.id} style={styles.card}>
            <View style={styles.left}>
              {request.avatarUrl ? (
                <Image
                  source={{
                    uri: `http://192.168.1.10:5158${request.avatarUrl}`,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {request.username[0]}
                  </Text>
                </View>
              )}

              <View>
                <Text style={styles.username}>{request.username}</Text>
                <Text style={styles.email}>{request.email}</Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.accept}
                onPress={() => acceptRequest(request.id)}
              >
                <Text style={styles.buttonText}>✓</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.decline}
                onPress={() => declineRequest(request.id)}
              >
                <Text style={styles.buttonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {requests.length === 0 && (
          <Text style={styles.empty}>Заявок пока нет</Text>
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

  card: {
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

  buttons: {
    flexDirection: "row",
    gap: 8,
  },

  accept: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#9A6BCB",
    alignItems: "center",
    justifyContent: "center",
  },

  decline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D7C2EA",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#9B9B9B",
    fontSize: 16,
  },
});