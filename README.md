# EntitySyncFramework

EntitySyncFramework is a Node.js library that enables database mapping in a code-first style, inspired by popular solutions like Entity Framework and Hibernate. Designed to be easy to use, it supports the creation and manipulation of entities and repositories to facilitate interaction with various DBMSs.

## Installation

To install the library, run the following command in your terminal:

```bash
npm install entitysyncframework
```
## Usage
### Initial Setup

First, register your entities and establish a database connection using a connector:

```
import { User, UserRepository, registerEntity, MysqlConnector } from 'entitysyncframework';

// Register the entity
registerEntity(User);

// Connect to the database
const mysqlConnector = new MysqlConnector();
await mysqlConnector.connect("localhost", "root", "your_password", "your_database", 3306);

// Map repositories
await mysqlConnector.mapRepositories([UserRepository]);
```

### Creating and Manipulating Entities

You can easily create, save, and manipulate entities:
```
// Create a new user
let user = new User();
user.name = "John Doe";
user.email = "john.doe@example.com";
user.password = "securePassword123";

// Save the user to the database
await mysqlConnector.getRepository(User).save(user);

// Delete a user
await mysqlConnector.getRepository(User).delete(user);
```

### Extending the Framework

#### Creating Your Own Dictionary

To create a custom dictionary, implement the IDictionary interface:

```
export class CustomDictionary implements IDictionary {
    // Implement all necessary methods from the interface
    insertQuery(table, columns, ...values) {
        // Logic for building an insert SQL query
    }
    // Define other methods similarly...
}
```

#### Creating Your Own Connector

To create a custom connector, implement the IConnector interface extending the GenericConnector class:

```
export class CustomConnector extends GenericConnector {
    _dictionary = new CustomDictionary();

    async connect(host, username, password, db, port) {
        // Logic to establish a database connection
    }
    // Implement other methods as required...
}
```

These extensions allow you to support additional databases and customize the behavior to meet specific needs, demonstrating the flexibility of EntitySyncFramework.

## Contributing

Contributions are very welcome. If you have ideas for improving the library or fixing a bug, feel free to fork the repository and submit a pull request. We look forward to seeing your ideas and improvements!

## License

This project is available under the MIT License. This means you can modify, distribute, or use the project for private or commercial purposes.

## Author

- Developed by Thiago Haine
