import { InstanceBase, InstanceStatus } from '@companion-module/base'
import { MprisManager } from './mpris.js'
import { FakeMprisManager } from './fakeMpris.js'
import { getActionDefinitions } from './actions.js'
import { getFeedbackDefinitions } from './feedbacks.js'
import { getVariableDefinitions, computeVariableValues } from './variables.js'
import { getPresetDefinitions, getPresetStructure } from './presets.js'

class MprisInstance extends InstanceBase {
	async init(config) {
		this.config = config
		// Demo mode (option, or MPRIS_DEMO=1 outside Companion): made-up players, no D-Bus.
		const demo = config?.demo || process.env.MPRIS_DEMO === '1'
		const Manager = demo ? FakeMprisManager : MprisManager
		this.mpris = new Manager((level, msg) => this.log(level, msg))

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
		const demoChanged = !!config?.demo !== !!this.config?.demo
		this.config = config
		if (demoChanged) {
			this.mpris.destroy()
			await this.init(config)
		}
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
			{
				type: 'checkbox',
				id: 'demo',
				width: 12,
				label: 'Demo mode: made-up players instead of D-Bus (to try the module or take screenshots)',
				default: false,
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
