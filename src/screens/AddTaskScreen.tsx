import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../context/TaskContext";
import { Frequency, TaskType, PersonalGoalType } from "../types/Tasks";
import { homeStyles } from "../styles/homeStyles";
import { addTaskStyles } from "../styles/addTaskStyles";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

// Simple UUID generator for platforms without crypto
const generateSimpleId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

export default function AddTaskScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("chore");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [personalGoalType, setPersonalGoalType] = useState<PersonalGoalType>("normal");
  const [time, setTime] = useState("09:00");
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1); // 1st of month
  const { addTask } = useTasks();

  // Calculate date ranges (no minimum date, max 1 year ahead)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const baseTask = {
      id: generateSimpleId(),
      title,
      type: taskType,
      isActive: true,
      completions: [],
    };

    let newTask;
    if (taskType === "chore") {
      newTask = {
        ...baseTask,
        frequency,
        time,
        startDate: startDate.toISOString().split('T')[0],
        ...(frequency === "weekly" && { dayOfWeek }),
        ...(frequency === "monthly" && { dayOfMonth }),
      };
    } else {
      // Personal task
      newTask = {
        ...baseTask,
        personalGoalType,
      };
    }

    console.log('Creating new task with data:', newTask);
    addTask(newTask);
    navigation.goBack();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker changed:', event, selectedTime);
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      console.log('Setting new time:', newTime);
      setTime(newTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <ScrollView style={addTaskStyles.container}>
      <View style={homeStyles.screenWrapper}>
        <View style={addTaskStyles.card}>
          <Text style={addTaskStyles.cardTitle}>Add New Task</Text>

          <Text style={addTaskStyles.label}>Task Title</Text>
          <TextInput
            style={addTaskStyles.input}
            placeholder="e.g. Change bedsheets"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={addTaskStyles.label}>Task Type</Text>
          <View style={addTaskStyles.buttonRow}>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                taskType === "chore" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setTaskType("chore")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                taskType === "chore" && addTaskStyles.frequencyButtonTextSelected
              ]}>Chore</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                taskType === "personal" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setTaskType("personal")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                taskType === "personal" && addTaskStyles.frequencyButtonTextSelected
              ]}>Personal Goal</Text>
            </TouchableOpacity>
          </View>

          {taskType === "personal" && (
            <>
              <Text style={addTaskStyles.label}>Goal Type</Text>
              <View style={addTaskStyles.buttonRow}>
                <TouchableOpacity 
                  style={[
                    addTaskStyles.frequencyButton,
                    personalGoalType === "immediate" && addTaskStyles.frequencyButtonSelected
                  ]}
                  onPress={() => setPersonalGoalType("immediate")}
                >
                  <Text style={[
                    addTaskStyles.frequencyButtonText,
                    personalGoalType === "immediate" && addTaskStyles.frequencyButtonTextSelected
                  ]}>Immediate</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    addTaskStyles.frequencyButton,
                    personalGoalType === "normal" && addTaskStyles.frequencyButtonSelected
                  ]}
                  onPress={() => setPersonalGoalType("normal")}
                >
                  <Text style={[
                    addTaskStyles.frequencyButtonText,
                    personalGoalType === "normal" && addTaskStyles.frequencyButtonTextSelected
                  ]}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    addTaskStyles.frequencyButton,
                    personalGoalType === "long-term" && addTaskStyles.frequencyButtonSelected
                  ]}
                  onPress={() => setPersonalGoalType("long-term")}
                >
                  <Text style={[
                    addTaskStyles.frequencyButtonText,
                    personalGoalType === "long-term" && addTaskStyles.frequencyButtonTextSelected
                  ]}>Long-term</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {taskType === "chore" && (
            <>
              <Text style={addTaskStyles.label}>Start Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                ...addTaskStyles.input,
                cursor: 'pointer',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
              value={formatDate(startDate)}
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const date = new Date(dateValue + 'T00:00:00');
                  if (!isNaN(date.getTime())) {
                    setStartDate(date);
                    console.log('Date changed to:', date);
                  }
                }
              }}
            />
          ) : (
            <TouchableOpacity 
              style={addTaskStyles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={addTaskStyles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              maximumDate={maxDate}
              onChange={onDateChange}
            />
          )}

          <Text style={addTaskStyles.label}>Time</Text>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              style={{
                ...addTaskStyles.input,
                cursor: 'pointer',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
              value={time}
              onChange={(e) => {
                const timeValue = e.target.value;
                if (timeValue) {
                  setTime(timeValue);
                  console.log('Time changed to:', timeValue);
                }
              }}
            />
          ) : (
            <TouchableOpacity 
              style={addTaskStyles.dateButton}
              onPress={() => {
                console.log('Time picker button pressed');
                setShowTimePicker(true);
              }}
            >
              <Text style={addTaskStyles.dateButtonText}>{time}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS !== 'web' && showTimePicker && (
            <DateTimePicker
              value={new Date(`2000-01-01T${time}`)}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
              style={{ height: 200, marginTop: 20 }}
            />
          )}

          <Text style={addTaskStyles.label}>Frequency</Text>
          <View style={addTaskStyles.buttonRow}>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                frequency === "daily" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setFrequency("daily")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                frequency === "daily" && addTaskStyles.frequencyButtonTextSelected
              ]}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                frequency === "weekly" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setFrequency("weekly")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                frequency === "weekly" && addTaskStyles.frequencyButtonTextSelected
              ]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                frequency === "biweekly" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setFrequency("biweekly")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                frequency === "biweekly" && addTaskStyles.frequencyButtonTextSelected
              ]}>Biweekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                addTaskStyles.frequencyButton,
                frequency === "monthly" && addTaskStyles.frequencyButtonSelected
              ]}
              onPress={() => setFrequency("monthly")}
            >
              <Text style={[
                addTaskStyles.frequencyButtonText,
                frequency === "monthly" && addTaskStyles.frequencyButtonTextSelected
              ]}>Monthly</Text>
            </TouchableOpacity>
          </View>

          {frequency === "weekly" && (
            <>
              <Text style={addTaskStyles.label}>Day of Week</Text>
              <View style={addTaskStyles.buttonRow}>
                {daysOfWeek.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={{
                      ...addTaskStyles.frequencyButton,
                      ...(frequency === "weekly" && dayOfWeek === index && {
                        ...addTaskStyles.frequencyButtonSelected,
                        borderWidth: 2,
                        transform: [{ scale: 1.1 }]
                      })
                    }}
                    onPress={() => {
                      console.log('Setting day of week to:', index);
                      setDayOfWeek(index);
                    }}
                  >
                    <Text style={[
                      addTaskStyles.frequencyButtonText,
                      frequency === "weekly" && dayOfWeek === index && addTaskStyles.frequencyButtonTextSelected
                    ]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {frequency === "monthly" && (
            <>
              <Text style={addTaskStyles.label}>Day of Month (1-31)</Text>
              <TextInput
                style={addTaskStyles.input}
                placeholder="1"
                value={dayOfMonth.toString()}
                onChangeText={(text) => setDayOfMonth(parseInt(text) || 1)}
                keyboardType="numeric"
              />
            </>
          )}

            </>
          )}

          <TouchableOpacity
            style={addTaskStyles.saveButton}
            onPress={handleSave}
          >
            <Text style={typography.button}>Save Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}