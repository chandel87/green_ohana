let tips = require('../resources/Tips.json');
let facts = require('../resources/Facts.json');
var mongoose = require('mongoose');

var WellBeing = require('../models/WellbeingModel.js');



const invoke = async ({command, ack, say, options}) => {
    if (!options)
        getOneTip(ack, say);
        // getAllWellbeings(ack, say);
};


//GET All Tips
const getAllTips = async (ack, say) => {
    console.log('In wellbeing controller');
    await ack();
    say('Tip1, Tip2');
    //res.json({message: ['Tip1', 'Tip2']});
};

//GET one Tip
const getOneTip = async (ack, say) =>  {
    try {
        await ack();
        let randomIndex = Math.floor(Math.random() * tips.length)
        say('Your ' + tips[randomIndex].type + ' tip of the day: ' + tips[randomIndex].message);
    } catch (error) {
        console.log("err");
    }
};


const shortcutOne = async ({ shortcut, ack, client, logger }) => {
    console.log('In shorcut one fnction!');
    try { 
        // Acknowledge shortcut request
        await ack();
        client.chat.postMessage({
            channel: process.env.CHANNEL || 'hackathon-greenohana',
            text: 'Will open this shortcut tomorrow!'
        });
    }  catch (error) {
        console.log("err")
        console.error(error);
    }
}

const dataFromView = async ({  ack, body, view, client, logger }) => 
{
    console.log('In dataFromView fnction!');

    const results = 
    {
        name: body.user.username,
        indicator: view.state.values.block_0.actionId_0.selected_option.text.text,
        description : 'description'
    };

    // await ack();
    // say(results);

    WellBeing.create(results, function (err, post) 
    {
        if (err) return next(err);
    });
}

//GET one Tip
const getOneCarbonFootprint = async ({ack, say}) =>  
{
    try 
    {
        WellBeing.findById('6219b1c5eaab270eb179adb3', function (err, cfp) {
            if (err) {
                // return next(err);
                console.log(err);
            }
            //res.json(products);
            console.log(cfp);
            say(cfp.name);
            ack();
        });
    } 
    catch (error) 
    {
        console.error(error);
    }
};


//GET AllCarbonFootprint
const getAllCarbonFootprint = async ({ack, say}) =>  
{
    names = '';
    try 
    { 
        WellBeing.find(function (err, cfps) {
            if (err) {
                // return next(err);
                console.log(err);
            }
            console.log(cfps);
            
            for(cfp in cfps)
            {
                names += cfps[cfp].name+', ';
            }
            say(names);
            ack();
        });
    } 
    catch (error) 
    {
        console.error(error);
    }
};


const returnMessage = async (ack, say, type) =>  {
    try {
        await ack();
        let objs = type == 'health' ? tips : facts;
        let randomIndex = Math.floor(Math.random() * objs.length);
        say((type == 'health' ? 'Health tip' : 'Fact') + ' of the day: ' + objs[randomIndex].message);
    } catch (error) {
        console.log("err");
    }
};

const getHealthTip = async ({command, ack, say, options}) => {
    returnMessage(ack, say, 'health');
};

const getFact = async ({command, ack, say, options}) => {
    returnMessage(ack, say, 'fact');
};

const welcomeFact = async ({ event, client, body, logger }) => {
    console.log('welcomeFact!');
    let randomIndex = Math.floor(Math.random() * facts.length);
    let user, channel;
    if (event)
    {
        user = '<@' + event.user +'>';
        channel = event.user;
    } else if (body && body.user) {
        user = '<@' + body.user.username +'>';
        channel = body.user.id;
    } else {
        user = 'There';
        channel = process.env.CHANNEL || 'hackathon-greenohana';
    }
    client.chat.postMessage({
        channel: channel,
        text: 'Hello ' + user +', Here is a :circle-green: fact for you: ' + facts[randomIndex].message
    });
};

//export controller functions
module.exports = {
    // getAllTips,
    // getOneTip,
    invoke,
    dataFromView,
    getOneCarbonFootprint,
    getAllCarbonFootprint,
    //message,
    shortcutOne,
    getHealthTip,
    getFact,
    welcomeFact
};
