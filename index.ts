import DiscordJS, {
  ClientVoiceManager,
  IntentsBitField,
  time,
} from "discord.js";
import dotenv from "dotenv";

//import { RequestInfo, RequestInit } from "node-fetch";

//const fetch = (url: RequestInfo, init?: RequestInit) =>  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

var fs = require("fs");
dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
  ],
});

//load user settings from settings.txt
var settingsArr: string[] = [];
var settingsString = fs.readFileSync("settings.txt").toString();
//console.log(settingsString)
settingsArr = settingsString.split('\n')
settingsString = ''
var botChar = '' + settingsArr[0].substring(5, 6)


console.log(botChar + ' is current bot prefix')

client.on('ready', () => {
    console.log('Bot ready')
})


var statArr: string[] = ['starts', 'wins', 'podiums', 'careerpoints', 'poles', 'fastestlaps']
var statStringsArr: string[] = ['Started ', ' times', 'Won ', ' times', 'Been on the podium ', ' times', 'Scored ', ' points', 'Claimed ', ' poles', 'Claimed ', ' fastest laps']

var drivers = new Map([
  [33, ["Max Verstappen", "VER"]],
  [1, ["Max Verstappen", "VER"]],
  [11, ["Sergio Pérez", "PER"]],
  [16, ["Charles Leclerc", "LEC"]],
  [55, ["Carlos Sainz_Jr.", "SAI"]],
  [63, ["George Russell", "RUS"]],
  [44, ["Lewis Hamilton", "HAM"]],
  [23, ["Alex Albon", "ALB"]],
  [6, ["Nicholas Latifi", "LAT"]],
  [14, ["Fernando Alonso", "ALO"]],
  [30, ["Esteban Ocon", "OCO"]],
  [77, ["Valtteri Bottas", "BOT"]],
  [24, ["Zhou Guanyu", "ZHO"]],
  [10, ["Pierre Gasly", "GAS"]],
  [22, ["Yuki Tsunoda", "TSU"]],
  [20, ["Kevin Magnussen", "MAG"]],
  [47, ["Mick Schumacher", "SCH"]],
  [4, ["Lando Norris", "NOR"]],
  [3, ["Daniel Ricciardo", "RIC"]],
  [18, ["Lance Stroll", "STR"]],
  [5, ["Sebastian Vettel", "VET"]],
  [99, ["Antonio Giovinazzi", "GIO"]],
  [88, ["Robert Kubica", "KUB"]],
  [9, ["Nikita Mazepin", "MAZ"]],
  [26, ["Daniil Kvyat", "KVY"]],
  [8, ["Romain Grosjean", "GRO"]],
]);

//possibly fixed??

//setDrivers function resets the 'drivers' map, created bc idk how to get value without popping. :(
/*

*/

//                  Command for checking driver stats

client.on('messageCreate', async (message) => {
    var driverNumber = 0
    var driverName: string | undefined = ''
    function invalidDNumInput() {
        message.reply({
            content: 'Please enter a valid driver number (2020 - 2022): $driver 33'
        })
    }
    if (message.content.toLowerCase().includes(botChar + 'driver') && message.author.bot == false) {
        if (message.content.length >= 8) {
            driverNumber = (Number)(message.content.substring(8))
            //console.log('driverNumber = ' + driverNumber)
            if (Number.isFinite(driverNumber)) {
                if (drivers.get(driverNumber) == undefined) {
                    invalidDNumInput()
                }
                else {
                    let dCode: string | undefined
                    let reqDriverArray: string[] | undefined = []
                    reqDriverArray = drivers.get(driverNumber)
                    if (reqDriverArray != undefined) {
                        //console.log('driver array value = ' + reqDriverArray[0])
                        dCode = reqDriverArray[1]
                        driverName = reqDriverArray[0]
                        //setDrivers()
                        //console.log('POPPED!' + drivers)
                        var statURL = ''
                        var finalOutString = driverName + ' has\n```'
                        var outString = ''
                        var fetchArr: string[] = []
                        for (let i = 0; i < statArr.length; i++) {
                            statURL = ''
                            statURL += 'https://en.wikipedia.org/w/api.php?action=parse&text={{F1stat|'
                            statURL += dCode + '|' + statArr[i] + '}}&contentmodel=wikitext&format=json'

                            fetchArr.push(statURL)
                            const fetchedPage = await fetch(fetchArr[i])
                            const pageData = await fetchedPage.json()
                            var statString = JSON.stringify(pageData.parse.text)
                            outString = statString.substring((statString.indexOf('<p>') + 3), (statString.indexOf('n') - 1))
                            //console.log('outString = \n' + outString)
                            finalOutString += statStringsArr[i * 2] + outString + statStringsArr[i * 2 + 1] + '\n'
                            //console.log('finalOutString = \n' + finalOutString)

                            //console.log('\nstatURL = ' + fetchArr[i])
                        }
                        finalOutString += '```'
                        await message.reply({
                            content: finalOutString
                        })
                    }

                }
            }
            else {
                invalidDNumInput()
            }
        }
        else {
            invalidDNumInput()

        }
      } else {
        invalidDNumInput();
      }
    } else {
      invalidDNumInput();
    }
  }
});

//                  Command for checking Next F1 Event
var calendarURL =
  "https://www.formula1.com/calendar/Formula_1_Official_Calendar.ics";
var calendarAsString: string;
var calSubs: any[] = [];
var eventTimes: any[] = [];

var today = new Date();
var nextBool = false;
var nextIndex = -1;
//console.log(today)
// new solution using Date() objects instead of comparing strings
var eventDateArr: Date[] = [];

client.on("messageCreate", async (message) => {
  if (
    message.content.toLowerCase() === botChar + "n" ||
    message.content.toLowerCase() === botChar + "next"
  ) {
    const fetchedPage = await fetch(calendarURL);
    calendarAsString = await fetchedPage.text();
    calSubs = calendarAsString.split("\n");
    for (let i = 0; i < calSubs.length; i++) {
      if (calSubs[i].includes("DTSTART;")) {
        var eventYear = calSubs[i].substring(27, 31);
        var eventMonth = calSubs[i].substring(31, 33) - 1;
        var eventDay = calSubs[i].substring(33, 35);
        var eventHour = calSubs[i].substring(36, 38); //- 5
        var eventMinute = calSubs[i].substring(38, 40);
        //used to test date objects
        /*
                console.log("eventYear is " + eventYear)
                console.log("eventMonth is " + eventMonth + " + 1 bc months are zero based")
                console.log("eventDay is " + eventDay)
                console.log("eventHour is " + eventHour)
                console.log("eventMinute is " + eventMinute)
                */
        eventDateArr.push(
          new Date(
            Date.UTC(
              eventYear,
              eventMonth,
              eventDay,
              eventHour - 1,
              eventMinute
            )
          )
        );
        //console.log(eventDateArr)

        //change to date objects
        eventTimes.push(calSubs[i].substring(27));
        eventTimes.push(calSubs[i + 2].substring(8));
      }
    }
    //console.log('Full Calendar length by line '+calSubs.length)
    //console.log('eventTimes string length by line '+eventTimes.length)
    /*
        for (let i = 0; i < eventTimes.length; i++){
            console.log(eventTimes[i])
        }
        */
    //successfully got event names and start eventTimes into "eventTimes" array, start eventTimes start with "DTSTART;" and names with "SUMMARY:"
    //setDate()
    while (!nextBool) {
      nextIndex++;
      if (eventDateArr[nextIndex] > today) {
        nextBool = true;
      }
    }
    //console.log(eventDateArr[nextIndex] + ' is time of next event')
    //console.log(eventTimes[nextIndex*2+1] + ' is name of event')
    var nextEventName = eventTimes[nextIndex * 2 + 1].substring(
      0,
      eventTimes[nextIndex * 2 + 1].length - 1
    );
    var nextEventTime = eventDateArr[nextIndex].toLocaleString();
    /*
        console.log('Next Event name = '+nextEventName)
        console.log('Next Event Time = '+nextEventTime)
        console.log('Original time (UTC) = '+eventTimes[nextIndex*2])
        console.log('Converted time (EST) = '+nextEventTime)
        */
    //var nextEvent = eventTimes[nextIndex*2].toLocaleString('en-US', { timeZone: 'America/New_York' });
    //console.log(nextEvent)
    /*
        for (let i = 0; i < eventTimes.length; i++) {
            if (eventTimes[i].includes(dateTime)) {
                var nextEventName = eventTimes[i + 1].substring(0, eventTimes[i + 1].length);
                var nextEventTime = eventTimes[i].substring(9, 15)
                var tempTime = nextEventTime.substring(0, 2) + ':' + nextEventTime.substring(2, 4) + ':' + nextEventTime.substring(4, 6)
                nextEventTime = tempTime
                
            }
            else {
                for (let i = 0; i < 32; i++) {

                }
            }

        }
        */
    message.reply({
      content:
        "Next event is " + nextEventName + " on ``" + nextEventTime + "``",
    });
  }
});

// command to get qualification times based on round
client.on("messageCreate", async (message) => {
  var roundNumber = 1;
  var roundName: string | undefined = "";
  function invalidDNumInput() {
    message.reply({
      content: "Please enter a valid round number (2022): $quali 1",
    });
  }
  if (
    message.content.toLowerCase().includes(botChar + "quali") &&
    message.author.bot == false
  ) {
    if (message.content.length >= 7) {
      roundNumber = Number(message.content.substring(7));
      if (Number.isFinite(roundNumber)) {
        if (rounds.get(roundNumber) == undefined) {
          invalidDNumInput();
          console.log("this clearly isn't working");
        } else {
          roundName = rounds.get(roundNumber);
          var statURL = "";
          var finalOutString = roundName + " qualification results\n";
          var outString = "";
          statURL = "http://ergast.com/api/f1/2022/";
          statURL += roundNumber + "/" + "qualifying.json";

          console.log(statURL);

          const fetchedPage = await fetch(statURL);
          const pageData = await fetchedPage.json();
          let qualiArr = pageData.MRData.RaceTable.Races
          var statString = JSON.stringify(pageData.MRData.RaceTable.Races);
          console.log(qualiArr)
          console.log('qresults = '+qualiArr[0])



          //outString = statString.substring((statString.indexOf('<p>') + 3), (statString.indexOf('n') - 1))
          //console.log('outString = \n' + outString)

          //finalOutString += statStringsArr[i * 2] + outString + statStringsArr[i * 2 + 1] + '\n'

          //console.log('finalOutString = \n' + finalOutString)

          //console.log('\nstatURL = ' + fetchArr[i])

          //finalOutString += ''
          await message.reply({
            content: finalOutString,
          });
        }
      } else {
        invalidDNumInput();
      }
    } else {
      invalidDNumInput();
    }
  }
});


var rounds = new Map([]);
var icsAsString = ''
var icsArr = []
//rounds.set(1, "Bahrain Grand Prix")
async function getRounds() {
    const fetchedPage = await fetch(calendarURL)
    icsAsString = await fetchedPage.text()
    icsArr = icsAsString.split('\n')
    for (let i = 0, c = 1; i < icsArr.length; i++) {
        if (icsArr[i].includes(' - Qualifying')) {
            //console.log(icsArr[i])
            rounds.set(c, icsArr[i].substring(8, icsArr[i].length - 1))
            c++
        }
    }
}
getRounds()

client.on("messageCreate", async (message) => {

    var roundNumber = 1;
    var roundName: string | unknown = "";
    function invalidDNumInput() {
        message.reply({
            content: "Please enter a valid round number (2022): $quali 1",
        });
    }
    if (
        message.content.toLowerCase().includes(botChar + "quali") &&
        message.author.bot == false && (message.content.toLowerCase().indexOf(botChar) == 0) &&
        (message.content.toLowerCase().indexOf('quali') == 1)
    ) {
        if (message.content.length >= 7) {
            roundNumber = Number(message.content.substring(7));
            if (Number.isFinite(roundNumber)) {
                if (rounds.get(roundNumber) == undefined) {
                    invalidDNumInput();
                    //console.log("this clearly isn't working");
                } else {
                    roundName = rounds.get(roundNumber);

                    var statURL = "";
                    var finalOutString = roundName + " results:\n\n";
                    var outString = "";
                    statURL = "http://ergast.com/api/f1/2022/";
                    statURL += roundNumber + "/" + "qualifying.json";

                    //console.log(statURL);

                    const fetchedPage = await fetch(statURL);
                    const pageData = await fetchedPage.json();
                    if (pageData.MRData.RaceTable.Races.length != 0) {
                        var qualiArr = pageData.MRData.RaceTable.Races[0].QualifyingResults;
                        for (let i = 0; i < qualiArr.length; i++) {
                            var positionString = 'P' + pageData.MRData.RaceTable.Races[0].QualifyingResults[i].position
                            var driverNameString = pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.givenName + ' ' +
                                pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.familyName
                            var q1Time = pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Q1
                            var q2Time = pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Q2
                            var q3Time = pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Q3
                            finalOutString += '```c\n'
                            finalOutString += positionString + '\n\n' + driverNameString + '\n'
                            if (q3Time != undefined) {
                                finalOutString += 'Q3 Time = ' + q3Time + '\n'
                            }
                            if (q2Time != undefined) {
                                finalOutString += 'Q2 Time = ' + q2Time + '\n'
                            }
                            if (q1Time != undefined) {
                                finalOutString += 'Q1 Time = ' + q1Time + '\n'
                            }
                            finalOutString += '```'
                            // console.log('\n')
                            // console.log(pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.givenName + ' ' +
                            //             pageData.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.familyName
                            // )
                            // console.log('P'+pageData.MRData.RaceTable.Races[0].QualifyingResults[i].position)
                        }
                    }
                    else {
                        finalOutString = 'Please enter a round number that has occured'
                    }

                    //console.log(finalOutString)



                    //outString = statString.substring((statString.indexOf('<p>') + 3), (statString.indexOf('n') - 1))
                    //console.log('outString = \n' + outString)

                    //finalOutString += statStringsArr[i * 2] + outString + statStringsArr[i * 2 + 1] + '\n'

                    //console.log('finalOutString = \n' + finalOutString)

                    //console.log('\nstatURL = ' + fetchArr[i])

                    //finalOutString += ''
                    await message.reply({
                        content: finalOutString,
                    });
                }
            } else {
                invalidDNumInput();
            }
        } else {
            invalidDNumInput();
        }
    }
});


//              Command for changing character for bot commands

// add checks for command character, thanks jubayer

client.on('messageCreate', (message) => {
    if (message.author.bot == false) {
        if (message.content.toLowerCase().includes(botChar + 'change', 0)) {
            if (message.content.length >= 8) {
                console.log('prefix changed to ' + message.content[8])
                botChar = message.content[message.content.indexOf('change') + 7]
                settingsArr[0] = 'char=' + botChar
                for (let i = 0; i < settingsArr.length; i++) {
                    settingsString += settingsArr[i] + '\n'
                }
                fs.writeFileSync('settings.txt', settingsString, (err: any) => {
                    if (err) throw err;
                })
                settingsString = ''
                message.reply({
                    content: 'Bot prefix changed to ' + botChar,
                })
            }
        }

    }
  }
});

//              Help Command
client.on("messageCreate", (message) => {
  var helpString = "";
  helpString +=
    botChar +
    'change [new bot character]", to change bot character, currently "' +
    botChar +
    '"\n';
  helpString += botChar + "n or " + botChar + "next to check next race";
  if (
    message.content.toLowerCase() === botChar + "help" ||
    message.content.toLowerCase() === botChar + "h"
  ) {
    message.reply({
      content: helpString,
    });
  }
});

client.login(process.env.TOKEN);
