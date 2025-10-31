import { StyleSheet, Text, View } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { TextField } from "heroui-native";

type Focusable = { focus: () => void };

const OtpInput = ({
    otpLength = 6,
    onChangeOtp,
    initial = "",
}: {
    otpLength?: number;
    onChangeOtp: (otp: string) => void;
    initial?: string;
}) => {
  //needs work for copy and paste
  const [otpArr, setOtpArr] = useState<string[]>(
    Array.from({ length: otpLength }, (_, i) => initial[i] ?? "")
  );
  const inputsRef = useRef<(Focusable | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const emit = (arr: string[]) => {
    setOtpArr(arr);
    onChangeOtp(arr.join(""));
  };

  const handleOnChange = (value: string, index: number) => {
    // accept only digits
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned.length === 0) {
      const next = [...otpArr];
      next[index] = "";
      emit(next);
      return;
    }

    // PASTE: distribute across boxes from current index
    if (cleaned.length > 1) {
      const next = [...otpArr];
      let j = 0;
      for (let i = index; i < otpLength && j < cleaned.length; i++) {
        next[i] = cleaned[j++];
      }
      emit(next);
      const last = Math.min(index + cleaned.length - 1, otpLength - 1);
      inputsRef.current[last]?.focus();
      return;
    }

    // Single char
    const next = [...otpArr];
    next[index] = cleaned.slice(-1);
    emit(next);
    if (index < otpLength - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleOnKeyPress = (e: any, index: number) => {
    const key = e?.nativeEvent?.key;
    if (key === "Backspace") {
      if (otpArr[index]) {
        const next = [...otpArr];
        next[index] = "";
        emit(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...otpArr];
        next[index - 1] = "";
        emit(next);
      }
    }
  };

  return (
    <View className="flex-row gap-2 justify-center">
      {Array.from({ length: otpLength }, (_, index) => (
        <TextField key={index} className="w-12">
          <TextField.Input
            ref={(ref) => {
              inputsRef.current[index] = ref as unknown as Focusable;
            }}
            value={otpArr[index]}
            onChangeText={(text) => handleOnChange(text, index)}
            onKeyPress={(e) => handleOnKeyPress(e, index)}
            keyboardType="default"
            textAlign="center"
            className="text-center text-2xl font-bold"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </TextField>
      ))}
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({});
