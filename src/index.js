import { InstanceBase, InstanceStatus } from '@companion-module/base'
import { MprisManager } from './mpris.js'
import { getActionDefinitions } from './actions.js'
import { getFeedbackDefinitions } from './feedbacks.js'
import { getVariableDefinitions, computeVariableValues } from './variables.js'
import { getPresetDefinitions, getPresetStructure } from './presets.js'

class MprisInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.mpris = new MprisManager((level, msg) => this.log(level, msg))

		this.mpris.on('players-changed', () => {
			// Player list / status changed: rebuild dropdown choices and refresh state
			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableValues()
			this.checkFeedbacks('playback_status')
		})

		this.updateActions()
		this.updateFeedbacks()
		this.setVariableDefinitions(getVariableDefinitions())
		this.updateVariableValues()
		this.setPresetDefinitions(getPresetStructure(), getPresetDefinitions())

		try {
			await this.mpris.connect()
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.log('error', `Failed to connect to D-Bus session bus: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		}
	}

	async configUpdated(config) {
		this.config = config
	}

	async destroy() {
		if (this.mpris) {
			this.mpris.destroy()
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					'This module controls MPRIS-compatible media players (Spotify, VLC, Firefox, Chrome, rhythmbox, etc.) on this Linux machine via D-Bus. No further configuration is needed - just add actions to your buttons and pick a player (or leave it on "Auto").',
			},
		]
	}

	updateActions() {
		this.setActionDefinitions(getActionDefinitions(this))
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbackDefinitions(this))
	}

	updateVariableValues() {
		this.setVariableValues(computeVariableValues(this.mpris))
	}
}

const UpgradeScripts = []

export default MprisInstance
export { UpgradeScripts }
