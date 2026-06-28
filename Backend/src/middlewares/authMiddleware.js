import { verifyToken } from '@clerk/backend';

export const protect = async (req, res, next) => {
    try {
        // Sviluppo/Test offline: se viene passato x-user-id e non siamo in produzione, bypassa Clerk
        if (process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
            req.user = { id: req.headers['x-user-id'] };
            req.auth = { userId: req.headers['x-user-id'] };
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Non autorizzato: Token mancante" });
        }

        const token = authHeader.split(' ')[1];
        
        // Verifica il token usando la funzione corretta
        const verifiedToken = await verifyToken(token, { 
            secretKey: process.env.CLERK_SECRET_KEY 
        });
        
        // Nelle versioni recenti, l'ID utente si trova in 'sub'
        req.user = { id: verifiedToken.sub }; 
        req.auth = { userId: verifiedToken.sub }; 
        
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Token non valido o scaduto" });
    }
};