import { MprisManager, MPRIS_PREFIX } from '../src/mpris.js'
import world from './world.cjs'

/**
 * Internal demo (screenshots only, never in the packaged module): no D-Bus, made-up players
 * that play the score of Studio Weber, the demo world shared by all shrippen projects
 * (demo/world.cjs, generated from shrippen.github.io/demo; do not edit it here). Play, pause, next and previous work on
 * this in-memory state, so buttons, feedbacks and variables behave like with real players.
 */
class FakeMprisManager extends MprisManager {
	constructor(log) {
		super(log)
		const media = world.data.media
		this.tracks = media.tracks
		this.album = media.album
		for (const p of media.players) {
			const busName = MPRIS_PREFIX + p.identity.split(' ')[0].toLowerCase()
			const index = Math.max(0, this.tracks.findIndex((t) => t.title === p.track))
			this.players.set(busName, { busName, identity: p.identity, status: p.status, index, metadata: {} })
		}
		for (const player of this.players.values()) this.setTrack(player, player.index)
	}

	setTrack(player, index) {
		const count = this.tracks.length
		player.index = ((index % count) + count) % count
		const track = this.tracks[player.index]
		player.metadata = {
			'xesam:title': track.title,
			'xesam:artist': [this.album.artist],
			'xesam:album': this.album.title,
			'mpris:length': track.length_s * 1000000,
			'mpris:trackid': `/demo/track/${player.index + 1}`,
		}
	}

	async connect() {
		this.emit('players-changed')
	}

	destroy() {}

	async refreshPlayers() {}

	async callPlayerMethod(requestedBusName, method) {
		const busName = this.resolveBusName(requestedBusName)
		const player = busName && this.players.get(busName)
		if (!player) {
			throw new Error('No MPRIS player found')
		}
		switch (method) {
			case 'PlayPause':
				player.status = player.status === 'Playing' ? 'Paused' : 'Playing'
				break
			case 'Play':
				player.status = 'Playing'
				break
			case 'Pause':
				player.status = 'Paused'
				break
			case 'Stop':
				player.status = 'Stopped'
				break
			case 'Next':
				this.setTrack(player, player.index + 1)
				break
			case 'Previous':
				this.setTrack(player, player.index - 1)
				break
			default:
				throw new Error(`Unsupported MPRIS method: ${method}`)
		}
		this.emit('players-changed')
	}
}

export { FakeMprisManager }
