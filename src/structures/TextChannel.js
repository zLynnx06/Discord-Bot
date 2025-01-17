// Dependecies
const { MessageEmbed } = require('discord.js'),
	{ Structures } = require('discord.js');

module.exports = Structures.extend('TextChannel', Channel => {
	class CustomChannel extends Channel {
		// This will send the translated message
		async send(...args) {
			// check permissions
			if (!this.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;
			if (!this.permissionsFor(this.client.user).has('EMBED_LINKS')) {
				return super.send(this.client.translate('misc:MISSING_PERMISSION', { PERMISSIONS: this.client.translate('permissions:EMBED_LINKS', {}, this.guild.settings.Language) }, this.guild.settings.Language));
			}

			// send message
			try {
				return await super.send(...args);
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the error emoji as the prefix and then translate the message
		error(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['cross'] : ':negative_squared_cross_mark:';
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				if (returnValue) {
					return embed;
				} else {
					return this.send({ embeds: [embed] });
				}
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the success emoji as the prefix and then translate the message
		success(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['checkmark'] : ':white_check_mark:';
				const embed = new MessageEmbed()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				if (returnValue) {
					return embed;
				} else {
					return this.send({ embeds: [embed] });
				}
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}
	}
	return CustomChannel;
});
