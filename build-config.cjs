// Keep dbus-next as a real installed dependency instead of bundling it: it
// require()s the optional "x11" package (only used as a fallback to find the
// session bus via DISPLAY, a path we never hit since we always pass an
// explicit busAddress), which esbuild cannot resolve at bundle time.
module.exports = {
	externals: ['dbus-next'],
}
