const config = require('./config.js');
const mysql = require('mysql');
const util = require('util');

const reset = '\x1b[0m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const magenta = '\x1b[35m';
const blue = '\x1b[34m';

const dbTablesAndKeys = {
  answers: {
    userId: 'users',
    interestId: 'interests',
    promptId: 'prompts',
  },
  attachments: {
    userId: 'users',

  },
  blocks: {
    blockerUserId: 'users',
    blockedUserId: 'users',    
  },
  categories: { 
  },
  contacts: {
  },
  devices: {
    userId: 'users',
  },
  embeds: {
    userId: 'users',
  },
  friends: {
    initiatingUserId: 'users',
    targetUserId: 'users',
  },
  GroupCategories: {
    groupId: 'groups',
    categoryId: 'categories',
  },
  groups: {
    userId: 'users',
    mediaId: 'media',
    lastMessageId: 'hangMessages',
    lastJoinMessageId: 'hangMessages',
  },
  HangCategories: {
    hangId: 'hangs',
    categoryId: 'categories',
  },
  hangGroupInvites: {
    hangId: 'hangs',
    groupId: 'groups',
    invitingUserId: 'users',
  },
  hangMessageAttachments: {
    hangMessageId: 'hangMessages',
    attachmentId: 'attachments',
  },
  hangMessageEmbeds: {
    hangMessageId: 'hangMessages',
    embedId: 'embeds',
  },
  hangMessages: {
    hangId: 'hangs',
    userId: 'users',
    replyToMessageId: 'hangMessages',
    friendshipId: 'friends',
    sharedHangId: 'hangs',
    replyToUserThoughtDataId: 'userThoughtData',
    groupId: 'groups',
  },
  hangs: {
    authorId: 'users',
    mediaId: 'media',
    lastMessageId: 'hangMessages',
    mediaCategoryId: 'categories',
    userId: 'users',
  },
  interests: {
    userId: 'users',
    categoryId: 'categories',
  },
  media: {
    userId: 'users',
    categoryId: 'categories',
    interestId: 'interests',
  },
  pings: {
    senderId: 'users',
    recipientId: 'users',
  },
  prompts: {
    categoryId: 'categories',
  },
  reactions: {
    userId: 'users',
    hangMessageId: 'hangMessages',
    hangId: 'hangs',
    friendshipId: 'friends',
    groupId: 'groups',
  },
  subcategories: {
    categoryId: 'categories',
  },
  thoughtAttachments: {
    thoughtId: 'thoughts',
    attachmentId: 'attachments',
  },
  thoughtEmbeds: {
    thoughtId: 'thoughts',
    embedId: 'embeds',
  },
  thoughts: {
    userId: 'users',
  },
  UserContacts: {
    userId: 'users',
    contactId: 'contacts',
  },
  userFriendData: {
    friendshipId: 'friends',
    userId: 'users',
    friendUserId: 'users',
    lastMessageId: 'hangMessages',
  },
  userGroupData: {
    userId: 'users',
    invitingUserId: 'users',
    groupId: 'groups',
  },
  userHangData: {
    userId: 'users',
    hangId: 'hangs',
  },
  users: {
    invitingUserId: 'users',
  },
  userThoughtData: {
    thoughtId: 'thoughts',
    authorId: 'users',
    recipientId: 'users',
  },
  userThreadData: {
    userId: 'users',
    hangId: 'hangs',
    replyToMessageId: 'hangMessages',
    friendshipId: 'friends',
  },
}

const main = async() => {
  const db = makeDb(config.db);
  await checkForErrors(db);
  await db.close();
}

main();

async function checkForErrors(db) {
  const errors = {};
  const tables = Object.keys(dbTablesAndKeys);
  const maxTableNameLength = Math.max(...tables.map(t => t.length));

  for (const table of tables) {
    const keys = dbTablesAndKeys[table];
    const padding = 2 + maxTableNameLength - table.length;
    process.stdout.write(`Checking ${table} ${'·'.repeat(padding)} `);
    const errors = [];

    for (const [ column, referencedTable ] of Object.entries(keys)) {
      const query = `SELECT * FROM ${table} WHERE ${column} IS NOT NULL AND
        ${column} NOT IN (SELECT id FROM ${referencedTable});`

      const results = await db.query(query);
      
      if (results.length > 0) {
        if (!(table in errors)) errors[table] = [];
        
        for (const result of results) {
          const error = `Row ${magenta}${result['id']}${reset} column ` +
            `${yellow}${column}${reset} refers to table ${blue}` +
            `${referencedTable}${reset} row ${magenta}${result[column]}` +
            `${reset}, but that row does not exist.`;

          errors.push(error);
        }
      }
    }

    const count = errors.length;

    if (count > 0) {
      console.log('[ ' + red + 'Error' + reset + ' ]');
      
      for (let i = 0; i < count; i++) {
        const error = errors[i];
        if (i == count - 1) console.log('         └─ ' + error);
        else console.log('         ├─ ' + error);
      }
    }

    else {
      console.log('[ ' + green + 'Ok' + reset + ' ]');
    }
  }
}
  
function makeDb(config) {
  console.log(`Connecting to database '${config.host}'...`);
  const connection = mysql.createConnection(config);

  return {
    config,
    query(sql) {
      return util.promisify(connection.query).call(connection ,sql, []);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    }
  }
}
