import { all } from 'redux-saga/effects';
import hello from './hello';
import login from './login';
import connect from './connect';
import rooms from './rooms';
import messages from './messages';
import selectServer from './selectServer';
import createChannel from './createChannel';
import init from './init';
import state from './state';
import activeUsers from './activeUsers';

const root = function* root() {
	yield all([
		init(),
		createChannel(),
		hello(),
		rooms(),
		login(),
		connect(),
		messages(),
		selectServer(),
		state(),
		activeUsers()
	]);
};

export default root;
