import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Button,StyleSheet, Text, View, TextInput, ScrollView} from 'react-native';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {app} from "./firebase.cg";
import {getAuth,signInWithPopup,GoogleAuthProvider} from "firebase/auth";
import {getFirestore, addDoc, collection, doc, onSnapshot,getDocs} from "firebase/firestore";

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

let userName;

function LogIn({navigation}){
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const signIn = ()=>{
    signInWithPopup(auth,provider).then(res=>{
      userName = res.user.displayName;
      navigation.navigate("Home",{name:res.user.displayName})
    }).catch(err=>console.log);
  }

  return(
    <View>
      <Button
        title="Sign In With Google"
        onPress={signIn} 
      />
    </View>
  )
}

function HomeScreen({route, navigation}){ 
  return(
      <Tabs.Navigator >
        <Tabs.Screen name="Posts"   component={Posts} userName={route.params.name}/>
        <Tabs.Screen name="Compose" component={ComposePost} userName={route.params.name} />
      </Tabs.Navigator>
  )
}

function Posts(props){
  const [wishes,setWishes] = useState([]);
  const db = getFirestore(app);
  const ref = collection(db,"messages");
  
  useEffect(()=>{
    onSnapshot(ref,(snap)=> snap.forEach(doc=> setWishes(arr=>[...arr,<Text> {doc.data().msg} </Text>])));
    return(()=>{ setWishes([]) });
  },[])

  return(
    <ScrollView>
      <View>
        {wishes}
      </View>   
    </ScrollView>
  )
}

function ComposePost(){
  const [msg,setMsg]=useState("");
  const db = getFirestore(app);
  const ref = collection(db,"messages");
  const sendMessage = ()=>{
    addDoc(ref,{userName,msg});
  }
  return(
    <View>
      <TextInput
        multiline
        numberOfLines={4}
        onChangeText={text => setMsg(text)}
        value={msg}
      />
      <Button
        title="Post"
        onPress={sendMessage}
      />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn">
        <Stack.Screen component={LogIn} name="LogIn"/>
        <Stack.Screen component={HomeScreen} name="Home"/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
