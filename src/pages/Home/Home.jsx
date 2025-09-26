import React from 'react';
import { Spinner } from '@/components/Loader/Spinner';
import Content from '@/components/Page/Content';
import Header from '@/components/Page/Header';
import Sidebar from '@/components/Page/Sidebar';
import Footer from '@/components/Page/Footer';
import Container from '@/components/Page/Container';
import useGlobalStore from '@/store/global.store';
import ParticleText from '@/components/Effects/ParticleText';
import {
    ParticlesBackground, 
    BeamsBackground,
} from '@/components/Effects/BackgroundEffects';
import Effects from '@/components/Effects/Effects';
import HomeContainer from '@/pages/Home/HomeContainer';

const Home = (props) => {
	const { children } = props;

	const {
		// Debug state
		debug,
		setDebug,

		// Fetch requests state
		requestFetchData,
		setRequestFetchData,
		requestFetchUser,
		setRequestFetchUser,

		// Data state
		data,
		setData,
		user,
		setUser,
		userLoggedIn,
		setUserLoggedIn,
		userToken,
		setUserToken,
		settingsDialogOpen,
		setSettingsDialogOpen,

		activeWorkspace,
		setActiveWorkspace,
		workspaceId,
		setWorkspaceId,
	} = useGlobalStore();

	const nav = {};

	return (
		<HomeContainer
			className={`page-containers absolute inset-0 !h-screen !max-h-screen !min-h-screen !w-screen !max-w-screen !min-w-screen !justify-stretch !items-stretch !bg-sextary-800 flex flex-col`}>
			<div
				className={` !min-h-full !h-full !max-h-full !min-w-full !w-full !max-w-full`}>
				{/* <ParticleText text={ 'Akasha Mindspace' } tagline={ `For the moonlighting daydreamers` } useBackground={ false } /> */}
				<BeamsBackground
					text={'Akasha Mindspace'}
					tagline={`For the moonlighting daydreamers`}
					useBackground={false}
				/>
			</div>
			<Footer></Footer>
		</HomeContainer>
	);
};

export default Home;
