import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    Alert.alert("Регистрация", `Пользователь: ${username}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      <TextInput
        style={styles.input}
        placeholder="Имя"
        placeholderTextColor="#8E8E8E"
        value={username}
        onChangeText={setUsername}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Зарегистрироваться</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0EA",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#3C332E",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 14,
    color: "#3C332E",
  },
  button: {
    backgroundColor: "#7E6A5A",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 22,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  link: {
    color: "#6E5D50",
    textAlign: "center",
    fontSize: 15,
  },
});