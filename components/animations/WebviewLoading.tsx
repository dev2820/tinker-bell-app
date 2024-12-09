import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";

const WebviewLoading = () => {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FF7F57",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        source={require("@/assets/lotties/ticketbell.json")}
        style={{ width: "50%", height: "50%" }}
        autoPlay
        loop
      />
    </View>
  );
};

export default WebviewLoading;
