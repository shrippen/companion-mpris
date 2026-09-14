import { combineRgb } from '@companion-module/base'
import { getPlayerChoices } from './choices.js'

function getFeedbackDefinitions(self) {
	const playerField = {
		type: 'dropdown',
		label: 'Player',
		id: 'player',
		default: 'auto',
		choices: getPlayerChoices(self.mpris),
		allowCustom: true,
	}

	return {
		playback_status: {
			type: 'boolean',
			name: 'Playback status',
			description: 'Change button style based on whether the player is playing/paused/stopped',
			defaultStyle: {
				bgcolor: combineRgb(0, 200, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				playerField,
				{
					type: 'dropdown',
					label: 'When status is',
					id: 'status',
					default: 'Playing',
					choices: [
						{ id: 'Playing', label: 'Playing' },
						{ id: 'Paused', label: 'Paused' },
						{ id: 'Stopped', label: 'Stopped' },
					],
				},
			],
			callback: (feedback) => {
				const busName = self.mpris.resolveBusName(feedback.options.player)
				const player = busName ? self.mpris.getPlayer(busName) : null
				const status = player ? player.status : 'Stopped'
				return status === feedback.options.status
			},
		},
	}
}

export { getFeedbackDefinitions }
