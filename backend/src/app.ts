import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Example of a correctly defined request handler
const myHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Your logic here
        res.send('Success');
    } catch (error) {
        next(error); // Pass errors to the next middleware
    }
};

// Example of using the handler in a route
app.get('/my-route', myHandler);

// Ensure you are using the application instance correctly
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});