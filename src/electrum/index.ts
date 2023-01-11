import * as electrum from 'rn-electrum-client/helpers';
// import { err, ok, Result } from '../utils/result';
import { getItem, updateHeader } from '../ldk';
import { Block } from 'bitcoinjs-lib';
import * as tls from './tls';
// import { customPeers, selectedNetwork } from '../utils/constants';
import { THeader, TAvailableNetworks } from '@synonymdev/react-native-ldk';
// import {
// 	IGetHeaderResponse,
// 	ISubscribeToHeader,
// 	TGetAddressHistory,
// } from '../utils/types';
// import { getAddressFromScriptPubKey, getScriptHash } from '../utils/helpers';

export interface IGetHeaderResponse {
	id: Number;
	error: boolean;
	method: 'getHeader';
	data: string;
	network: TAvailableNetworks;
}

export interface ISubscribeToHeader {
	data: {
		height: number;
		hex: string;
	};
	error: boolean;
	id: string;
	method: string;
}

//Electrum Server Info (Synonym Regtest Set By Default)
export const customPeers = {
	bitcoin: [],
	bitcoinTestnet: [],
	bitcoinRegtest: [
		{
			host: '35.233.47.252',
			ssl: 18484,
			tcp: 18483,
			protocol: 'tcp',
		},
	],
};
/**
 * Returns the block hash given a block hex.
 * Leaving blockHex empty will return the last known block hash from storage.
 * @param {string} [blockHex]
 * @returns {string}
 */
const selectedNetwork: TAvailableNetworks = "bitcoinRegtest"
export const getBlockHashFromHex = async ({
	blockHex,
}: {
	blockHex?: string;
}): Promise<string> => {
	// If empty, return the last known block hex from storage.
	if (!blockHex) {
		const { hex } = await getBlockHeader();
		blockHex = hex;
	}
	const block = Block.fromHex(blockHex);
	const hash = block.getId();
	return hash;
};

/**
 * Returns last known block height, and it's corresponding hex from local storage.
 * @returns {THeader}
 */
export const getBlockHeader = async (): Promise<THeader> => {
	const header = await getItem('header');
	return JSON.parse(header);
};

/**
 * Returns the block hash for the provided height and network.
 * @param {number} [height]
 * @returns {Promise<Result<string>>}
 */
export const getBlockHashFromHeight = async ({
	height = 0,
}: {
	height?: number;
}): Promise<string> => {
  try {
    const response = await getBlockHex({ height });
    const blockHash = await getBlockHashFromHex({ blockHex: response });
    return blockHash;
  } catch (e) {
    console.log(e)
    return ""
  }
};

/**
 * Returns the block hex of the provided block height.
 * @param {number} [height]
 * @returns {Promise<Result<string>>}
 */
export const getBlockHex = async ({
	height = 0,
}: {
	height?: number;
}): Promise<string> => {
	const response: IGetHeaderResponse = await electrum.getHeader({
		height,
		network: selectedNetwork,
	});
	if (response.error) {
		return response.data;
	}
	return response.data;
};

export const connectToElectrum = async ({
	options = { net: undefined, tls: undefined },
}: {
	options?: { net?: any; tls?: any };
}): Promise<string> => {
	const net = options.net ?? global?.net;
	const _tls = options.tls ?? tls;

	console.info('NET', net);

	const startResponse = await electrum.start({
		network: selectedNetwork,
		customPeers: customPeers[selectedNetwork],
		net,
		tls: _tls,
	});

  console.log("start", startResponse)

	if (startResponse.error) {
		//Attempt one more time
		const { error, data } = await electrum.start({
			network: selectedNetwork,
			customPeers: customPeers[selectedNetwork],
			net,
			tls: _tls,
		});
		if (error) {
      console.log("could not connect", error)
			return data;
		}
	}
	return 'Successfully connected.';
};

/**
 * Subscribes to the current networks headers.
 * @param {Function} [onReceive]
 * @return {Promise<Result<string>>}
 */
export const subscribeToHeader = async ({
	onReceive,
}: {
	onReceive?: Function;
}): Promise<THeader> => {
	const subscribeResponse: ISubscribeToHeader = await electrum.subscribeHeader({
		network: selectedNetwork,
		onReceive: async (data:any) => {
			const hex = data[0].hex;
			const hash = getBlockHashFromHex({ blockHex: hex });
			const header = { ...data[0], hash };
			await updateHeader({
				header,
			});
			if (onReceive) {
				onReceive();
			}
		},
	});
	if (subscribeResponse.error) {
    throw console.log(subscribeResponse.error)
		// return 'Unable to subscribe to headers.';
	}
	// Update local storage with current height and hex.
	const hex = subscribeResponse.data.hex;
	const hash = await getBlockHashFromHex({ blockHex: hex });
	const header = { ...subscribeResponse.data, hash };
	await updateHeader({
		header,
	});
	return header;
};

// export const getScriptPubKeyHistory = async (
// 	scriptPubkey: string,
// ): Promise<TGetAddressHistory[]> => {
// 	try {
// 		const address = getAddressFromScriptPubKey(scriptPubkey);
// 		const scriptHash = getScriptHash(address);
// 		const response = await electrum.getAddressScriptHashesHistory({
// 			scriptHashes: [scriptHash],
// 			network: selectedNetwork,
// 		});

// 		/*
// 		const mempoolResponse = await electrum.getAddressScriptHashesMempool({
// 			scriptHashes: [scriptHash],
// 			network: selectedNetwork,
// 		});
// 		if (response.error || mempoolResponse.error) {
// 			return [];
// 		}
// 		const combinedResponse = [...response.data, ...mempoolResponse.data];
// 		*/

// 		let history: { txid: string; height: number }[] = [];
// 		await Promise.all(
// 			response.data.map(({ result }): void => {
// 				if (result && result?.length > 0) {
// 					result.map((item) => {
// 						// @ts-ignore
// 						history.push({
// 							txid: item?.tx_hash ?? '',
// 							height: item?.height ?? 0,
// 						});
// 					});
// 				}
// 			}),
// 		);

// 		return history;
// 	} catch {
// 		return [];
// 	}
