import { NextFunction, Request, Response } from 'express';

export default class MeasureRequestTime {

    get = async (req: Request, res: Response, next: NextFunction) => {
        const startTime: number = Date.now(); // Temps de départ

        // Intercepter la méthode send originale
        const originalSend = res.send;
        res.send = function (body) {
            const endTime: number = Date.now();
            const elapsedTime: number = endTime - startTime;
            
            // Ajouter le header avant d'envoyer la réponse
            res.setHeader('X-Response-Time', `${elapsedTime}ms`);
            console.log(`[${req.method}] ${req.originalUrl} ${res.statusCode} : ${elapsedTime} ms`);
            
            // Appeler la méthode send originale
            return originalSend.call(this, body);
        };

        next(); // Passe au middleware ou à la route suivante
    };  

}
