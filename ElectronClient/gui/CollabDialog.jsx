const React = require('react');
const { _ } = require('lib/locale.js');
const { themeStyle } = require('lib/theme');
const { time } = require('lib/time-utils.js');
const DialogButtonRow = require('./DialogButtonRow.min');
const Datetime = require('react-datetime');
const Note = require('lib/models/Note');
const formatcoords = require('formatcoords');
const { bridge } = require('electron').remote.require('./bridge');
const Setting = require('lib/models/Setting');

class CollabDialog extends React.Component {
	constructor() {
		super();

		this.buttonRow_click = this.buttonRow_click.bind(this);
		this.handleChangeServer = this.handleChangeServer.bind(this);
		this.okButton = React.createRef();

		this.state = {
			formNote: null,
			editedKey: null,
			editedValue: null,
			chosenServer: null
		};
	}

	componentDidMount() {
		this.loadNote(this.props.noteIds[0]);	
	}

	componentDidUpdate() {
		if (this.state.editedKey == null) {
			this.okButton.current.focus();
		}
	}

	async loadNote(noteId) {
		if (!noteId) {
			this.setState({ formNote: null });
		} else {
			const note = await Note.load(noteId);
			this.setState({ formNote: note });
		}
	}

	styles(themeId) {
		const styleKey = themeId;
		if (styleKey === this.styleKey_) return this.styles_;

		const theme = themeStyle(themeId);

		this.styles_ = {};
		this.styleKey_ = styleKey;

		this.styles_.button = {
			minWidth: theme.buttonMinWidth,
			minHeight: theme.buttonMinHeight,
			marginLeft: 5,
			color: theme.color,
			backgroundColor: theme.backgroundColor,
			border: '1px solid',
			borderColor: theme.dividerColor,
		};

		this.styles_.input = {
			display: 'inline-block',
			color: theme.color,
			backgroundColor: theme.backgroundColor,
			border: '1px solid',
			borderColor: theme.dividerColor,
		};

		return this.styles_;
	}

	async closeDialog(applyChanges) {
		if (applyChanges) {
			console.log('From inside closeDialog');
			console.log(this.state.formNote);
			await this.saveProperty();
			const note = this.state.formNote;
			note.updated_time = Date.now();
			await Note.save(note, { autoTimestamp: false });
		} else {
			await this.cancelProperty();
		}

		if (this.props.onClose) {
			this.props.onClose();
		}
	}

	buttonRow_click(event) {
		this.closeDialog(event.buttonName === 'ok');
	}

// Nu fungerar det att spara vald server i note.server_id
// TODO: 
// 1. Sqlite-fel, se över db-koden. 
// 2. Värdena ska bara sparas efter att servern bekräftat. Annars alert.
// 3. Servern behöver veta om note ska delas med ny eller befintlig användare. Hur? Antar att jag behöver lista användare bredvid vald server. 
// 4. Behöver alltså även ett sätt att spara user-listor.  

	async saveProperty() {

		return new Promise((resolve) => {
			const newFormNote = Object.assign({}, this.state.formNote);
			newFormNote.is_collab = 1;
			newFormNote.server_id = this.state.chosenServer; 
			this.setState(
				{
					formNote: newFormNote,
				},
				() => {
					resolve();
				}
			);
		});
	}

	async cancelProperty() {
		return new Promise((resolve) => {
			this.okButton.current.focus();
			this.setState({
				editedKey: null,
				editedValue: null,
			}, () => {
				resolve();
			});
		});
	}

	handleChangeServer(event) {
		this.setState({ chosenServer: event.target.value })
	}

	render() {
		const theme = themeStyle(this.props.theme);
		const formNote = this.state.formNote;
		
		const options = [];
		for (var key in Setting.value('collab.servers')) { 
			if (Setting.value('collab.servers').hasOwnProperty(key)) {
				options.push({label: key, value: key});
			}
		}

		return (
			<div style={theme.dialogModalLayer}>
				<div style={theme.dialogBox}>
					<div style={theme.dialogTitle}>{_('Choose server')}</div>
					<select onChange={this.handleChangeServer}>
						{options.map(({label, value}) => (
							<option key={value} value={value}>
								{label}
							</option>
							))}
					</select>
					<DialogButtonRow theme={this.props.theme} okButtonRef={this.okButton} onClick={this.buttonRow_click}/>
				</div>
			</div>
		);
	}
}

module.exports = CollabDialog;
