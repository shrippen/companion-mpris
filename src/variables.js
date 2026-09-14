function getVariableDefinitions() {
	return {
		player_name: { name: 'Active player name' },
		playback_status: { name: 'Playback status' },
		track_title: { name: 'Track title' },
		track_artist: { name: 'Track artist' },
		track_album: { name: 'Track album' },
	}
}

/** Computes the variable values from the current "auto"-resolved player */
function computeVariableValues(mpris) {
	const busName = mpris.resolveBusName('auto')
	const player = busName ? mpris.getPlayer(busName) : null

	if (!player) {
		return {
			player_name: '',
			playback_status: 'Stopped',
			track_title: '',
			track_artist: '',
			track_album: '',
		}
	}

	const artist = Array.isArray(player.metadata['xesam:artist'])
		? player.metadata['xesam:artist'].join(', ')
		: player.metadata['xesam:artist'] || ''

	return {
		player_name: player.identity,
		playback_status: player.status,
		track_title: player.metadata['xesam:title'] || '',
		track_artist: artist,
		track_album: player.metadata['xesam:album'] || '',
	}
}

export { getVariableDefinitions, computeVariableValues }
