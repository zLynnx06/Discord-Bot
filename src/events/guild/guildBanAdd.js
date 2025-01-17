// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class guildBanAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guildBan) {
		// Make sure all relevant data is fetched
		try {
			if (guildBan.partial) await guildBan.fetch();
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err) {
			return bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		const { guild, user } = guildBan;

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${user.tag} has been banned in guild: ${guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildBanAdd is for logging
		if (settings.ModLogEvents.includes('GUILDBANADD') && settings.ModLog) {
			const embed = new Embed(bot, guild)
				.setDescription(`User: ${user.toString()}`)
				.setColor(15158332)
				.setAuthor('User banned:', user.displayAvatarURL())
				.setThumbnail(user.displayAvatarURL())
				.addField('Reason:', guildBan.reason ?? 'No reason given')
				.setTimestamp()
				.setFooter(`ID: ${user.id}`);

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
