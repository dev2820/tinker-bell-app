import React from "react";
import LottieView from "lottie-react-native";

const Loading = () => {
  return (
    <LottieView
      source={require("@/assets/lotties/loading.json")}
      style={{ width: "100%", height: "100%", backgroundColor: "#FF7F57" }}
      autoPlay
      loop
    />
  );
};

export default Loading;
