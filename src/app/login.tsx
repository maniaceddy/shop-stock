import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, ImageBackground
} from 'react-native';
import { useAuth } from '@/context/auth';
import { hasUser, createUser, checkLogin } from '@/db/auth';
import { colors, radius, shadow } from '@/utils/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isSetup, setIsSetup] = useState(() => !hasUser());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function switchMode() {
    setIsSetup(!isSetup)
    setError('')
    setPassword('')
    setConfirm('')
  }

  async function handleSubmit() {
    setError('');
    const name = username.trim().toLowerCase();

    if (name.length < 3) return setError('Username must be at least 3 characters.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (isSetup && password !== confirm) return setError('Passwords do not match.');

    setBusy(true);
    try {
      if (isSetup) {
        await createUser(name, password);
      } else {
        const ok = await checkLogin(name, password);
        if (!ok) {
          setError('Wrong username or password.');
          return;
        }
      }
      signIn(name);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg.includes('UNIQUE') ? 'Sorry!🥱 Username is already taken' : msg)
    } finally {
        setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode='contain'
          />

        <Text style={styles.logo}>ShopStock</Text>
        <Text style={styles.tagline}>Stock and Sales. Simplified.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{isSetup ? 'Create your account' : 'Welcome back'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {isSetup && (
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSetup ? 'Create account' : 'Log in'}</Text>
          )}
        </Pressable>

        <Pressable onPress={switchMode} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {isSetup ? 'Already have an account? Log in' : 'Create an account'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: 20 },
  hero: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { color: '#cfe6d5', marginTop: 4, fontSize: 15 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, ...shadow,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, marginBottom: 10, backgroundColor: colors.background, color: colors.text,
  },
  error: { color: colors.danger, marginBottom: 10 },
  button: {
    backgroundColor: colors.primary, padding: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: colors.primary, fontWeight: '600' },
  logoImage: { width: 96, height: 96, borderRadius: 20, marginBottom: 12}
});