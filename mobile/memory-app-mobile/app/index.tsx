import { useEffect, useState } from "react";
import { router } from "expo-router";
import { api } from "../src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const checkAuth = async () => {
    const savedUserId =
      await AsyncStorage.getItem("userId");

    const savedUsername =
      await AsyncStorage.getItem("username");

    if (savedUserId && savedUsername) {
      router.replace(
        `/home?userId=${savedUserId}&username=${savedUsername}`
      );
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

const handleLogin = async () => {
  try {
    const response = await api.post("/Auth/login", {
      email,
      password,
    });

    await AsyncStorage.setItem(
      "userId",
      String(response.data.id)
    );

    await AsyncStorage.setItem(
      "username",
      response.data.username
    );

    router.replace(
      `/home?userId=${response.data.id}&username=${response.data.username}`
    );
  } catch (error: any) {
    Alert.alert(
      "Ошибка",
      error.response?.data ||
        error.message ||
        "Login error"
    );
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Memory</Text>

      {/* ФИОЛЕТОВЫЙ БЛЮР/СВЕЧЕНИЕ */}
      

      <View style={styles.card}>
        <Text style={styles.title}>Вход</Text>

        <TextInput
          style={styles.input}
          placeholder="Почта"
          placeholderTextColor="#8E8E8E"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#8E8E8E"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>
            Нет аккаунта? Зарегистрироваться
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1F8",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  logo: {
    fontSize: 44,
    fontWeight: "700",
    color: "#9A6BCB",
    textAlign: "center",
    marginBottom: 40,
    zIndex: 2,
  },



  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    padding: 24,

    shadowColor: "#4d2777",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 18,
    zIndex: 2,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#000",
  },

  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#A77AD6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,

    shadowColor: "#A77AD6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  link: {
    textAlign: "center",
    color: "#9A6BCB",
    fontSize: 14,
  },
});