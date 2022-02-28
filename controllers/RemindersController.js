let tips = require('../resources/Tips.json');
let facts = require('../resources/Facts.json');
var mongoose = require('mongoose');
const fs = require("fs")
const path = require("path");

const invokeReminderCommandInitialView =  async ({ command, ack, say, body }) => {
    try {
        // send acknowledgement back to slack over the socketMode websocket connection
        // this is so slack knows you have received the event and are processing it
        await ack();
        const fullPath = path.resolve("resources/ReminderInitialView.json");
        const remInitView = await fs.readFileSync(fullPath);
        await say(JSON.parse(remInitView));
      } catch (error) {
        console.log('An error occurred', error);
      }
};

const getReminderOptions = async ( ack, body, client, logger, say ) => {
        try {
                // send acknowledgement back to slack over the socketMode websocket connection
                // this is so slack knows you have received the event and are processing it
                const fullPath = path.resolve("resources/ReminderOptionsView.json");
                const remOpsView = await fs.readFileSync(fullPath);
                await say(JSON.parse(remOpsView));
        } catch (error) {
                console.log('An error occurred', error);
        }
};

const getHealthReminderOptions = async ( ack, body, client, logger, say ) => {
        try {
                // send acknowledgement back to slack over the socketMode websocket connection
                // this is so slack knows you have received the event and are processing it
                const fullPath = path.resolve("resources/HealthReminders.json");
                const healthRemsView = await fs.readFileSync(fullPath);
                await say(JSON.parse(healthRemsView));

        } catch (error) {
                console.log('An error occurred', error);
        }
};

const setReminders = async ({ack, body, client, logger, say }) => {
    try{
        await ack();
        const remType = body.actions[0].selected_option.value;
        if(remType == 'add-reminder'){
            getReminderOptions(ack, body, client, logger, say);
        }else if(remType == 'health-reminders'){
            getHealthReminderOptions(ack, body, client, logger, say);
        }
    }catch (error) {
        console.log('An error occurred', error);
    }
};

const addHealthReminder = async ({ack, body, client, logger, say }) => {
    const { SocketModeClient } = require('@slack/socket-mode');
    const { WebClient } = require('@slack/web-api');

    const appToken = process.env.APP_TOKEN;
    const socketModeClient = new SocketModeClient({ appToken });
    const userToken = process.env.USER_OAUTH_TOKEN;

    const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    try {
        await ack();
        const message = body.state.values['health-reminder-radio-options']['radio_buttons-action']['selected_option'].value;
        const time = body.state.values['health-reminder-time-dropDown']['reminder-health-time']['selected_option'].value;
        await webClient.reminders.add({
                                token:userToken,
                                text:message,
                                time:time
        });
        const fullPath = path.resolve("resources/ReminderCreatedView.json");
        const remCreatedView = await fs.readFileSync(fullPath);
        await say(JSON.parse(remCreatedView));
    }catch (error) {
        console.log('An error occurred', error);
    }
};

const addReminder = async ({ack, body, client, logger, say }) => {
    const { SocketModeClient } = require('@slack/socket-mode');
    const { WebClient } = require('@slack/web-api');

    const appToken = process.env.APP_TOKEN;
    const socketModeClient = new SocketModeClient({ appToken });
    const userToken = process.env.USER_OAUTH_TOKEN;

    const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    try {
        await ack();
        const time = body.state.values['reminder-time']['timepicker-action']['selected_time'];
        const freq = body.state.values['reminder-freq']['static_select-action']['selected_option'].value;
        const message = body.state.values['reminder-message']['plain_text_input-action'].value;
        if(freq == 'once'){
            await webClient.reminders.add({
                        token:userToken,
                        text:message,
                        time:time
            });
        }else{
            await webClient.reminders.add({
                        token:userToken,
                        text:message,
                        time:time,
                        frequency:freq
            });
        }

        const fullPath = path.resolve("resources/ReminderCreatedView.json");
        const remCreatedView = await fs.readFileSync(fullPath);
        await say(JSON.parse(remCreatedView));
    }catch (error) {
        console.log('An error occurred', error);
    }
};

//export controller functions
module.exports = {
    getReminderOptions,
    invokeReminderCommandInitialView,
    setReminders,
    addReminder,
    addHealthReminder
};