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
        // console.log(userId);
        if(!userId){
            res.status(400).json({message: "userId is Required"});
            return;
        }

        const { data, error } = await supabase
            .from('urls')
            .select('*')
            .eq('userid', userId)
        if (error) {
            res.status(404).json({message: error});
            return;
        }
        // console.log(data);
        res.status(200).json({message: data})
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
            return;
        }
        if(!url){
            res.status(400).json({message: "URL is Required"});
            return;
        }
        const id = uuidv4();
        const { data, error } = await supabase
            .from('urls') 
            .insert({ id: id, userid: userId, createdat: new Date(),url: url });
        if (error) {
            res.status(503).json({message: error});
            return;
        }
        res.status(200).json({message:"URL added successfully", data : {id:id, url: url, userId: userId}})
    }catch(error){
        console.log(error);
        res.json(error);
    }
});
app.post('/delete', authenticateToken, async (req: express.Request, res: express.Response) => {
    try{
        console.log("delete called");
        const {userId, urlId} = req.body;
        console.log(userId, urlId)
        if(!userId){
            res.status(400).json({message: "userId is Required"});
            return;
        }
        if(!urlId){
            res.status(400).json({message: "URL ID is Required"});
            return;
        }
        const selectRes = await supabase
            .from('urls')
            .delete()
            .eq("id",urlId)
            .eq("userid",userId)

        if (selectRes.error) {
            res.status(503).json({message: selectRes.error});
            return;
        }
        res.status(200).json({message: selectRes})
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
            res.status(503).json({message: error});
            return;
        }

        if (!data) {
            // console.log(data.url)
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        res.status(200).json({ url: data.url});
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.get('/:urlId', async (req: express.Request, res: express.Response) =>{
    try {
        const urlId = req.params.urlId;
        const { data, error } = await supabase
            .from('urls')
            .select('url')
            .eq('id', urlId)
            .single();

        if (error) {
            res.status(503).json({message: error});
            return;
        }

        if (!data) {
            // console.log(data.url)
            res.status(404).json({ error: 'URL not found' });
            return;
        }
        const URL = "http://"+data.url;
        res.redirect(URL);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.post('/signup', async (req: express.Request, res: express.Response) => {
    try{
        console.log("signup called");
        const {userName , userEmail, password} = req.body;
        if(!userName || !userEmail || !password){
            res.status(422).json({message: "Incomplete Credentials"});
            return;
        }

        const checkUser = await supabase.from('userstable').select('*').eq('useremail', userEmail);
        if(checkUser.error){
            // console.log("supabase error");
            throw checkUser.error;
        }
        if(checkUser.data.length > 0){
            // console.log(checkUser);
            res.status(409).json({message: "Email already exists"});
            return;
        }
        // console.log("this is running");

        const signupResponse = await supabase.auth.signUp({email: userEmail, password: password});
        // console.log(signupResponse.data)
        if (signupResponse.error){
            res.status(503).json({message: signupResponse.error});
            return;
        }
        const user = signupResponse.data.user;

        if (user != null) {
            const insertResponse = await supabase
            .from('userstable')
            .insert([{ id:  user.id, username: userName, useremail: userEmail, verified: false}]);
        }
        res.status(200).json({ message: signupResponse.data});
        
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
    
});

app.post('/signin', async (req: express.Request, res: express.Response) => {
    try{
        console.log("signin called");
        const {userEmail, password} = req.body;
        // console.log(userEmail, password);
        if( !userEmail || !password){
            res.status(422).json({message: "Incomplete Credentials"});
            return;
        }

        const signinresponse = await supabase.auth.signInWithPassword({ email: userEmail, password: password});
        if (signinresponse.error){
            res.status(400).json({message: signinresponse.error})
            return;
        }

        const user = signinresponse.data.user;
        
        res.status(200).json({ message: signinresponse.data});
    }catch(error){
        console.log(error);
        res.status(500).json(error);
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
