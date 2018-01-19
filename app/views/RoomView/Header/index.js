import React from 'react';
import { Text, View, Platform, TouchableOpacity, WebView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { HeaderBackButton } from 'react-navigation';
import Modal from 'react-native-modal';

import realm from '../../../lib/realm';
import Avatar from '../../../containers/Avatar';
import { STATUS_COLORS } from '../../../constants/colors';
import styles from './styles';
import { closeRoom } from '../../../actions/room';

@connect(state => ({
	user: state.login.user,
	baseUrl: state.settings.Site_Url || state.server ? state.server.server : '',
	activeUsers: state.activeUsers
}), dispatch => ({
	close: () => dispatch(closeRoom())
}))
export default class extends React.PureComponent {
	static propTypes = {
		close: PropTypes.func.isRequired,
		navigation: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		baseUrl: PropTypes.string,
		activeUsers: PropTypes.object
	}

	constructor(props) {
		super(props);
		this.state = {
			room: {},
			roomName: props.navigation.state.params.name,
			isModalVisible: false
		};
		this.rid = props.navigation.state.params.room.rid;
		this.room = realm.objects('subscriptions').filtered('rid = $0', this.rid);
		this.room.addListener(this.updateState);
	}

	componentDidMount() {
		this.updateState();
	}
	componentWillUnmount() {
		this.room.removeAllListeners();
	}

	getUserStatus() {
		const userId = this.rid.replace(this.props.user.id, '').trim();
		return this.props.activeUsers[userId] || 'offline';
	}

	getUserStatusLabel() {
		const status = this.getUserStatus();
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	updateState = () => {
		this.setState({ room: this.room[0] });
	};

	isDirect = () => this.state.room && this.state.room.t === 'd';

	toggleModal() {
		this.setState({ isModalVisible: !this.state.isModalVisible });
	}

	joinMconf = async() => {
		const result = await fetch('https://live11-kms.dev.mconf.com/bigbluebutton/api/create?allowStartStopRecording=true&attendeePW=ap&autoStartRecording=false&meetingID=random-1014327&moderatorPW=mp&name=random-1014327&record=false&voiceBridge=74831&welcome=%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21&checksum=f9dd2290ebec40ff40c66efcccb43e282814e17f')
		// const join = await fetch('https://live11-kms.dev.mconf.com/bigbluebutton/api/join?fullName=User+889230&meetingID=random-1014327&password=mp&redirect=true&checksum=7aafe8f21961b85fe296923a855ad0223cf7ac2f');
		this.toggleModal();
	}

	renderLeft = () => (<HeaderBackButton
		onPress={() => {
			this.props.close();
			this.props.navigation.goBack(null);
		}}
		tintColor='#292E35'
		title='Back'
		titleStyle={{ display: 'none' }}
	/>);

	renderTitle() {
		if (!this.state.roomName) {
			return null;
		}

		let accessibilityLabel = this.state.roomName;

		if (this.isDirect()) {
			accessibilityLabel += `, ${ this.getUserStatusLabel() }`;
		}

		return (
			<TouchableOpacity style={styles.titleContainer} accessibilityLabel={accessibilityLabel} accessibilityTraits='header'>
				{this.isDirect() ?
					<View style={[styles.status, { backgroundColor: STATUS_COLORS[this.getUserStatus()] }]} />
					: null
				}
				<Avatar
					text={this.state.roomName}
					size={24}
					style={{ marginRight: 5 }}
					baseUrl={this.props.baseUrl}
					type={this.state.room.t}
				/>
				<View style={{ flexDirection: 'column' }}>
					<Text style={styles.title} allowFontScaling={false}>{this.state.roomName}</Text>
					{this.isDirect() ?
						<Text style={styles.userStatus} allowFontScaling={false}>{this.getUserStatusLabel()}</Text>
						: null
					}
				</View>
			</TouchableOpacity>
		);
	}

	renderRight = () => (
		<View style={styles.right}>
			<TouchableOpacity
				style={styles.headerButton}
				onPress={() => this.joinMconf()}
				accessibilityLabel='Room actions'
				accessibilityTraits='button'
			>
				<Icon
					name={Platform.OS === 'ios' ? 'ios-more' : 'md-more'}
					color='#292E35'
					size={24}
					backgroundColor='transparent'
				/>
			</TouchableOpacity>
		</View>
	);

	render() {
		return (
			[
				<View style={styles.header}>
					{this.renderLeft()}
					{this.renderTitle()}
					{this.renderRight()}
				</View>,
				<Modal
					isVisible={this.state.isModalVisible}
					supportedOrientations={['portrait', 'landscape']}
					style={{ alignItems: 'center' }}
					onBackdropPress={() => this.hideModal()}
				>
					<WebView
						source={{ uri: 'https://live11-kms.dev.mconf.com/bigbluebutton/api/join?clientURL=https://live11-kms.dev.mconf.com/html5client/join&fullName=Guilherme+Gazzo&meetingID=random-6822671&password=ap&redirect=true&checksum=f7d0be999fb9be7b2a7352d12904334ca82c849d' }}
						style={{ width: '100%', height: '100%' }}
					/>
				</Modal>
			]
		);
	}
}
