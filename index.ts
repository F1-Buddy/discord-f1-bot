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
var settingsArr = []
var settingsString = fs.readFileSync('settings.txt').toString()
//console.log(settingsString)
settingsArr = settingsString.split('\n')
var botChar = '' + settingsArr[0].substring(5, 6)
console.log(botChar)

client.on('ready', () => {
    console.log('Bot ready')
})

var calendarPath = 'C:/Users/rakib/Documents/code/discord-f1-bot/calendar/Formula_1_Official_Calendar.ics'

var calendarAsString: string
var calSubs: any[] = []
var eventTimes: any[] = []
var currentDate = new Date();
var dateTime = ""
var dateArr: number[] = []
var currentYear = currentDate.getFullYear()
var currentMonth = currentDate.getMonth()
var currentDay = currentDate.getDate()
dateArr.push(currentYear)
console.log(dateArr[0]+' = year')
dateArr.push(currentMonth)
console.log(dateArr[1]+' = month')
dateArr.push(currentDay)
console.log(dateArr[2]+' = day')


//function that sets a string with current date
function setDate() {
    dateTime = ''
    dateTime += dateArr[0]
    if (dateArr[1] < 10) {
        dateTime += "0" + (dateArr[1] + 1)
    }
    else {
        dateTime += (dateArr[1] + 1)
    }
    if (dateArr[2] < 10) {
        dateTime += "0" + (dateArr[2])
    }
    else {
        dateTime += (dateArr[2])
    }
    ///
    ///
    ///
    ///                 FOR TESTING PURPOSES
    ///                 REMOVE LATER
    ///
    ///
    ///
    ///                 dateTime = '20220220'
                console.log(dateTime +' = dateTime string')
}


client.on('messageCreate', (message) => {
    if (message.content === botChar + 'n' || message.content === botChar + 'next') {
        calendarAsString = ''
        calendarAsString = fs.readFileSync(calendarPath).toString();
        calSubs = calendarAsString.split('\n')
        for (let i = 0; i < calSubs.length; i++) {
            if (calSubs[i].includes('DTSTART;')) {
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
        setDate()
        //console.log(dateTime)

        for (let i = 0; i < eventTimes.length; i++) {
            if (eventTimes[i].includes(dateTime)) {
                var nextEventName = eventTimes[i + 1].substring(0, eventTimes[i + 1].length - 1);
                var nextEventTime = eventTimes[i].substring(9, 15)
                var tempTime = nextEventTime.substring(0, 2) + ':' + nextEventTime.substring(2, 4) + ':' + nextEventTime.substring(4, 6)
                nextEventTime = tempTime
                message.reply({
                    content: 'Next event is ' + nextEventName + ' at ' + nextEventTime + ' British time.',
                })
            }
            else {
                for (let i = 0; i < 32; i++) {

                }
            }

        }
    }


})


client.on('messageCreate', (message) => {
    if (message.author.bot == false) {
        if (message.content.includes(botChar + 'change', 0)) {
            console.log(message.content[8])
            botChar = message.content[8]
            message.reply({
                content: 'Bot character changed to ' + botChar,
            })
        }
    }
})

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


