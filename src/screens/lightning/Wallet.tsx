import React from 'react';
import { EmitterSubscription, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';
import { View } from "react-native-ui-lib"
import { Button } from '../../components';
import { BaseComponent, BottomDrawer, Loading, Transaction, Balance } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { LightningParamList } from '../../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDataStore } from '../../store';
import { useLightningNode } from '../../hooks';

type WalletScreenProp = NativeStackNavigationProp<LightningParamList, 'wallet'>

export const Wallet = observer(() => {
  const navigation = useNavigation<WalletScreenProp>()
  const { lightningStore: { transactions } } = useDataStore()
  const { nodeStarted } = useLightningNode()

  if (!nodeStarted) return <Loading />

  return (
    <BaseComponent>
      <View style={styles.balance} center>
        <Balance />
        <View style={styles.walletButtons} row>
          <Button label="Receive" size="large" onPress={() => navigation.navigate('create-invoice')} />
          <Button label="Send" size="large" onPress={() => navigation.navigate('scan')} />
        </View>
      </View>
      <BottomDrawer>
        {transactions?.map(tx => <Transaction key={tx.payment_hash} transaction={tx} />)}
      </BottomDrawer>
    </BaseComponent>
  );
});

const styles = StyleSheet.create({
  balance: {
    marginTop: "15%"
  },
  walletButtons: {
    marginTop: "10%"
  }
})