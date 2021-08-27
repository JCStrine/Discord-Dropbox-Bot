require("dotenv").config();
const dropboxV2Api = require("dropbox-v2-api");

//paste your discord token in the env file

const dbx = new dropboxV2Api.authenticate({
    //paste in dropbox token in the quotes
  token: "",
});
const { Client } = require("discord.js");
const client = new Client();
const PREFIX = "$";

let filePaths = [];
let link = "";

client.on("ready", () => {
  console.log(`${client.user.tag} has logged in`);
  dbx(
    {
      resource: "files/list_folder",
      parameters: {
        path: "",
      },
    },
    (err, result, response) => {
      if (err) {
        return console.log("err:", err);
      }
      for (let i = 0; i < result.entries.length; i++) {
        filePaths.push(result.entries[i].path_lower);
      }
    }
  );
});

client.on("message", async (message) => {
  if (message.author.bot == true) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === "meme") {
      const rpath = filePaths[Math.floor(Math.random() * filePaths.length)];
      dbx(
        {
          resource: "files/get_temporary_link",
          parameters: {
            path: rpath,
          },
        },
        (err, result, response) => {
          if (err) {
            return console.log("err:", err);
          }
          link = result.link;
          message.channel.send(link);
        }
      );
    } else if (CMD_NAME === "refresh") {
      dbx(
        {
          resource: "files/list_folder",
          parameters: {
            path: "",
          },
        },
        (err, result, response) => {
          if (err) {
            return console.log("err:", err);
          }
          for (let i = 0; i < result.entries.length; i++) {
            filePaths.push(result.entries[i].path_lower);
          }
          message.channel.send("Meme stash refreshed");
        }
      );
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
