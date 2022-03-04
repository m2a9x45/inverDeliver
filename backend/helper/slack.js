const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const client = new WebClient(process.env.SLACK_BOT_SUPPORT_TOKEN);

async function sendCallbackRequestNotification(email, phoneNumber, issue) {
  try {
    await client.chat.postMessage({
      token: process.env.SLACK_BOT_SUPPORT_TOKEN,
      channel: 'C026G6E9FUN',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Callback Request ☎',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Email Address: ${email}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Phone Number: <tel:${phoneNumber}|${phoneNumber}>`,
          },
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: "Customer's Problem",
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: issue,
          },
        },
        {
          type: 'divider',
        },
      ],
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

module.exports = {
  sendCallbackRequestNotification,
};
