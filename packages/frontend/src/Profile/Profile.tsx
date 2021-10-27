import './Profile.css';

import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import Blockies from 'react-blockies';
import {Contract} from 'web3-eth-contract';
import { Auth, PriceItem } from '../types';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Abi from '../abi.json';
import { Graph } from './Graph';
import MetricTable from './MetricTable';

let web3: Web3 | undefined = undefined;let myContract: Contract | undefined = undefined; // Will hold the web3 instance

interface Props {
	auth: Auth;
	onLoggedOut: () => void;
}

interface State {
	loading: boolean;
	user?: {
		id: number;
		username: string;
	};
	username: string;
}

interface JwtDecoded {
	payload: {
		id: string;
		publicAddress: string;
	};
}

export const Profile = ({ auth, onLoggedOut }: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		loading: false,
		user: undefined,
		username: '',		
	});
	const [loadingGraph, setLoadingGraph] = useState(false);
	const [totalUpdateCount, setTotalUpdateCount] = useState(0);
	const [currentETHUSDT, setCurrentETHUSDT] = useState(0);
	const [priceArray, setPriceArray] = useState<PriceItem[]>([]);
	const ourOracle = "0xA9B7bFAA96210637438C4A89D5c2F5b343062886";
	useEffect(() => {
		const { accessToken } = auth;
		const {
			payload: { id },
		} = jwtDecode<JwtDecoded>(accessToken);

		fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
			.then((response) => response.json())
			.then((user) => setState({ ...state, user }))
			.catch(window.alert);
	}, []);

	const handleChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, username: value });
	};

	const handleSubmit = () => {
		const { accessToken } = auth;
		const { user, username } = state;

		setState({ ...state, loading: true });

		if (!user) {
			window.alert(
				'The user id has not been fetched yet. Please try again in 5 seconds.'
			);
			return;
		}

		fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user.id}`, {
			body: JSON.stringify({ username }),
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			method: 'PATCH',
		})
			.then((response) => response.json())
			.then((user) => setState({ ...state, loading: false, user }))
			.catch((err) => {
				window.alert(err);
				setState({ ...state, loading: false });
			});
	};

	const { accessToken } = auth;

	const {
		payload: { publicAddress },
	} = jwtDecode<JwtDecoded>(accessToken);

	const { loading, user } = state;
	const username = user && user.username;
	
	//init
	const web3init = async () => {
		// Check if MetaMask is installed
		if (!(window as any).ethereum) {
			window.alert('Please install MetaMask first.');
			return;
		}

		if (!web3) {
			try {
				// Request account access if needed
				await (window as any).ethereum.enable();

				// We don't know window.web3 version, so we use our own instance of Web3
				// with the injected provider given by MetaMask
				web3 = new Web3((window as any).ethereum);
			} catch (error) {
				window.alert('You need to allow MetaMask.');
				return;
			}
		}

		const coinbase = await web3.eth.getCoinbase();
		if (!coinbase) {
			window.alert('Please activate MetaMask first.');
			return;
		}

		//get metrics from Web3
		myContract = new web3.eth.Contract(
			Abi as AbiItem[],
			ourOracle
		);		
	};

	// //initialize
	web3init();

	const drawMetrics = async () => {
		const res = await myContract!.methods
			.updateCount()
			.call({}, function (error: null, res: any) {
				if (error != null) {
					console.log(error);
					return;
				}				
			});
		setTotalUpdateCount(Number(res));
		await getTableData(Number(res));		
		
		myContract!.methods
			.ETHUSD()
			.call({}, function (error: null, res: any) {
				if (error != null) {
					console.log(error);
					return;
				}
				setCurrentETHUSDT(Number(res));
			});
			
	}
	const getTableData = async (count: number) => {
		//Clear array
		priceArray.splice(0,priceArray.length);

		for(let i = 0; i<count; i++){			
			const res = await myContract!.methods
				.priceArray(i)
				.call();
			priceArray.push({ts: res.ts, price: res.price, sender: res.sender});			
		}
		setPriceArray(priceArray);
		console.log("sinboss", priceArray);
	};
	const updatePrice = async () => {		
		myContract!.methods
			.updatePrice()
			.send({
				from: publicAddress,
				gasPrice: await web3!.eth.getGasPrice(),
				gas: 100000,
				value: 5000000000000000
			}, function (error: null, res: any) {
				if (error != null) {
					console.log(error);
					return;
				}
			});
	};
	return (
		<div className="Profile">
			<h1>Profile</h1>
			{/* <p>
				Logged in as <Blockies seed={publicAddress} />
			</p> */}
			<div>
				My username is {username ? <pre>{username}</pre> : 'not set.'}{' '}
				My publicAddress is <pre>{publicAddress}</pre>
			</div>
			<div>
				<label htmlFor="username">Change username: </label>
				<input name="username" onChange={handleChange} />
				<button disabled={loading} onClick={handleSubmit}>
					Submit
				</button>
			</div>
			<p>
				<button onClick={onLoggedOut}>Logout</button>
			</p>
			<h1>Dashboard for metrics from my Oracle.</h1>
			<div>
				<div>
					Test Network: Rinkeby
					</div>
				<div>
					Oracle Contract Address: {ourOracle}
				</div>
			</div>
			<button disabled={loadingGraph} onClick={updatePrice}>
				Update Price
			</button>
			<button disabled={loadingGraph} onClick={drawMetrics} style={{marginLeft:"20px"}}>
				Refresh
			</button>
			<p style={{marginBottom:"10px"}}>After calling oracle contract, we maybe wait for 1mins for new metrics info</p>
			<div>Total Updated Count: {totalUpdateCount}</div>
			<div>Current ETHUSDT: {currentETHUSDT}</div>
			
			<MetricTable tabledata={priceArray} />			
			<div style={{ marginTop:"10px"}}></div>	
			<Graph chartdata={priceArray} />
		</div>
	);
};
