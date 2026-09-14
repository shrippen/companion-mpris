import dbus from 'dbus-next'
import EventEmitter from 'events'

const MPRIS_PREFIX = 'org.mpris.MediaPlayer2.'
const PLAYER_PATH = '/org/mpris/MediaPlayer2'
const PLAYER_IFACE = 'org.mpris.MediaPlayer2.Player'
const ROOT_IFACE = 'org.mpris.MediaPlayer2'
const PROPS_IFACE = 'org.freedesktop.DBus.Properties'

/**
 * Talks to whatever MPRIS-compatible media players are on the session bus
 * and keeps a lightweight cache of which ones exist and their playback state.
 */
class MprisManager extends EventEmitter {
	constructor(log) {
		super()
		this.log = log || (() => {})
		this.bus = null
		this.players = new Map() // busName -> { busName, identity, status, metadata }
		this.pollTimer = null
	}

	async connect() {
		this.bus = dbus.sessionBus({ busAddress: this.resolveSessionBusAddress() })
		await this.refreshPlayers()
		this.pollTimer = setInterval(() => {
			this.refreshPlayers().catch((err) => this.log('debug', `MPRIS poll error: ${err.message}`))
		}, 2000)
	}

	/**
	 * Companion runs each module in a subprocess that does not inherit the
	 * desktop session's environment, so DBUS_SESSION_BUS_ADDRESS (and DISPLAY,
	 * which dbus-next would otherwise fall back to) are usually missing. The
	 * session bus socket is at a well-known location under XDG_RUNTIME_DIR, so
	 * reconstruct the address from there instead.
	 */
	resolveSessionBusAddress() {
		if (process.env.DBUS_SESSION_BUS_ADDRESS) {
			return process.env.DBUS_SESSION_BUS_ADDRESS
		}
		const runtimeDir = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}`
		return `unix:path=${runtimeDir}/bus`
	}

	destroy() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
		if (this.bus) {
			try {
				this.bus.disconnect()
			} catch (e) {
				// ignore
			}
			this.bus = null
		}
	}

	async refreshPlayers() {
		if (!this.bus) return

		const dbusObj = await this.bus.getProxyObject('org.freedesktop.DBus', '/org/freedesktop/DBus')
		const dbusIface = dbusObj.getInterface('org.freedesktop.DBus')
		const names = await dbusIface.ListNames()
		const busNames = names.filter((n) => n.startsWith(MPRIS_PREFIX))

		const seen = new Set()
		let changed = false

		for (const busName of busNames) {
			seen.add(busName)
			try {
				const info = await this.readPlayerInfo(busName)
				const existing = this.players.get(busName)
				if (!existing || existing.status !== info.status || existing.identity !== info.identity ||
					JSON.stringify(existing.metadata) !== JSON.stringify(info.metadata)) {
					changed = true
				}
				this.players.set(busName, info)
			} catch (err) {
				this.log('debug', `Failed to read MPRIS player ${busName}: ${err.message}`)
			}
		}

		for (const busName of Array.from(this.players.keys())) {
			if (!seen.has(busName)) {
				this.players.delete(busName)
				changed = true
			}
		}

		if (changed) {
			this.emit('players-changed')
		}
	}

	async readPlayerInfo(busName) {
		const obj = await this.bus.getProxyObject(busName, PLAYER_PATH)
		const props = obj.getInterface(PROPS_IFACE)

		let identity = busName.slice(MPRIS_PREFIX.length)
		try {
			const identityVariant = await props.Get(ROOT_IFACE, 'Identity')
			if (identityVariant?.value) identity = identityVariant.value
		} catch (e) {
			// some players omit Identity, fall back to bus name suffix
		}

		let status = 'Stopped'
		try {
			const statusVariant = await props.Get(PLAYER_IFACE, 'PlaybackStatus')
			if (statusVariant?.value) status = statusVariant.value
		} catch (e) {
			// ignore
		}

		let metadata = {}
		try {
			const metaVariant = await props.Get(PLAYER_IFACE, 'Metadata')
			metadata = this.unwrapMetadata(metaVariant?.value)
		} catch (e) {
			// ignore
		}

		return { busName, identity, status, metadata }
	}

	unwrapMetadata(raw) {
		if (!raw) return {}
		const result = {}
		for (const [key, variant] of Object.entries(raw)) {
			let value = variant?.value !== undefined ? variant.value : variant
			if (typeof value === 'bigint') value = Number(value)
			result[key] = value
		}
		return result
	}

	/** List of currently known players, e.g. for building dropdown choices */
	listPlayers() {
		return Array.from(this.players.values())
	}

	/** Resolves a requested busName (or '' / 'auto') to an actual bus name */
	resolveBusName(requested) {
		if (requested && requested !== 'auto' && this.players.has(requested)) {
			return requested
		}
		// auto: prefer a currently playing player, otherwise the first known one
		const all = this.listPlayers()
		const playing = all.find((p) => p.status === 'Playing')
		if (playing) return playing.busName
		if (all.length > 0) return all[0].busName
		return null
	}

	getPlayer(busName) {
		return this.players.get(busName) || null
	}

	async callPlayerMethod(requestedBusName, method) {
		const busName = this.resolveBusName(requestedBusName)
		if (!busName) {
			throw new Error('No MPRIS player found')
		}
		const obj = await this.bus.getProxyObject(busName, PLAYER_PATH)
		const iface = obj.getInterface(PLAYER_IFACE)
		if (typeof iface[method] !== 'function') {
			throw new Error(`Unsupported MPRIS method: ${method}`)
		}
		await iface[method]()
		// Give the player a moment then refresh so feedbacks/variables update quickly
		setTimeout(() => {
			this.refreshPlayers().catch(() => {})
		}, 150)
	}

	playPause(busName) {
		return this.callPlayerMethod(busName, 'PlayPause')
	}
	play(busName) {
		return this.callPlayerMethod(busName, 'Play')
	}
	pause(busName) {
		return this.callPlayerMethod(busName, 'Pause')
	}
	stop(busName) {
		return this.callPlayerMethod(busName, 'Stop')
	}
	next(busName) {
		return this.callPlayerMethod(busName, 'Next')
	}
	previous(busName) {
		return this.callPlayerMethod(busName, 'Previous')
	}
}

export { MprisManager, MPRIS_PREFIX }
