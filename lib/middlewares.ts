import supabase from "./supabase";
import express from "express";

export const authenticateToken = async (req: express.Request, res: express.Response, next: Function) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const {userId} = req.body;
    if(!userId){
        res.status(400).json({message: "userId is Required"});
        return;
    }
    // console.log(accessToken);
    if (!accessToken) {
        return res.status(499).json({ error: 'Access token is missing' });
        return;
    }

    try {
        const userResponse = await supabase.auth.getUser(accessToken);
        const user = userResponse.data.user;
        if (userResponse.error || !user ) {
            return res.status(498).json({ error: 'Invalid access token' });
        }
        if(user.id != userId){
            res.status(401).json({message:"Access Token doesn't match with userId"})
        }

        // console.log("next");
        next();
    } catch (error) {
        console.error('Error verifying access token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

