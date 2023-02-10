import {observer} from 'mobx-react';
import React from 'react';
import {Divider, Icon, Text, TopNavigation, TopNavigationAction} from '@ui-kitten/components';
import {BaseComponent} from '../components/base-component';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavParamList } from 'src/navigation/NavParamList';
import { useNavigation } from '@react-navigation/native';

type SendScreenProp = NativeStackNavigationProp<NavParamList, 'send'>

export const Send = observer(() => {
  const navigation = useNavigation<SendScreenProp>()
  return (
    <BaseComponent>
      <TopNavigation
        title='Send'
        alignment='center'
        accessoryLeft={<TopNavigationAction onPress={() => navigation.goBack()} icon={<Icon name="arrow-back" />}/>}
      />
      <Divider />
      <Text>Send</Text>
    </BaseComponent>
  );
});
