import { useState } from "react";
import { Platform } from "react-native";

export const useDateTimePicker = (initialDate: Date, initialTime: string = "09:00") => {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Create a new date at noon to avoid timezone issues
      const fixedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0 // Set to noon
      );
      setDate(fixedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      setTime(newTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  return {
    date,
    time,
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    onDateChange,
    onTimeChange,
    formatDate,
  };
};