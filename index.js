const uniq = require('lodash.uniq')
const diff = require('lodash.difference')

module.exports = {
  load (bot, commands, onEvent, serverId, pluginConfig, serverConfig, hermes) {
    function listPlugins (msg) {
      serverConfig.get('enabledPlugins').then(enabledPlugins => {
        const defaultAutoloadPlugins = hermes.getDefaultAutoloadPlugins()
        const autoloadedPlugins = uniq(enabledPlugins.concat(defaultAutoloadPlugins))

        const loadedPlugins = Array.from(hermes.getLoadedServerPlugins(serverId).keys())

        const availablePlugins = Array.from(hermes.getAvailablePlugins().keys())
        const availablePluginsDiff = diff(availablePlugins, loadedPlugins)

        let response = `Loaded plugins: ${loadedPlugins.join(', ')}`
        response += `\nAuto-loaded plugins: ${autoloadedPlugins.join(', ')}`
        response += `\nAvailable plugins: ${availablePluginsDiff.length > 0 ? availablePluginsDiff.join(', ') : '<all plugins loaded>'}`

        msg.channel.createMessage(response)
      })
    }

    function enablePlugin (msg, pluginName) {
      hermes.loadServerPlugin(serverId, pluginName)
        .then(() => {
          serverConfig.get('enabledPlugins').then(enabledPlugins => {
            enabledPlugins.push(pluginName)
            enabledPlugins = uniq(enabledPlugins)

            serverConfig.set('enabledPlugins', enabledPlugins)
          })

          msg.channel.createMessage(`Plugin '${pluginName}' enabled!`)
        })
        .catch(err => {
          msg.channel.createMessage(`Error enabling plugin '${pluginName}': ${err.message}`)
        })
    }

    function disablePlugin (msg, pluginName) {
      hermes.unloadServerPlugin(serverId, pluginName)
        .then(() => {
          msg.channel.createMessage(`Plugin '${pluginName}' disabled!`)
        })
        .catch(err => {
          msg.channel.createMessage(`Error disabling plugin '${pluginName}': ${err.message}`)
        })
    }

    commands.addAdminCommand('plugins', (msg, args) => {
      if (args.length === 0) {
        listPlugins(msg)
      } else if (args.length === 2 && args[0] === 'enable') {
        enablePlugin(msg, args[1])
      } else if (args.length === 2 && args[0] === 'disable') {
        disablePlugin(msg, args[1])
      } else {
        msg.channel.createMessage('Invalid arguments!')
      }
    })
  }
}
