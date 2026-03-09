import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../context/TaskContext";
import { Frequency, Task, TaskType, PersonalGoalType } from "../types/Tasks";
import { addTaskStyles } from "../styles/addTaskStyles";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { TaskTypeSelector } from "../components/TaskTypeSelector";
import { PersonalGoalTypeSelector } from "../components/PersonalGoalTypeSelector";
import { ChoreConfig } from "../components/ChoreConfig";

type Props = NativeStackScreenProps<RootStackParamList, "EditTask">;

export default function EditTaskScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { tasks, updateTask } = useTasks();

  const existingTask = tasks.find(task => task.id === taskId);

  const [title, setTitle] = useState(existingTask?.title || "");
  const [taskType, setTaskType] = useState<TaskType>(existingTask?.type || "chore");
  const [frequency, setFrequency] = useState<Frequency>(existingTask?.frequency || "daily");
  const [personalGoalType, setPersonalGoalType] = useState<PersonalGoalType>(existingTask?.personalGoalType || "normal");
  const [startDate, setStartDate] = useState(existingTask ?
    (existingTask.startDate ? new Date(existingTask.startDate) : new Date()) :
    new Date()
  );
  const [time, setTime] = useState(existingTask?.time || "09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(existingTask?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(existingTask?.dayOfMonth ?? 1);

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setTaskType(existingTask.type);
      if (existingTask.type === "chore") {
        setFrequency(existingTask.frequency!);
        setTime(existingTask.time!);
        const taskDate = existingTask.startDate ? new Date(existingTask.startDate) : new Date();
        setStartDate(taskDate);
        setDayOfWeek(existingTask.dayOfWeek ?? 1);
        setDayOfMonth(existingTask.dayOfMonth ?? 1);
      } else {
        setPersonalGoalType(existingTask.personalGoalType!);
      }
    }
  }, []);

  const handleSave = () => {
    if (!existingTask) return;

    const baseUpdate = {
      ...existingTask,
      title,
      type: taskType,
    };

    let updatedTask: Task;
    if (taskType === "chore") {
      const saveDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        12, 0, 0
      );
      const dateString = saveDate.toISOString().split('T')[0];

      updatedTask = {
        ...baseUpdate,
        frequency,
        time,
        startDate: dateString,
        ...(frequency === "weekly" && { dayOfWeek }),
        ...(frequency === "monthly" && { dayOfMonth }),
      };
    } else {
      updatedTask = {
        ...baseUpdate,
        personalGoalType,
      };
    }

    updateTask(updatedTask);
    navigation.goBack();
  };

  if (!existingTask) {
    console.log('Task not found for ID:', taskId);
    return (
      <ScrollView style={{ 
        flex: 1, 
        backgroundColor: '#f5f5f5'
      }}>
        <View style={{ 
          flex: 1,
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: 20,
          minHeight: Dimensions.get('window').height
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 30,
            borderRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              marginBottom: 20, 
              textAlign: 'center',
              color: '#333'
            }}>Task not found</Text>
            <Text style={{ 
              fontSize: 16, 
              color: '#666',
              marginBottom: 20,
              textAlign: 'center'
            }}>Task ID: {taskId}</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ 
      flex: 1, 
      backgroundColor: '#f5f5f5'
    }}>
      <View style={{ 
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 20,
        minHeight: Dimensions.get('window').height,
        paddingVertical: 20
      }}>
        <View style={{
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
          width: '100%',
          maxWidth: 500
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 25, 
            textAlign: 'center',
            color: '#333'
          }}>Edit Task</Text>

          <Text style={addTaskStyles.label}>Task Title</Text>
          <TextInput
            style={{
              ...addTaskStyles.input,
              backgroundColor: '#f9f9f9',
              fontSize: 16
            }}
            placeholder="e.g. Change bedsheets"
            value={title}
            onChangeText={setTitle}
          />

          <TaskTypeSelector
            taskType={taskType}
            onTaskTypeChange={setTaskType}
          />

          {taskType === "personal" && (
            <PersonalGoalTypeSelector
              personalGoalType={personalGoalType}
              onPersonalGoalTypeChange={setPersonalGoalType}
            />
          )}

          {taskType === "chore" && (
            <ChoreConfig
              frequency={frequency}
              onFrequencyChange={setFrequency}
              dayOfWeek={dayOfWeek}
              onDayOfWeekChange={setDayOfWeek}
              dayOfMonth={dayOfMonth}
              onDayOfMonthChange={setDayOfMonth}
              startDate={startDate}
              onStartDateChange={setStartDate}
              time={time}
              onTimeChange={setTime}
            />
          )}

          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 20,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            onPress={handleSave}
          >
            <Text style={typography.button}>Update Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
