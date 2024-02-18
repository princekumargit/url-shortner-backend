import supabase from "./supabase";
import express from "express";

export const authenticateToken = async (req: express.Request, res: express.Response, next: Function) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ error: 'Access token is missing' });
    }

    try {
        const userResponse = await supabase.auth.getUser(accessToken);
        const user = userResponse.data.user;
        if (userResponse.error || !user ) {
            return res.status(401).json({ error: 'Invalid access token' });
        }

        if(!user.confirmed_at){
            return res.status(401).json({ error: 'Not Verified' });
        }

        next();
    } catch (error) {
        console.error('Error verifying access token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

