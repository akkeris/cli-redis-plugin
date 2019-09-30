'use strict'
const assert = require('assert');

async function get_addon(appkit, args) {
  let addons = (await appkit.api.get(`/apps/${args.app}/addons`)).filter((x) => x.addon_service.name === "akkeris-redis" || (args.ADDON && x.id === args.ADDON) || (args.ADDON && x.name == args.ADDON))
  if(addons.length === 0 && args.ADDON) {
    throw new Error(`The specified addon ${args.ADDON} could not be found.`)
  } else if (addons.length > 1 && args.ADDON) {
    throw new Error(`The specified addon ${args.ADDON} returned more than one record, this should not happen.`)
  } else if (addons.length > 1 && !args.ADDON) {
    throw new Error(`There are more than one redis addons, please specify an ADDON id.`)
  } else if(addons.length === 0 && !args.ADDON) {
    throw new Error(`No redis addons were found on ${args.app}`)
  }
  assert.ok(addons.length === 1, 'The specified addon could not be found. (' + addons.length + ')')
  return addons[0]
}

async function print_stats(appkit, args) {
  try {
    assert.ok(args.app, 'No app was specified.');
    let addon = await get_addon(appkit, args)
    appkit.api.post(null, '/apps/' + args.app + '/addons/' + addon.id + '/actions/stats', (err, data) => appkit.terminal.print(err, data.stats));
  } catch (e) {
    appkit.terminal.error(e);
  }
}

async function create_backups(appkit, args) {
  try {
    assert.ok(args.app, 'No app was specified.');
    let addon = await get_addon(appkit, args);
    appkit.api.post(null, `/apps/${args.app}/addons/${addon.id}/actions/backups`, appkit.terminal.print);
  } catch (e) {
    appkit.terminal.error(e);
  }
}

async function get_backups(appkit, args) {
  try {
    assert.ok(args.app, 'No app was specified.');
    let addon = await get_addon(appkit, args)
    appkit.api.get(`/apps/${args.app}/addons/${addon.id}/actions/backups`, appkit.terminal.print);
  } catch (e) {
    appkit.terminal.error(e);
  }
}

async function get_backup(appkit, args) {
  try {
    assert.ok(args.app, 'No app was specified.');
    assert.ok(args.BACKUP_ID, 'No backup id was specified.');
    let addon = await get_addon(appkit, args);
    appkit.api.get(`/apps/${args.app}/addons/${addon.id}/actions/backups/${args.BACKUP_ID}`, appkit.terminal.print);
  } catch (e) {
    appkit.terminal.error(e);
  }
}

async function restore_backups(appkit, args) {
  try {
    assert.ok(args.app, 'No app was specified.');
    assert.ok(args.BACKUP_ID, 'No backup id was specified.');
    let addon = await get_addon(appkit, args);
    let run = async (input) => {
      if(input !== args.app) {
        return appkit.terminal.soft_error(`Confirmation did not match !!${args.app}!!. Aborted.`);
      }
      appkit.api.put(null, `/apps/${args.app}/addons/${addon.id}/actions/backups/${args.BACKUP_ID}`, appkit.terminal.print);
    }
    if(args.confirm) {
      await run(input);
    } else {
      appkit.terminal.confirm(` ~~▸~~    !!DANGER ZONE!!: This will restore the backup ^^${args.BACKUP_ID}^^ for ##${addon.name}## on **⬢ ${args.app}**.\n ~~▸~~    Before continuing understand the application will be down during the restore.\n ~~▸~~    To proceed, type !!${args.app}!! or re-run this command with !!--confirm ${args.app}!!\n`, run);
    }
  } catch (e) {
    appkit.terminal.error(e);
  }
}

module.exports = {
	init:function(appkit){
    let apps_options = {
      'app':{
        'alias':'a',
        'demand':true,
        'string':true,
        'description':'The app redis is installed on on.'
      }
    };
    let apps_and_confirm_options = {
      'app':{
        'alias':'a',
        'demand':true,
        'string':true,
        'description':'The app redis is installed on on.'
      },
      'confirm':{
        'alias':'c',
        'demand':false,
        'string':true,
        'description':'Provide confirmation for restoring a backup.'
      }
    };
    appkit.args.command('redis [ADDON]','print out stats from the specified redis', apps_options, print_stats.bind(null, appkit));
    appkit.args.command('redis:stats [ADDON]',false, apps_options, print_stats.bind(null, appkit));
    appkit.args.command('redis:backups [ADDON]','list all backups for a redis', apps_options, get_backups.bind(null, appkit));
    appkit.args.command('redis:backups:create [ADDON]','create a new backup for a redis', apps_options, create_backups.bind(null, appkit));
    appkit.args.command('redis:backups:info BACKUP_ID [ADDON]','get information on a redis backup', apps_options, get_backup.bind(null, appkit));
    appkit.args.command('redis:backups:restore BACKUP_ID [ADDON]','retore a specified backup', apps_and_confirm_options, restore_backups.bind(null, appkit));
	},
	update:function(){},
	group:'memcached',
	help:'flush cache and get stats from memcached.',
	primary:true
};
