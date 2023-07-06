import { ENetworks, TAddPeerReq, TAvailableNetworks } from "@synonymdev/react-native-ldk";
import * as bitcoin from "bitcoinjs-lib"

// LDK config
export const selectedNetwork: TAvailableNetworks =  "bitcoinSignet"

export const ldkNetwork = (network: TAvailableNetworks): ENetworks => {
	switch (network) {
		case 'bitcoinRegtest':
			return ENetworks.regtest;
		case 'bitcoinTestnet':
			return ENetworks.testnet;
		case 'bitcoin':
			return ENetworks.mainnet;
	}
};

export const getNetwork = (
	network: TAvailableNetworks,
): bitcoin.networks.Network => {
	switch (network) {
		case 'bitcoin':
			return bitcoin.networks.bitcoin;
		case 'bitcoinTestnet':
			return bitcoin.networks.testnet;
		case 'bitcoinRegtest':
			return bitcoin.networks.regtest;
		default:
			return bitcoin.networks.regtest;
	}
};

export const mempoolHostname = 'mutinynet.com';

//Electrum Server Info (Bitcoin Bay regtest by default)
export const customPeers = {
	bitcoin: [],
	bitcoinTestnet: [],
	bitcoinRegtest: [
		{
			host: '64.225.50.85',
			tcp: 50001,
			protocol: 'tcp',
		},
	],
};

export const lspNodeDev: TAddPeerReq = {
	address: "64.225.50.85",
	port: 9736,
	pubKey: "037247419cb395f0f691908bf88663eb07cabf3fde8e7184ea922a9814cb16fd8e",
	timeout: 3600
}

// Nostr config
export const relayUrls: string[] = [
	"wss://nostr.bitcoinbay.engineering",
	"wss://nos.lol",
	"wss://relay.damus.io",
	"wss://eden.nostr.land",
	"wss://offchain.pub"
]