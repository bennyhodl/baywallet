import { useEffect, useState } from "react"
import { setupLdk, syncLdk } from "../ldk"
import { useDataStore } from "../store/DataProvider"
import ldk from "@synonymdev/react-native-ldk/dist/ldk"
import { EmitterSubscription } from "react-native";
import lm, { EEventTypes, TChannelManagerPayment, TChannelUpdate } from "@synonymdev/react-native-ldk";
import Toast from "react-native-toast-message";
import { getLatestBlockHeader } from "../electrs/http";

export const useLightningNode = (
	logSubscription: EmitterSubscription | undefined, 
	paymentSubscription: EmitterSubscription | undefined, 
	onChannelSubscription: EmitterSubscription | undefined, 
	backupSubscriptionId: string | undefined
) => {
  const [nodeStarted, setNodeStarted] = useState<boolean>(false)
  const [appReady, setAppReady] = useState<boolean>(false)
  const { lightningStore } = useDataStore()

  useEffect(() => {
    if (!nodeStarted) return
    syncLdk()
  }, [nodeStarted])

  useEffect(() => {
    if (nodeStarted) {
      initLightningInfo()
      return
    }
    connectToLightning()
  }, [nodeStarted])

  const initLightningInfo = async () => {
    await lightningStore.getLightningInfo()
    setAppReady(true)
  }

  const connectToLightning = async () => {
    ldk.reset()
    await setupLdk()
    setNodeStarted(true)
  }

	useEffect(() => {
		let interval: NodeJS.Timer
		interval = setInterval(() => {
			getLatestBlockHeader()
			syncLdk()
		}, 100000)
	})

  useEffect(() => {
    if (!logSubscription) {
			// @ts-ignore
			logSubscription = ldk.onEvent(EEventTypes.ldk_log, (log: string) => {/* I can send logs somewhere here */})
		}

		if (!paymentSubscription) {
			// @ts-ignore
			paymentSubscription = ldk.onEvent(
				EEventTypes.channel_manager_payment_claimed,
				(res: TChannelManagerPayment) =>
					Toast.show({
            type: "success",
            text1: "New payment!",
						text2: `${res.amount_sat} sats`,
          })
			);
		}

		if (!onChannelSubscription) {
			// @ts-ignore
			onChannelSubscription = ldk.onEvent(
				EEventTypes.new_channel,
				(res: TChannelUpdate) =>
					Toast.show({
            type: "success",
            text1: "New channel!",
						text2: `Channel received from ${res.counterparty_node_id} Channel ${res.channel_id}`,
          })
			);
		}

		if (!backupSubscriptionId) {
			backupSubscriptionId = lm.subscribeToBackups((backupRes) => {
				if (backupRes.isErr()) {
					return alert('Backup required but failed to export account');
				}

				console.log(
					`Backup updated for account ${backupRes.value.account.name}`,
				);
			});
		}

		return (): void => {
			logSubscription && logSubscription.remove();
			paymentSubscription && paymentSubscription.remove();
			onChannelSubscription && onChannelSubscription.remove();
			backupSubscriptionId && lm.unsubscribeFromBackups(backupSubscriptionId);
		};
  }, [])

  return { appReady }
}