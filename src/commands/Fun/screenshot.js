// Dependencies
const Puppeteer = require('puppeteer'),
	{ MessageAttachment } = require('discord.js'),
	validUrl = require('valid-url'),
	Command = require('../../structures/Command.js');

module.exports = class Screenshot extends Command {
	constructor(bot) {
		super(bot, {
			name: 'screenshot',
			dirname: __dirname,
			aliases: ['ss'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Get a screenshot of a website.',
			usage: 'screenshot <url>',
			cooldown: 5000,
			examples: ['screenshot https://www.google.com/'],
			slash: true,
			options: [{
				name: 'url',
				description: 'url of website to screenshot.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// make sure a website was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/screenshot:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// make sure URl is valid
		if (!validUrl.isUri(message.args[0])) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:INVALID_URL').then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(message.args[0]).host) && !message.channel.nsfw && message.guild) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:BLACKLIST_WEBSITE').then(m => m.timedDelete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// make screenshot
		const data = await this.fetchScreenshot(bot, message.args[0]);
		if (!data) {
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }).then(m => m.timedDelete({ timeout: 5000 }));
		} else {
			const attachment = new MessageAttachment(data, 'website.png');
			await message.channel.send({ files: [attachment] });
		}
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelID),
			url = args.get('url').value;

		// make sure URl is valid
		if (!validUrl.isUri(url)) {
			return bot.send(interaction, { embeds: [channel.error('fun/screenshot:INVALID_URL', {}, true)], ephermal: true });
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(url).host) && !channel.nsfw) {
			return bot.send(interaction, { embeds: [channel.error('fun/screenshot:BLACKLIST_WEBSITE', {}, true)], ephermal: true });
		}

		// display phrases' definition
		await interaction.defer();
		const data = await this.fetchScreenshot(bot, url);
		if (!data) {
			interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }, true)] });
		} else {
			const attachment = new MessageAttachment(data, 'website.png');
			interaction.editReply({ files: [attachment] });
		}
	}

	// create screenshot of website
	async fetchScreenshot(bot, URL) {
		// try and create screenshot
		let data;
		try {
			const browser = await Puppeteer.launch();
			const page = await browser.newPage();
			await page.setViewport({
				width: 1280,
				height: 720,
			});
			await page.goto(URL);
			await bot.delay(1500);
			data = await page.screenshot();
			await browser.close();
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}
		return data;
	}
};
