import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {observer} from 'mobx-react';
import { Layout, Text } from '@ui-kitten/components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { BaseComponent } from '../components';
import { NavParamList } from '../navigation';

type ScanScreenProp = NativeStackNavigationProp<NavParamList, 'scan'>

export const Scan = observer(() => {
  const navigation = useNavigation<ScanScreenProp>()
  const [permissions, setPermissions] = useState<boolean>(false)
  const devices = useCameraDevices()
  const device = devices.back
  

  useEffect(() => {
    getCameraPermission()
  }, [permissions])

  const getCameraPermission = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus()

    if (cameraPermission !== "authorized") await Camera.requestCameraPermission()

    // if (cameraPermission.status !== 'granted') {
    //   alert('Permission for camera access needed to scan invoices.');
    // }
  };

  if (devices.back === undefined) return <Layout style={{height: "100%"}}><Text>NO DEVICE!</Text></Layout>
  return (
    <BaseComponent>
      <Camera device={device} isActive={true} style={{width: "100%", height: "100%"}} />
    </BaseComponent>
  );
});
