const SQL = `CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR ( 255 ),
   password VARCHAR ( 255 )
);

CREATE TABLE IF NOT EXISTS userinfo (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    firstname VARCHAR(255), 
    lastname VARCHAR(255), 
    member BOOLEAN, 
    usersid INT, 
    CONSTRAINT fk_users FOREIGN KEY (usersid) REFERENCES users(id)
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255),
    date TIMESTAMPTZ DEFAULT NOW(),
    message VARCHAR(255),
    usersid INT,
    CONSTRAINT fk_users FOREIGN KEY (usersid) REFERENCES users(id)
);

INSERT INTO users (username, password) VALUES
    ('patrick', 'bettyboop'),
    ('maria', 'monkey'),
    ('damien', 'wonkwonk');

INSERT INTO userinfo (firstname, lastname, member, usersid) VALUES
    ('Patrick', 'Johnson', true, 1),
    ('Maria', 'Falcone', false, 2),
    ('Damien', 'Lucifer', true, 3);

INSERT INTO messages (title, message, usersid) VALUES
    ('Greetings!','Hello everyone! How are all of you doing?', 1),
    ('I''m here.', 'This site sucks!', 3),
    ('Hi!', 'Nice to meet you all!', 2);
`;
