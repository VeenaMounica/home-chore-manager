import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { loginUser, registerUser } from '../config/firebase';
import { addTaskStyles } from '../styles/addTaskStyles';
import { homeStyles } from '../styles/homeStyles';
import { useTasks } from '../context/TaskContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { logout } = useTasks();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await registerUser(email, password);
        Alert.alert('Success', 'Account created successfully! Please sign in.');
        setIsRegistering(false);
      } else {
        await loginUser(email, password);
        Alert.alert('Success', 'Logged in successfully!');
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.screenWrapper}>
        <View style={addTaskStyles.card}>
          <Text style={addTaskStyles.cardTitle}>
            Home Chore Manager
          </Text>
          
          <Text style={{ 
            ...addTaskStyles.label,
            textAlign: 'center',
            marginBottom: 32
          }}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </Text>

          <TextInput
            style={addTaskStyles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <TextInput
            style={addTaskStyles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />

          <TouchableOpacity
            style={addTaskStyles.saveButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={homeStyles.addButtonText}>
                {isRegistering ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsRegistering(!isRegistering)}
            style={{ marginBottom: 24 }}
          >
            <Text style={{ 
              ...homeStyles.taskTitle,
              textDecorationLine: 'underline',
              textAlign: 'center'
            }}>
              {isRegistering 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...homeStyles.statusToggle,
              paddingVertical: 16,
              paddingHorizontal: 24,
            }}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={{ 
              ...homeStyles.taskStatus,
              fontSize: 14
            }}>
              Skip Login (Use Local Storage)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
