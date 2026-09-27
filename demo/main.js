// Internal demo entry (screenshots only, never packaged): the module with made-up players
// instead of D-Bus. Point a Companion dev module at this file instead of ../main.js, or run
// it outside Companion. It swaps the MPRIS manager's behaviour before the module starts.
import './patch.js'

await import('../main.js')
