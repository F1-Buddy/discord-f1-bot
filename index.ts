import DiscordJS, { ClientVoiceManager, IntentsBitField, time } from 'discord.js'
import dotenv from 'dotenv'

var fs = require('fs');
dotenv.config()

const client = new DiscordJS.Client(
    {
        intents: [
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages
        ]
    }
)


//load user settings from settings.txt
var settingsArr: string[] = []
var settingsString = fs.readFileSync('settings.txt').toString()
//console.log(settingsString)
settingsArr = settingsString.split('\n')
settingsString = ''
var botChar = '' + settingsArr[0].substring(5, 6)


console.log(botChar + ' is current bot character')

client.on('ready', () => {
    console.log('Bot ready')
})



var calendarPath = 'calendar/Formula_1_Official_Calendar.ics'


//                  Function for checking driver stats
const drivers = new Map([
    [33, ['Max_Verstappen','VER']],
    [1, ['Max_Verstappen','VER']],
    [11, ['Sergio_Pérez','PER']],
    [16, ['Charles_Leclerc','LEC']],
    [55, ['Carlos_Sainz_Jr.','SAI']],
    [63, ['George_Russell_(racing_driver)','RUS']],
    [44, ['Lewis_Hamilton','HAM']],
    [23, ['Alex_Albon','ALB']],
    [6, ['Nicholas_Latifi','LAT']],
    [14, ['Fernando_Alonso','ALO']],
    [30, ['Esteban_Ocon','OCO']],
    [77, ['Valtteri_Bottas','BOT']],
    [24, ['Zhou_Guanyu','ZHO']],
    [10, ['Pierre_Gasly','GAS']],
    [22, ['Yuki_Tsunoda','TSU']],
    [20, ['Kevin_Magnussen','MAG']],
    [47, ['Mick_Schumacher','SCH']],
    [4, ['Lando_Norris','NOR']],
    [3, ['Daniel_Ricciardo','RIC']],
    [18, ['Lance_Stroll','STR']],
    [5, ['Sebastian_Vettel','VET']],
    [99, ['Antonio_Giovinazzi','GIO']],
    [88, ['Robert_Kubica','KUB']],
    [9, ['Nikita_Mazepin','MAZ']],
    [8, ['Romain_Grosjean','GRO']]
]);
console.log(drivers.get(33))

client.on('messageCreate', (message) => {
    var driverNumber = 0
    if (message.content.includes(botChar+'driver ')) {
        driverNumber = (Number)(message.content.substring(8))
        if (Number.isFinite(driverNumber)){
            if (drivers.get(driverNumber) == undefined){
                message.reply({
                    content: 'Please enter a valid driver number'
                })
            }
            else {
                //replace this with driver data instead of a link
                message.reply({
                    content: 'https://en.wikipedia.org/wiki/'+drivers.get(driverNumber)
                })
            }
        }
        else {
            message.reply({
                content: 'Please enter a valid driver number'
            })
        }
    }
})


//                  Function for checking Next F1 Event
var calendarPath = 'calendar/Formula_1_Official_Calendar.ics'
var calendarAsString: string
var calSubs: any[] = []
var eventTimes: any[] = []

var today = new Date();
var nextBool = false;
var nextIndex = -1;
//console.log(today)
// new solution using Date() objects instead of comparing strings
var eventDateArr: Date[] = []
client.on('messageCreate', (message) => {
    if (message.content === botChar + 'n' || message.content === botChar + 'next') {
        calendarAsString = ''
        calendarAsString = fs.readFileSync(calendarPath).toString();
        calSubs = calendarAsString.split('\n')
        for (let i = 0; i < calSubs.length; i++) {
            if (calSubs[i].includes('DTSTART;')) {
                var eventYear = calSubs[i].substring(27, 31)
                var eventMonth = calSubs[i].substring(31, 33) - 1
                var eventDay = calSubs[i].substring(33, 35)
                var eventHour = calSubs[i].substring(36, 38) //- 5
                var eventMinute = calSubs[i].substring(38, 40)
                //used to test date objects
                /*
                console.log("eventYear is " + eventYear)
                console.log("eventMonth is " + eventMonth + " + 1 bc months are zero based")
                console.log("eventDay is " + eventDay)
                console.log("eventHour is " + eventHour)
                console.log("eventMinute is " + eventMinute)
                */
                eventDateArr.push(new Date(Date.UTC(eventYear, eventMonth, eventDay, eventHour - 1, eventMinute)))
                //console.log(eventDateArr)
                eventTimes.push(calSubs[i].substring(27))
                eventTimes.push(calSubs[i + 2].substring(8))
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

        //this loop prints elements in eventDateArr and for testing
        //eventDateArr.push(today)
        /*
        for (let i = 0; i <eventDateArr.length;i++){
            //console.log("event time = "+eventDateArr[i])
            if (eventDateArr[i]<today){
                console.log("event date lt today")
                console.log("event time = "+eventDateArr[i])
            }
            else {
                console.log("event date gt today")
                console.log("event time = "+eventDateArr[i])
            }
        }
        */
        while (!nextBool) {
            nextIndex++
            if (eventDateArr[nextIndex] > today) {
                nextBool = true
            }
        }
        //console.log(eventDateArr[nextIndex] + ' is time of next event')
        //console.log(eventTimes[nextIndex*2+1] + ' is name of event')
        var nextEventName = eventTimes[nextIndex * 2 + 1].substring(0, eventTimes[nextIndex * 2 + 1].length - 1);
        var nextEventTime = eventDateArr[nextIndex].toLocaleString()
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
            content: 'Next event is ' + nextEventName + ' on ' + nextEventTime,
        })
    }


})


//              Function for changing character for bot commands

// add checks for command character, thanks jubayer
client.on('messageCreate', (message) => {
    if (message.author.bot == false) {
        if (message.content.includes(botChar + 'change', 0)) {
            console.log(message.content[8])
            botChar = message.content[message.content.indexOf('change')+7]
            settingsArr[0] = 'char=' + botChar
            for (let i = 0; i < settingsArr.length; i++) {
                settingsString += settingsArr[i] + '\n'
            }
            fs.writeFileSync('settings.txt', settingsString, (err: any) => {
                if (err) throw err;
            })
            settingsString = ''
            message.reply({
                content: 'Bot character changed to ' + botChar,
            })
        }
    }
})

//              Help function
client.on('messageCreate', (message) => {
    var helpString = ''
    helpString += botChar + 'change [new bot character]", to change bot character, currently "' + botChar + '"\n'
    helpString += botChar + 'n or ' + botChar + 'next to check next race'
    if (message.content === botChar + 'help' || message.content === botChar + 'h') {
        message.reply({
            content: helpString
        })
    }
})

client.login(process.env.TOKEN)


