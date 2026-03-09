import React from "react";
import { View, Text, TouchableOpacity, TextInput, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Frequency } from "../types/Tasks";
import { addTaskStyles } from "../styles/addTaskStyles";
import { useDateTimePicker } from "../hooks/useDateTimePicker";

interface ChoreConfigProps {
  frequency: Frequency;
  onFrequencyChange: (frequency: Frequency) => void;
  dayOfWeek: number;
  onDayOfWeekChange: (day: number) => void;
  dayOfMonth: number;
  onDayOfMonthChange: (day: number) => void;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  time: string;
  onTimeChange: (time: string) => void;
}

export const ChoreConfig: React.FC<ChoreConfigProps> = ({
  frequency,
  onFrequencyChange,
  dayOfWeek,
  onDayOfWeekChange,
  dayOfMonth,
  onDayOfMonthChange,
  startDate,
  onStartDateChange,
  time,
  onTimeChange,
}) => {
  const {
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    onDateChange,
    onTimeChange: pickerOnTimeChange,
    formatDate,
  } = useDateTimePicker(startDate, time);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    onDateChange(event, selectedDate);
    if (selectedDate) {
      onStartDateChange(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    pickerOnTimeChange(event, selectedTime);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      onTimeChange(newTime);
    }
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
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
                onStartDateChange(date);
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
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year ahead
          onChange={handleDateChange}
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
              onTimeChange(timeValue);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          style={addTaskStyles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={addTaskStyles.dateButtonText}>{time}</Text>
        </TouchableOpacity>
      )}

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${time}`)}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
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
          onPress={() => onFrequencyChange("daily")}
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
          onPress={() => onFrequencyChange("weekly")}
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
          onPress={() => onFrequencyChange("biweekly")}
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
          onPress={() => onFrequencyChange("monthly")}
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
                onPress={() => onDayOfWeekChange(index)}
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
            onChangeText={(text) => onDayOfMonthChange(parseInt(text) || 1)}
            keyboardType="numeric"
          />
        </>
      )}
    </>
  );
};