import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { api } from "../src/services/api";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await api.post("/Auth/register", {
        username,
        email,
        password,
      });

      Alert.alert("Успех", response.data.message);

      router.push("/");
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.response?.data || "Ошибка регистрации"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Memory</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Регистрация</Text>

        <TextInput
          style={styles.input}
          placeholder="Имя"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Почта"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            Зарегистрироваться
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/")}
        >
          <Text style={styles.link}>
            Уже есть аккаунт? Войти
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
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    padding: 24,

    shadowColor: "#9A6BCB",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
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
    marginBottom: 24,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  link: {
    textAlign: "center",
    color: "#9A6BCB",
    fontSize: 14,
  },
});