import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import EditTaskScreen from "../screens/EditTaskScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: Platform.OS === 'web' ? true : false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: "Home Chores" }}
        />
        <Stack.Screen 
          name="AddTask" 
          component={AddTaskScreen} 
          options={{ title: "Add Task" }}
        />
        <Stack.Screen 
          name="EditTask" 
          component={EditTaskScreen} 
          options={{ title: "Edit Task" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}