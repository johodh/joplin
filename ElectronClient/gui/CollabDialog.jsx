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
		this.okButton = React.createRef();
		this.serverList = this.serverList.bind(this);

		this.state = {
			formNote: null,
			editedKey: null,
			editedValue: null,
		};

		this.keyToLabel_ = {
			id: _('ID'),
			is_collab: _('is_collab'),
		};
	}

	componentDidMount() {
		this.loadNote(this.props.noteIds[0]);
		console.log('hello from CollabDialog.jsx')
		console.log(this.state)
		console.log(this.props)
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
			console.log('From inside loadNote')
			console.log(note);
			this.setState({ formNote: note });
		}
	}

	serverList() {
		console.log('serverlist');
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
			console.log('From inside closeDialog')
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

	async saveProperty() {
		
		return new Promise((resolve) => {
			const newFormNote = Object.assign({}, this.state.formNote);
			newFormNote.is_collab = 1; 
			console.log('From Inside saveProperty')
			console.log(this.state.formNote);
			console.log(newFormNote);

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

	formatLabel(key) {
		if (this.keyToLabel_[key]) return this.keyToLabel_[key];
		return key;
	}

	render() {
		const theme = themeStyle(this.props.theme);
		const formNote = this.state.formNote;


		return (
			<div style={theme.dialogModalLayer}>
				<div style={theme.dialogBox}>
					<div style={theme.dialogTitle}>{_('Choose server')}</div>
					<select value="test">
						<option value="test" key="test">server1</option>
						<option value="test2" key="test2">server2</option>
					</select>
					<DialogButtonRow theme={this.props.theme} okButtonRef={this.okButton} onClick={this.buttonRow_click}/>
				</div>
			</div>
		);
	}
}

module.exports = CollabDialog;
