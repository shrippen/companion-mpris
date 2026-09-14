import { getPlayerChoices } from './choices.js'

function getActionDefinitions(self) {
	const playerField = {
		type: 'dropdown',
		label: 'Player',
		id: 'player',
		default: 'auto',
		choices: getPlayerChoices(self.mpris),
		allowCustom: true,
	}

	const wrap = (method, label) => ({
		name: label,
		options: [playerField],
		callback: async (action) => {
			try {
				await self.mpris[method](action.options.player)
			} catch (err) {
				self.log('warn', `MPRIS ${label} failed: ${err.message}`)
			}
		},
	})

	return {
		play_pause: wrap('playPause', 'Play/Pause'),
		play: wrap('play', 'Play'),
		pause: wrap('pause', 'Pause'),
		stop: wrap('stop', 'Stop'),
		next: wrap('next', 'Next track'),
		previous: wrap('previous', 'Previous track'),
	}
}

export { getActionDefinitions }
