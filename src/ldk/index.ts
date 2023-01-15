import RNFS from 'react-native-fs';
import * as electrum from "rn-electrum-client/helpers"
import lm, {
	DefaultTransactionDataShape,
	ENetworks,
	TAvailableNetworks,
	THeader,
	TTransactionData,
	TTransactionPosition,
} from '@synonymdev/react-native-ldk';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import { getBestBlock, getBlockHex, getScriptPubKeyHistory, getBlockHashFromHeight } from '../electrs/electrs';
import * as bitcoin from 'bitcoinjs-lib';
import { getAccount, getAddress } from '../accounts';
import { err } from '../types/result';
import { selectedNetwork } from '../util/config';
import { getItem } from '../storage';

export const setupLdk = async () => {
	try {
		const genesisHash = await getBlockHashFromHeight({height: 0})
		if (genesisHash.isErr()) {
			return err(genesisHash.error.message)
		}
		const account = await getAccount()
		console.log("ACCOUNT", account)
		await lm.setBaseStoragePath(`${RNFS.DocumentDirectoryPath}/baywallet/`)

		const lmStart = await lm.start({
			getBestBlock,
			genesisHash: genesisHash.value,
			account,
			getAddress,
			getScriptPubKeyHistory,
			getTransactionData,
			getTransactionPosition,
			broadcastTransaction,
			network: ldkNetwork(selectedNetwork),
		});

		if (lmStart.isErr()) {
			return err(`ERROR STARTING: ${lmStart.error.message}`)
		}

		const nodeId = await ldk.nodeId
		console.log("NODE ID", nodeId)
	} catch (e) {
		console.error("FAILED TO SET UP LDK", e)
	}
}

/**
 * Returns the transaction header, height and hex (transaction) for a given txid.
 * @param {string} txId
 * @returns {Promise<TTransactionData>}
 */
export const getTransactionData = async (
	txId: string = '',
): Promise<TTransactionData> => {
	let transactionData = DefaultTransactionDataShape;
	const data = {
		key: 'tx_hash',
		data: [
			{
				tx_hash: txId,
			},
		],
	};
	const response = await electrum.getTransactions({
		txHashes: data,
		network: selectedNetwork,
	});

	if (response.error || !response.data || response.data[0].error) {
		return transactionData;
	}
	const { confirmations, hex: hex_encoded_tx, vout } = response.data[0].result;
	const header = await getBestBlock();
	const currentHeight = header.height;
	let confirmedHeight = 0;
	if (confirmations) {
		confirmedHeight = currentHeight - confirmations + 1;
	}
	const hexEncodedHeader = await getBlockHex({
		height: confirmedHeight,
	});
	if (hexEncodedHeader.isErr()) {
		return transactionData;
	}
	const voutData = vout.map(({ n, value, scriptPubKey: { hex } }) => {
		return { n, hex, value };
	});
	return {
		header: hexEncodedHeader.value,
		height: confirmedHeight,
		transaction: hex_encoded_tx,
		vout: voutData,
	};
};

/**
 * Returns the position/index of the provided tx_hash within a block.
 * @param {string} tx_hash
 * @param {number} height
 * @returns {Promise<number>}
 */
export const getTransactionPosition = async ({
	tx_hash,
	height,
}): Promise<TTransactionPosition> => {
	const response = await electrum.getTransactionMerkle({
		tx_hash,
		height,
		network: selectedNetwork,
	});
	if (response.error || isNaN(response.data?.pos || response.data?.pos < 0)) {
		return -1;
	}
	return response.data.pos;
};

/**
 * Attempts to broadcast the provided rawTx.
 * @param {string} rawTx
 * @returns {Promise<string>}
 */
export const broadcastTransaction = async (rawTx: string): Promise<string> => {
	try {
		const response = await electrum.broadcastTransaction({
			rawTx,
			network: selectedNetwork,
		});
		console.log('broadcastTransaction', response);
		return response.data;
	} catch (e) {
		console.log(e);
		return '';
	}
};


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