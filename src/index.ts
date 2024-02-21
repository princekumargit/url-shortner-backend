import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

import supabase from '../lib/supabase';
import {authenticateToken} from '../lib/middlewares';

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.post('/urls', authenticateToken, async (req: express.Request, res: express.Response) => {
    try{
        console.log("urls called");
        const {userId} = req.body;
        if(!userId){
            res.status(400).json({message: "userId is Required"});
        }

        const id = uuidv4();
        const { data, error } = await supabase
            .from('urls')
            .select('*')
            .eq('userid', userId)
        if (error) {
            throw error;
        }
        res.status(200).json({message:"URL fetched successfully", data : data})
    }catch(error){
        console.log(error);
        res.json(error);
    }
});

app.post('/add', authenticateToken, async (req: express.Request, res: express.Response) => {
    try{
        console.log("add called");
        const {userId, url} = req.body;
        if(!userId){
            res.status(400).json({message: "userId is Required"});
        }
        if(!url){
            res.status(400).json({message: "URL is Required"});
        }
        const id = uuidv4();
        const { data, error } = await supabase
            .from('urls') 
            .insert({ id: id, userid: userId, createdat: new Date(),url: url });
        if (error) {
            throw error;
        }
        res.status(200).json({message:"URL added successfully", data : {id:id, url: url, userId: userId}})
    }catch(error){
        console.log(error);
        res.json(error);
    }
});

app.get('/geturl/:urlId', async (req: express.Request, res: express.Response) =>{
    try {
        const urlId = req.params.urlId;
        const { data, error } = await supabase
            .from('urls')
            .select('url')
            .eq('id', urlId)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({ url: data.url });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.post('/signup', async (req: express.Request, res: express.Response) => {
    try{
        console.log("signup called");
        const {userName , userEmail, password} = req.body;

        const checkUser = await supabase.from('userstable').select('*').eq('useremail', userEmail);
        if(checkUser){
            res.status(400).json({message: "Email already exists"});
        }

        const signupResponse = await supabase.auth.signUp({email: userEmail, password: password});
        if (signupResponse.error) throw signupResponse.error;
        const user = signupResponse.data.user;

        
        if (user) {
            const insertResponse = await supabase
            .from('userstable')
            .insert([{ id:  user.id, username: userName, useremail: userEmail, verified: false}]);
        }
        
        res.status(200).json({ message: "signup succesfull", data: signupResponse.data});
    }catch(error){
        console.log(error);
        res.status(400).json(error);
    }
    
});

app.post('/signin', async (req: express.Request, res: express.Response) => {
    try{
        console.log("signin called");
        const {userEmail, password} = req.body;
        console.log(userEmail, password);

        const signinresponse = await supabase.auth.signInWithPassword({ email: userEmail, password: password});
        if (signinresponse.error) throw signinresponse.error;

        const user = signinresponse.data.user;
        
        res.status(200).json({ message: "signin succesfull",data: signinresponse.data});
    }catch(error){
        console.log(error);
        res.status(400).json(error);
    }
    
});

app.post('/checkverify', (req: express.Request, res: express.Response) => {
    console.log(req.body, req.params);
    res.json({message: " sdad"});
});

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({message: "This is URL shortner server"});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
