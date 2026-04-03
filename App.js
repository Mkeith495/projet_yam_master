// ./App.js

import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./app/screens/home.screen";
import { SocketContext, socket } from "./app/contexts/socket.context";
import OnlineGameScreen from "./app/screens/online-game.screen";
import VsBotGameScreen from "./app/screens/vs-bot-game.screen";
import { audioManager } from "./app/audio/audio.manager";
import { Text } from "react-native";
import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_700Bold,
} from "@expo-google-fonts/orbitron";

const Stack = createStackNavigator();
LogBox.ignoreAllLogs(true);

function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
  });

  useEffect(() => {
    audioManager.init();
    return () => {
      audioManager.unloadAll();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#05060A",
              shadowColor: "rgba(0,0,0,0)",
            },
            headerTintColor: "#EAF6FF",
            headerTitleStyle: {
              fontFamily: "Orbitron_700Bold",
              letterSpacing: 2,
              color: "#EAF6FF",
            },
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              headerTitle: () => (
                <Text
                  style={{
                    fontFamily: "Orbitron_700Bold",
                    letterSpacing: 2,
                    color: "#EAF6FF",
                    textShadowColor: "rgba(0, 229, 255, 0.35)",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 10,
                  }}
                >
                  YAM MASTER
                </Text>
              ),
            }}
          />
          <Stack.Screen
            name="OnlineGameScreen"
            component={OnlineGameScreen}
            options={{ title: "J1 vs J2" }}
          />
          <Stack.Screen
            name="VsBotGameScreen"
            component={VsBotGameScreen}
            options={{ title: "Vs Bot" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
  );
}

export default App;
