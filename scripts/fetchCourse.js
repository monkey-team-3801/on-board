const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const _ = require("lodash");
const fns = require("date-fns");
// const util = require("util");
const MongoClient = require("mongodb").MongoClient;

dotenv.config();

const dayToISO = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
};

const searchTerms = ["DECO", "CSSE", "COMP", "ENGG"];

const defaultData = {
    semester: "S2",
    campus: "STLUC",
    faculty: "EAIT",
    type: ["Lecture", "Practical", "Studio", "Tutorial"],
    days: ["1", "2", "3", "4", "5"],
    "start-time": "00:00",
    "end-time": "23:00",
};

const defaultConfig = {
    method: "post",
    url: "https://timetable.my.uq.edu.au/even/rest/timetable/subjects",
    headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        DNT: "1",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
    },
};

const getCourses = async () => {
    let finalResponse = {};
    for (const searchTerm of searchTerms) {
        const data = qs.stringify({
            ...defaultData,
            "search-term": searchTerm,
        });
        const config = { ...defaultConfig, data };
        const response = await axios(config);
        finalResponse = { ...finalResponse, ...response.data };
    }
    return finalResponse;
};

const parseCourse = (courses) => {
    const cleanedCourses = _.pickBy(
        courses,
        (course) =>
            !course.subject_code.includes("_EX") && // Remove external courses
            !course.description.toLowerCase().includes("special topics") // Remove special topics courses
    );
    const courseFinal = [];
    for (const course of _.values(cleanedCourses)) {
        const newEntry = {
            code: course.subject_code.substring(0, 8),
            description: course.description,
            activities: _.values(course.activities)
                .filter((activity) => activity.activity_type !== "Delayed")
                .map((activity) => {
                    const time = fns.parse(
                        activity.start_time,
                        "HH:mm",
                        new Date()
                    );
                    return {
                        type: activity.activity_type,
                        code: activity.activity_code,
                        time: time.getHours() + time.getMinutes() / 60,
                        startDate: fns.parse(
                            activity.start_date,
                            "dd/MM/y",
                            new Date()
                        ),
                        duration: Number(activity.duration),
                        dayOfWeek: dayToISO[activity.day_of_week],
                        weeks: activity.week_pattern
                            .split("")
                            .map((char) => Number(char)),
                    };
                }),
            announcements: [],
        };
        courseFinal.push(newEntry);
    }
    return courseFinal;
};

// getCourses().then(courses => console.log(parseCourse(courses)));
MongoClient.connect(
    process.env.MONGODB_URI,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    },
    async (err, client) => {
        if (err) throw err;
        const dbs = await client.db().admin().listDatabases({});
        let dbName;
        if (dbs.databases.some(db => db.name === "monkprod")) {
            dbName = "monkprod";
        } else if (dbs.databases.some(db => db.name === "test")) {
            dbName = "test";
        } else {
            console.error("Couldn't find suitable database");
            return;
        }

        const db = client.db(dbName);
        const courses = parseCourse(await getCourses());
        const courseCollection = db.collection("courses", (error) => {
            if (error) {
                throw error;
            }
        });
        const deleteResult = await courseCollection.deleteMany({});
        console.log(
            "Cleared course db, deleted",
            deleteResult.deletedCount,
            "entries."
        );
        const result = await courseCollection.insertMany(courses);
        console.log("Added", result.insertedCount, "new entries.");
        await client.close();
    }
);
// getCourses().then((res) => console.log(util.inspect(parseCourse(res), false,
// null, true)));
