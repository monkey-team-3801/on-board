import * as MongoDb from "mongodb";
import * as Mongoose from "mongoose";
import mongoose from "mongoose";

export class Database {
    private static connection: Mongoose.Connection;
    private uri: string = "";

    constructor(uri: string | undefined) {
        this.uri = uri || "";
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            mongoose.connect(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            });

            const connection = mongoose.connection;
            connection.on("error", (error) => {
                reject(error);
            });
            connection.once("open", () => {
                Database.connection = connection;
                resolve();
            });
        });
    }

    public static getDb(): MongoDb.Db {
        return this.connection.db;
    }
}
