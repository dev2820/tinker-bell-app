import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";

const Loading = () => {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        source={require("@/assets/lotties/loading.json")}
        style={{ width: "30%", height: "30%" }}
        autoPlay
        loop
      />
    </View>
  );
};

export default Loading;
