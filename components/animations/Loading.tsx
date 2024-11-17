import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";

const Loading = () => {
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
        source={require("@/assets/lotties/loading.json")}
        style={{ width: "80%", height: "80%" }}
        autoPlay
        loop
      />
    </View>
  );
};

export default Loading;
