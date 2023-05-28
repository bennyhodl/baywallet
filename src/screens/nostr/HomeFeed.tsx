import React, {useEffect, useState} from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Divider, Avatar, Layout, TopNavigation, Button } from "@ui-kitten/components";
import { Pressable, ScrollView } from "react-native";
import { observer } from "mobx-react";
import { NostrParamList } from "../../navigation";
import { useDataStore } from "../../store";
import { BaseComponent, Note } from "../../components";
import { useNostrEvents, useProfile } from "../../nostr";

type HomeFeedProps = NativeStackNavigationProp<NostrParamList, "nostr-home-feed">

export const HomeFeed = observer(() => {
  const navigation = useNavigation<HomeFeedProps>()
  const { nostrStore: {me, nostrKeys} } = useDataStore()

  const {events} = useNostrEvents({
    filter: {
      since: 1,
      kinds: [1],
      authors: ["3f194d7cf5c59eca0145ed7804f0a67c0cc17b6ff6b4bd585821160dcf9d785b"]
    }
  })

  const {data: profile} = useProfile({
    pubkey: nostrKeys.pubkey
  })
  return (
    <BaseComponent>
      <TopNavigation
        title='Nostr'
        alignment='center'
        accessoryLeft={
          <Pressable onPress={() => navigation.navigate("nostr-profile", {pubkey: profile?.username})}>
            <Avatar size="small" source={{uri: profile?.picture }} />
          </Pressable>
        }
      />
      <Divider />
      <ScrollView>
        <Layout style={{marginHorizontal: 10}}>
          {events?.map(event => <Note key={event.id} note={event} navigation={navigation} />)}
        </Layout>
      </ScrollView>
    </BaseComponent>
  )
})