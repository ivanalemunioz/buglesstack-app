# Buglesstack 🐛

[Buglesstack](https://buglesstack.com/) is an Open Source project that aims to provide an easy way to track browser automations crashes.

## Requirements

- [Node.js](https://nodejs.org/) v22
- [AWS](https://aws.amazon.com/) account to store data in S3 and send emails via SES.
- [PostgreSQL](https://www.postgresql.org/) database to store user data.

## Development
To run the project in development mode, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/ivanalemunioz/buglesstack-app.git
   cd buglesstack-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and fill it with the required environment variables. You can use the `.env.example` file as a reference.

4. Import the [db-schema.sql](/db-schema.sql) into your PostgreSQL database

5. Start the backend development server:
   ```bash
   npm run dev:backend
   ```

6. Start the frontend development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to the URL prompted in the frontend development server terminal to access the application.


## Production

To build and run the project in production mode, follow these steps:

1. Ensure that your environment variables are set correctly in the production environment, check the `.env.example` file for reference. You can create a `.env` file in the root directory of your project with the necessary environment variables.

2. Import the [db-schema.sql](/db-schema.sql) into your PostgreSQL database

3. Run the build command:
   ```bash
   npm run build
   ```
4. Start the production server:
   ```bash
   npm run start
   ```

    You can use the PORT environment variable to specify a different port for the production server. For example:
    ```bash
    PORT=3000 npm run start
    ```

    Also you can use [pm2](https://pm2.keymetrics.io/) to manage the production server:
    ```bash
    pm2 start npm --name "buglesstack" -- run start
    ```

## Help
If you need help or have any questions, feel free to open an issue in the [GitHub repository](https://github.com/ivanalemunioz/buglesstack-app/issues).

You can also contact me directly via email at [ivan@buglesstack.com](mailto:ivan@buglesstack.com).

## Contributing
Contributions are welcome! If you want to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your branch to your forked repository.
5. Create a pull request in the original repository.

Thank you for your contributions!

## License
This project is licensed under the FSL-1.1-Apache-2.0 license. See the [LICENSE](LICENSE.md) file for details.
