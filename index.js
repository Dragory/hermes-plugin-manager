const uniq = require('lodash.uniq')

module.exports = {
  load (bot, commands, onEvent, pluginConfig, serverConfig, serverId, pluginManager) {
    function listPlugins (msg) {
      serverConfig.get('enabledPlugins').then(enabledPlugins => {
        const loadedPlugins = Array.from(pluginManager.getLoadedServerPlugins(serverId).keys())
        let response = `Enabled plugins: ${enabledPlugins.join(', ')}`
        response += `\nLoaded plugins: ${loadedPlugins.join(', ')}`

        msg.channel.createMessage(response)
      })
    }

    function enablePlugin (msg, pluginName) {
      pluginManager.loadServerPlugin(serverId, pluginName)
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
      pluginManager.unloadServerPlugin(serverId, pluginName)
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
