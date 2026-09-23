const SQL = `
    
CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR ( 255 ),
   password VARCHAR ( 255 )
);

CREATE TABLE IF NOT EXISTS userinfo (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    firstname VARCHAR(255), 
    lastname VARCHAR(255), 
    member BOOLEAN DEFAULT false,
    admin BOOLEAN DEFAULT false, 
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
`;
