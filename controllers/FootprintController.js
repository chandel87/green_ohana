let travelPage = require('../resources/TravelPage.json');
let homePage = require('../resources/HomePage.json');
let foodPage = require('../resources/FoodPage.json');

var mongoose = require('mongoose');
var carbonFootprint = require('../models/CarbonFootprintModel.js');

//default data
var travelData = 'None';
var waterBill = 0;
var electricityBill = 0;
var distanceTravelled = 0;
var worklocation = 'remote';
var totalCO2 = 0;
var nonVegCalorie = 0;
var bakedCalorie = 0;
var dairyProductCalorie = 0;
var fruitsCalorie = 0;


const invoke = async ({command, ack, body, client, logger}) => {
        getTravelSurveyDetails(ack, body, client, logger);
};

const getTravelSurveyDetails = async (ack, body, client, logger) => {
    try {
        await ack();
      // Call views.open with the built-in client
      const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view:travelPage})
    }catch (error) {
        console.log('Error on Travel data '+error);
    }

}


const homeView = async ({ack, body, client, context}) => {

    await ack();

    travelData = body.view.state.values.block_0.actionId_0.selected_option.value;
    worklocation = body.view.state.values.block_3.actionId_3.selected_option.value;
    distanceTravelled = body.view.state.values.block_4.actionId_4.value;
    try {
        const result = await client.views.update({
          token: context.botToken,
          view_id: body.view.id,
          trigger_id: body.trigger_id,
          view: homePage})
        }catch (error) {
            console.log('Error on Home data '+error);
        }
}

const buttonElectricity = async ({ack, body, client, context}) => {

    await ack();

    //get records for water survey
    electricityBill = body.view.state.values.block_1.actionId_1.value;
    waterBill = body.view.state.values.block_2.actionId_2.value;
    // await new Promise(r => setTimeout(r, 4000));
    try {
      const result = await client.views.update({
        token: context.botToken,
        view_id: body.view.id,
        trigger_id: body.trigger_id,
        // View payload with updated blocks
        view: foodPage
        })
    }catch (error) {
        console.log('Error on Food data '+error);
    }
}
const submitSurvey = async ({ack, body, view, client}) => {
    await ack();
    // //get records for food survey
    nonVegCalorie = view.state.values.block_6.actionId_6.value;
    bakedCalorie = view.state.values.block_7.actionId_7.value;
    dairyProductCalorie = view.state.values.block_8.actionId_8.value;
    fruitsCalorie = view.state.values.block_9.actionId_9.value;
    const user = body.user.id;
    try
    {
        // await new Promise(r => setTimeout(r, 4000));
        const res = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            "type": "modal",
            "title": {
              "type": "plain_text",
              "text": "Your Carbon Footprint "
            },
            "close": {
              "type": "plain_text",
              "text": "Cancel"
            },
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "plain_text",
                  "text": ":loading: Calculating..."
                }
              }
            ]
          } });
        const viewId =  res.view.id;

        //calculate carbon foot print value
        computeCarbonFootPrint(user, travelData,waterBill,electricityBill,distanceTravelled,worklocation,nonVegCalorie, bakedCalorie, dairyProductCalorie, fruitsCalorie);
        console.log('update final result');
        await client.views.update({
          view_id: viewId,
          view: {
                    "type": "modal",
                    "title": {
                    "type": "plain_text",
                    "text": "Your Carbon Footprint"
                    },
                    "blocks": [
                            {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text":  totalCO2.toFixed(3) + " tons CO2/Month "
                            },
                            "accessory": {
                                "type": "image",
                                "image_url": "https://www.conserve-energy-future.com/wp-content/uploads/2013/01/CO2-carbon-footprint-banner.jpg",
                                "alt_text": "carbon_foot print"
                            }
                        }
                    ]    
                }
        })  
    }
    catch(error)
    {
        console.log('Error on Result & Load data '+error);
    }
}
async function computeCarbonFootPrint(user, travelData,waterBill,electricityBill,distanceTravelled,worklocation,nonVegCalorie, bakedCalorie, dairyProductCalorie, fruitsCalorie)
{
    console.log('In computeCarbonFootPrint fnction!');
    //initializing map for vehicle avg foot print per Km
    const modeofTransportToAvgFootPrint = new Map();
    modeofTransportToAvgFootPrint.set('Two-Wheeler',10);
    modeofTransportToAvgFootPrint.set('Four-Wheeler"',8);
    modeofTransportToAvgFootPrint.set('Train',5);
    modeofTransportToAvgFootPrint.set('Bus',3);
    modeofTransportToAvgFootPrint.set('None',0);



    //travel monthly
    var travelTotalCO2 = modeofTransportToAvgFootPrint.get(travelData) * distanceTravelled * 30;

    //home
    var electrictyTotalCO2 = electricityBill * 105;
    var waterTotalCO2 = waterBill * 80;
    var totalhomeCO2 = ( waterTotalCO2 + electrictyTotalCO2)/2;

    //food monthly calorie
    var nonVegTotalCO2 = nonVegCalorie * 5 * 30;
    var bakedTotalCO2 = bakedCalorie * 2 * 30;
    var dairyTotalCO2 = dairyProductCalorie * 3 * 30;
    var fruitsTotalCO2 = fruitsCalorie * 4 * 30; 
    var totalfoodCO2 = (nonVegTotalCO2 + bakedTotalCO2 + dairyTotalCO2 + fruitsTotalCO2)/2;


    totalCO2 = (travelTotalCO2 + waterTotalCO2 + electrictyTotalCO2 + nonVegTotalCO2 + bakedTotalCO2 + dairyTotalCO2 + fruitsTotalCO2)/7;


    try{
        const results = 
        {
            user: user,
            location: worklocation,
            totalCO2: totalCO2,
            travelCO2 : travelTotalCO2,
            foodCO2: totalfoodCO2,
            homeCO2: totalhomeCO2

        };

        carbonFootprint.create(results, function (err, post) 
        {
            if (err) return ;
        });

    } catch (error) {
        console.log('Database footprint operation');
      }
}
module.exports = {
    invoke,
    homeView,
    buttonElectricity,
    submitSurvey
}