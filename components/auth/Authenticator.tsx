import { View, Text } from "react-native";
import React from "react";
import { useW3SuiAuth } from "@/contexts/w3SuiAuth";

const Authenticator: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { loggedIn, open = false } = useW3SuiAuth();
  return (
    <>
      {open ? (
        <>{children}</>
      ) : (
        <View>
          <Text>Authenticator</Text>
          <Text>Authenticator</Text>
          <Text>Authenticator</Text>
          <Text>Authenticator</Text>
        </View>
      )}
    </>
  );
};

export default Authenticator;
