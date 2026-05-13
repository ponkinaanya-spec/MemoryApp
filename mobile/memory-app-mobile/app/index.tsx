import { useState } from "react";
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

  const handleLogin = () => {
    Alert.alert("Вход", `Email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Memory</Text>

      {/* ФИОЛЕТОВЫЙ БЛЮР/СВЕЧЕНИЕ */}
      <View style={styles.glow} />

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

        <TouchableOpacity>
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

  /* ФИОЛЕТОВОЕ СВЕЧЕНИЕ */
  glow: {
    position: "absolute",
    width: 340,
    height: 340,
    backgroundColor: "#42226a",
    borderRadius: 200,
    alignSelf: "center",
    top: 220,
    opacity: 0.35,

    shadowColor: "#441f74",
    shadowOpacity: 0.9,
    shadowRadius: 80,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    padding: 24,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 10,
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