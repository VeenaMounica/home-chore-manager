import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTasks } from "../context/TaskContext";
import { Frequency, Task } from "../types/Tasks";
import { addTaskStyles } from "../styles/common";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "EditTask">;

export default function EditTaskScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { tasks, updateTask } = useTasks();
  
  console.log('EditTaskScreen - taskId:', taskId);
  console.log('EditTaskScreen - available tasks:', tasks);
  
  const existingTask = tasks.find(task => task.id === taskId);
  
  console.log('EditTaskScreen - found task:', existingTask);
  
  const [title, setTitle] = useState(existingTask?.title || "");
  const [frequency, setFrequency] = useState<Frequency>(existingTask?.frequency || "daily");
  const [time, setTime] = useState(existingTask?.time || "09:00");
  const [startDate, setStartDate] = useState(existingTask ? 
    (existingTask.startDate ? new Date(existingTask.startDate) : new Date()) : 
    new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number>(existingTask?.dayOfWeek || 1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(existingTask?.dayOfMonth || 1);

  // Calculate date ranges (no minimum date, max 1 year ahead)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setFrequency(existingTask.frequency);
      setTime(existingTask.time);
      const taskDate = existingTask.startDate ? new Date(existingTask.startDate) : new Date();
      setStartDate(taskDate);
      // Initialize manual date with a simple format that's easy to edit
      setManualDate(taskDate.toISOString().split('T')[0]); // YYYY-MM-DD format
      setDayOfWeek(existingTask.dayOfWeek || 1);
      setDayOfMonth(existingTask.dayOfMonth || 1);
    }
  }, [existingTask]);

  const handleSave = () => {
    if (!existingTask) return;

    // Create a proper date object at noon to avoid timezone issues
    const saveDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      12, 0, 0 // Set to noon to avoid timezone offset issues
    );

    const dateString = saveDate.toISOString().split('T')[0];
    console.log('Saving date details:', {
      originalDate: startDate,
      saveDate: saveDate,
      dateString: dateString,
      year: saveDate.getFullYear(),
      month: saveDate.getMonth() + 1,
      day: saveDate.getDate()
    });

    console.log('Saving task with data:', {
      title,
      frequency,
      time,
      startDate: dateString,
      dayOfWeek,
      dayOfMonth
    });

    const updatedTask: Task = {
      ...existingTask,
      title,
      frequency,
      time,
      startDate: dateString,
      ...(frequency === "weekly" && { dayOfWeek }),
      ...(frequency === "monthly" && { dayOfMonth }),
    };

    console.log('Updated task object:', updatedTask);
    updateTask(updatedTask);
    navigation.goBack();
  };

  const [manualDate, setManualDate] = useState("");

  const formatDateForDisplay = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const parseDateInput = (text: string): Date | null => {
    // Remove any extra whitespace
    const cleanText = text.trim();
    
    // Try different date parsing strategies
    const strategies = [
      // ISO format: YYYY-MM-DD
      () => {
        const match = cleanText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
          const [, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // European format with dots: DD.MM.YYYY
      () => {
        const match = cleanText.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // European format with dashes: DD-MM-YYYY
      () => {
        const match = cleanText.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      },
      // Smart slash format detection
      () => {
        const match = cleanText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
          const [, first, second, year] = match;
          // If first number > 12, it must be day (European format)
          // If second number > 12, it must be day (European format)
          // Otherwise, assume European format for consistency
          const firstNum = parseInt(first);
          const secondNum = parseInt(second);
          
          if (firstNum > 12 || secondNum > 12 || (firstNum <= 12 && secondNum <= 12)) {
            // European: DD/MM/YYYY
            return new Date(parseInt(year), firstNum - 1, secondNum);
          } else {
            // US: MM/DD/YYYY
            return new Date(parseInt(year), secondNum - 1, firstNum);
          }
        }
        return null;
      },
      // Natural language fallback
      () => new Date(cleanText)
    ];

    for (const strategy of strategies) {
      try {
        const date = strategy();
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    return null;
  };

  const handleManualDateChange = (text: string) => {
    console.log('Manual date input:', text);
    setManualDate(text); // Update the input field immediately
    
    // Try to parse the date as user types
    const parsedDate = parseDateInput(text);
    if (parsedDate) {
      console.log('Successfully parsed date:', parsedDate);
      console.log('Parsed date details:', {
        year: parsedDate.getFullYear(),
        month: parsedDate.getMonth() + 1,
        day: parsedDate.getDate(),
        isoString: parsedDate.toISOString(),
        localDateString: parsedDate.toLocaleDateString()
      });
      setStartDate(parsedDate);
    } else {
      console.log('Not yet a valid date, waiting for more input');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker changed:', event, selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      console.log('Setting new date:', selectedDate);
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
    return date.toLocaleDateString();
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
              value={startDate.toISOString().split('T')[0]}
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
              style={{
                ...addTaskStyles.dateButton,
                backgroundColor: '#f9f9f9'
              }}
              onPress={() => {
                alert('Date picker pressed!');
                console.log('Date picker button pressed');
                setShowDatePicker(true);
              }}
            >
              <Text style={addTaskStyles.dateButtonText}>{startDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS !== 'web' && showDatePicker && (
            <>
              {console.log('Rendering date picker')}
              <DateTimePicker
                value={startDate}
                mode="date"
                display="calendar"
                maximumDate={maxDate}
                onChange={onDateChange}
                style={{ height: 200, marginTop: 20 }}
              />
              <View style={{ marginTop: 10 }}>
                <Text style={addTaskStyles.label}>Or enter date manually:</Text>
                <TextInput
                  style={{
                    ...addTaskStyles.input,
                    backgroundColor: '#f9f9f9'
                  }}
                  placeholder="Try: 2026-02-25, 20-02-2026, 20.02.2026, 20/02/2026, Feb 25, 2026"
                  value={manualDate}
                  onChangeText={handleManualDateChange}
                />
              </View>
            </>
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
              style={{
                ...addTaskStyles.dateButton,
                backgroundColor: '#f9f9f9'
              }}
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
                      backgroundColor: dayOfWeek === index ? '#007AFF' : '#f0f0f0',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      marginHorizontal: 2,
                      borderWidth: 1,
                      borderColor: dayOfWeek === index ? '#007AFF' : '#ddd',
                      minWidth: 40,
                      alignItems: 'center'
                    }}
                    onPress={() => setDayOfWeek(index)}
                  >
                    <Text style={{ 
                      fontSize: 14, 
                      color: dayOfWeek === index ? '#fff' : '#333',
                      fontWeight: '500'
                    }}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {frequency === "monthly" && (
            <>
              <Text style={addTaskStyles.label}>Day of Month (1-31)</Text>
              <TextInput
                style={{
                  ...addTaskStyles.input,
                  backgroundColor: '#f9f9f9'
                }}
                placeholder="1"
                value={dayOfMonth.toString()}
                onChangeText={(text) => setDayOfMonth(parseInt(text) || 1)}
                keyboardType="numeric"
              />
            </>
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
